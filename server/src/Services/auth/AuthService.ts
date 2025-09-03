import { IAuthService } from "../../Domain/services/auth/IAuthService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { User } from "../../Domain/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IAuthChallengeRepository } from "../../Domain/repositories/auth/IAuthChallengeRepository";
import { IEmailService } from "../email/EmailService";
import { parseOptionalDate } from "../../utils/date/DateUtils";
import { IAuditService } from "../../Domain/services/audit/IAuditService";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 min
const MAX_ATTEMPTS = 5;


//STAVITI U HELPERS
const generateOtp6 = () => String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');

const maskEmail = (emailLike: string) => {
  const [name, domain] = emailLike.split('@');
  if (!domain) return emailLike.replace(/.(?=.{2})/g, '*');
  const maskedName = name.length <= 2
    ? name[0] + '*'
    : name[0] + '*'.repeat(Math.max(1, name.length - 2)) + name[name.length - 1];
  const [d1, ...rest] = domain.split('.');
  const maskedD1 = d1.length <= 2
    ? d1[0] + '*'
    : d1[0] + '*'.repeat(Math.max(1, d1.length - 2)) + d1[d1.length - 1];
  return `${maskedName}@${maskedD1}${rest.length ? '.' + rest.join('.') : ''}`;
};

export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private challengeRepo: IAuthChallengeRepository;
  private emailService: IEmailService;
  private audit: IAuditService;

  constructor(
    userRepository: IUserRepository,
    challengeRepo: IAuthChallengeRepository,
    emailService: IEmailService,
    audit: IAuditService
  ) {
    this.userRepository = userRepository;
    this.challengeRepo = challengeRepo;
    this.emailService = emailService;
    this.audit = audit;
  }

  //IZBACITI GRESKE
  async startLogin(korisnickoIme: string, lozinka: string): Promise<{ challengeId: string; expiresAt: string; maskedEmail: string }> {
    const user = await this.userRepository.getByUsername(korisnickoIme);
    if (user.id === 0) {
      await this.audit.log('Upozorenje', 'LOGIN_FAILED_BAD_CREDENTIALS', null, korisnickoIme);
      throw new Error("Invalid credentials");
    }

    const valid = await bcrypt.compare(lozinka, user.lozinka);
    if (!valid) {
      await this.audit.log('Upozorenje', 'LOGIN_FAILED_BAD_CREDENTIALS', user.id, user.korisnickoIme);
      throw new Error("Invalid credentials");
    }

    const code = generateOtp6();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    const challengeIdNum = await this.challengeRepo.create(user.id, codeHash, expiresAt);
    await this.emailService.sendOtp(user.korisnickoIme, code);

    await this.audit.log('Informacija', 'LOGIN_2FA_CODE_SENT', user.id, user.korisnickoIme, { challengeId: challengeIdNum });

    return {
      challengeId: String(challengeIdNum),
      expiresAt: expiresAt.toISOString(),
      maskedEmail: maskEmail(user.korisnickoIme),
    };
  }

  async verifyTwoFactor(challengeId: string, code: string): Promise<{ token: string }> {
    const id = Number(challengeId);
    if (!Number.isFinite(id)) throw new Error("Bad request");

    const challenge = await this.challengeRepo.getById(id);
    if (!challenge) throw new Error("Not found");

    const user = await this.userRepository.getById(challenge.userId);

    if (challenge.consumedAt) {
      await this.audit.log('Upozorenje', '2FA_ALREADY_USED', user.id || null, user.korisnickoIme || null, { challengeId: id });
      throw new Error("Already used");
    }
    if (challenge.expiresAt.getTime() < Date.now()) {
      await this.audit.log('Upozorenje', '2FA_EXPIRED', user.id || null, user.korisnickoIme || null, { challengeId: id });
      throw new Error("Expired");
    }
    if (challenge.attempts >= MAX_ATTEMPTS) {
      await this.audit.log('Upozorenje', '2FA_TOO_MANY_ATTEMPTS', user.id || null, user.korisnickoIme || null, { challengeId: id });
      throw new Error("Too many attempts");
    }

    const ok = await bcrypt.compare(code, challenge.codeHash);
    if (!ok) {
      await this.challengeRepo.incrementAttempts(id);
      await this.audit.log('Upozorenje', '2FA_INVALID_CODE', user.id || null, user.korisnickoIme || null, { challengeId: id });
      throw new Error("Invalid code");
    }

    await this.challengeRepo.markConsumed(id);

    if (user.id === 0) throw new Error("User not found");

    const token = jwt.sign(
      { id: user.id, korisnickoIme: user.korisnickoIme, uloga: user.uloga, blokiran: user.blokiran },
      process.env.JWT_SECRET ?? "",
      { expiresIn: '6h' }
    );

    await this.audit.log('Informacija', 'LOGIN_SUCCESS', user.id, user.korisnickoIme, { challengeId: id });

    return { token };
  }

  async resendTwoFactor(challengeId: string): Promise<{ challengeId: string; expiresAt: string }> {
    const id = Number(challengeId);
    if (!Number.isFinite(id)) throw new Error("Bad request");

    const prev = await this.challengeRepo.getById(id);
    if (!prev) throw new Error("Not found");
    if (prev.consumedAt) throw new Error("Already used");

    if (prev.expiresAt.getTime() > Date.now()) {
      throw new Error("Not expired");
    }

    const code = generateOtp6();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    const newId = await this.challengeRepo.create(prev.userId, codeHash, expiresAt);

    const user = await this.userRepository.getById(prev.userId);
    if (user.id === 0) throw new Error("User not found");

    await this.emailService.sendOtp(user.korisnickoIme, code);
    await this.audit.log('Informacija', '2FA_RESENT', user.id, user.korisnickoIme, { prevChallengeId: id, newChallengeId: newId });

    return { challengeId: String(newId), expiresAt: expiresAt.toISOString() };
  }

  async prijava(korisnickoIme: string, lozinka: string): Promise<User> {
    const user = await this.userRepository.getByUsername(korisnickoIme);
    if (user.id === 0) return new User();
    const valid = await bcrypt.compare(lozinka, user.lozinka);
    if (!valid) return new User();
    return user;
  }

  async registracija(
    korisnickoIme: string,
    uloga: string,
    lozinka: string,
    ime: string,
    prezime: string,
    datumRodjenja: string,
    pol: string
  ): Promise<User> {
    const exists = await this.userRepository.getByUsername(korisnickoIme);
    if (exists.id !== 0) {
      await this.audit.log('Upozorenje', 'REGISTER_CONFLICT_EXISTING_USER', exists.id, korisnickoIme);
      return new User();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(lozinka, salt);

    const dob = parseOptionalDate(datumRodjenja);

    const newUser = new User(
      0,
      korisnickoIme,
      hashedPassword,
      uloga,
      ime,
      prezime,
      dob,
      pol as "musko" | "zensko"
    );

    const created = await this.userRepository.create(newUser);
    if (created.id !== 0) {
      await this.audit.log('Informacija', 'REGISTER_SUCCESS', created.id, korisnickoIme);
    }
    return created;
  }
}
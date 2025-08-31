import { IAuthService } from "../../Domain/services/auth/IAuthService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { User } from "../../Domain/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IAuthChallengeRepository } from "../../Domain/repositories/auth/IAuthChallengeRepository";
import { IEmailService } from "../email/EmailService";
import { parseOptionalDate } from "../../utils/date/DateUtils";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 min
const MAX_ATTEMPTS = 5;

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

  constructor(userRepository: IUserRepository, challengeRepo: IAuthChallengeRepository, emailService: IEmailService) {
    this.userRepository = userRepository;
    this.challengeRepo = challengeRepo;
    this.emailService = emailService;
  }

  async startLogin(korisnickoIme: string, lozinka: string): Promise<{ challengeId: string; expiresAt: string; maskedEmail: string }> {
    const user = await this.userRepository.getByUsername(korisnickoIme);
    if (user.id === 0) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(lozinka, user.lozinka);
    if (!valid) throw new Error("Invalid credentials");

    const code = generateOtp6();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    const challengeIdNum = await this.challengeRepo.create(user.id, codeHash, expiresAt);

    await this.emailService.sendOtp(user.korisnickoIme, code);

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
    if (challenge.consumedAt) throw new Error("Already used");
    if (challenge.expiresAt.getTime() < Date.now()) throw new Error("Expired");
    if (challenge.attempts >= MAX_ATTEMPTS) throw new Error("Too many attempts");

    const ok = await bcrypt.compare(code, challenge.codeHash);
    if (!ok) {
      await this.challengeRepo.incrementAttempts(id);
      throw new Error("Invalid code");
    }

    await this.challengeRepo.markConsumed(id);

    const user = await this.userRepository.getById(challenge.userId);
    if (user.id === 0) throw new Error("User not found");

    const token = jwt.sign(
      { id: user.id, korisnickoIme: user.korisnickoIme, uloga: user.uloga, blokiran: user.blokiran },
      process.env.JWT_SECRET ?? "",
      { expiresIn: '6h' }
    );

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
    if (exists.id !== 0) return new User();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(lozinka, salt);

    const dob = parseOptionalDate(datumRodjenja); // null ako je nevalidan

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

    return await this.userRepository.create(newUser);
  }
}
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../Database/repositories/users/UserRepository';
import { User } from '../Domain/models/User';

async function run() {
  try {
    const email = process.env.ADMIN_EMAIL || 'biznispad@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'biznispad';
    const ime = process.env.ADMIN_IME || 'Miroslav';
    const prezime = process.env.ADMIN_PREZIME || 'Admincic';
    const pol = (process.env.ADMIN_POL as 'musko'|'zensko') || 'musko';

    if (!password) {
      console.error('ADMIN_PASSWORD nije postavljen u .env');
      process.exit(1);
    }

    const repo = new UserRepository();
    const exists = await repo.getByUsername(email);
    if (exists.id !== 0) {
      console.log('Admin već postoji:', email);
      process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    const admin = new User(0, email, hash, 'admin', ime, prezime, null, pol, false);
    const created = await repo.create(admin);
    if (created.id === 0) {
      console.error('Kreiranje admina nije uspelo.');
      process.exit(2);
    }
    console.log('Admin kreiran. ID:', created.id, 'Email:', email);
    process.exit(0);
  } catch (e) {
    console.error('Greška:', e);
    process.exit(2);
  }
}
run();
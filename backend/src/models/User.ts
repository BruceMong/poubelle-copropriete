import { db } from '../config/database';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  is_admin: number;
  created_at: string;
}

export interface UserPublic {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

export function createUser(email: string, password: string, name: string, isAdmin = false): User {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const stmt = db.prepare(
    'INSERT INTO users (email, password, name, is_admin) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(email, hashedPassword, name, isAdmin ? 1 : 0);
  return getUserById(result.lastInsertRowid as number)!;
}

export function getUserByEmail(email: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function getAllUsers(): User[] {
  const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
  return stmt.all() as User[];
}

export function deleteUser(id: number): boolean {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function verifyPassword(user: User, password: string): boolean {
  return bcrypt.compareSync(password, user.password);
}

export function toPublicUser(user: User): UserPublic {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    is_admin: user.is_admin === 1,
    created_at: user.created_at,
  };
}

export function ensureAdminExists(): void {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const existingAdmin = getUserByEmail(adminEmail);
  if (!existingAdmin) {
    const defaultPassword = 'admin123';
    createUser(adminEmail, defaultPassword, 'Administrateur', true);
    console.log(`Admin créé avec email: ${adminEmail} et mot de passe: ${defaultPassword}`);
    console.log('IMPORTANT: Changez ce mot de passe après la première connexion!');
  }
}

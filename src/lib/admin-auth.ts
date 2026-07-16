import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'syed_admin_session';
const MAX_AGE = 60 * 60 * 8;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'change-this-syed-store-session-secret';
}

function password() {
  return process.env.ADMIN_PASSWORD || 'SYEDstore';
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

export function verifyPassword(input: string) {
  const expected = Buffer.from(password());
  const actual = Buffer.from(input);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createAdminSession() {
  const issued = String(Date.now());
  const value = `${issued}.${sign(issued)}`;
  (await cookies()).set(COOKIE, value, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: MAX_AGE });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdminAuthenticated() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [issued, signature] = value.split('.');
  if (!issued || !signature || sign(issued) !== signature) return false;
  return Date.now() - Number(issued) < MAX_AGE * 1000;
}

import { describe, it, expect, beforeEach } from 'vitest';
import { hashIP, signToken, verifyToken } from './auth';

describe('hashIP', () => {
  beforeEach(() => {
    process.env.IP_SALT = 'test-salt';
  });

  it('returns a deterministic base36 hash', () => {
    const a = hashIP('192.168.1.1');
    const b = hashIP('192.168.1.1');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-z]+$/);
  });

  it('produces different hashes for different IPs', () => {
    expect(hashIP('1.2.3.4')).not.toBe(hashIP('5.6.7.8'));
  });
});

describe('signToken / verifyToken', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests';
  });

  it('round-trips a payload', () => {
    const token = signToken({ adminId: 'abc', username: 'admin' });
    const payload = verifyToken(token);
    expect(payload).toMatchObject({ adminId: 'abc', username: 'admin' });
  });

  it('returns null for invalid token', () => {
    expect(verifyToken('not-a-valid-token')).toBeNull();
  });
});

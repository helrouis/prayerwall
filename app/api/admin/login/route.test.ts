import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { POST } from './route';

const mockAdmin = {
  id: 'admin-1',
  username: 'admin',
  passwordHash: bcrypt.hashSync('secret123', 4),
};

const mockSql = vi.fn(() => [mockAdmin]);

vi.mock('@/lib/db', () => ({
  getDB: vi.fn(() => mockSql),
}));

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret';
    mockSql.mockImplementation(() => [mockAdmin]);
  });

  it('returns a JWT for valid credentials', async () => {
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'secret123' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.token).toBeTruthy();
  });

  it('rejects missing credentials', async () => {
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('rejects invalid credentials', async () => {
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrong' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('rejects unknown user', async () => {
    mockSql.mockImplementationOnce(() => []);
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'nobody', password: 'secret123' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(401);
  });
});

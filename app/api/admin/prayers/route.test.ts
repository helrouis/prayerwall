import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { signToken } from '@/lib/auth';
import { GET, PATCH, DELETE } from './route';

const mockPrayers = [{ id: '1', title: 'Pending', status: 'pending' }];
const mockSql = vi.fn(() => mockPrayers);

vi.mock('@/lib/db', () => ({
  getDB: vi.fn(() => mockSql),
}));

function authHeader() {
  const token = signToken({ adminId: 'admin-1', username: 'admin' });
  return { Authorization: `Bearer ${token}` };
}

describe('/api/admin/prayers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret';
    mockSql.mockImplementation(() => mockPrayers);
  });

  describe('GET', () => {
    it('requires authentication', async () => {
      const req = new NextRequest('http://localhost/api/admin/prayers?status=pending');
      const response = await GET(req);
      expect(response.status).toBe(401);
    });

    it('returns prayers for authenticated admin', async () => {
      const req = new NextRequest('http://localhost/api/admin/prayers?status=pending', {
        headers: authHeader(),
      });
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.prayers).toHaveLength(1);
    });
  });

  describe('PATCH', () => {
    it('requires authentication', async () => {
      const req = new NextRequest('http://localhost/api/admin/prayers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: '1', status: 'approved' }),
      });
      expect((await PATCH(req)).status).toBe(401);
    });

    it('updates status when authenticated', async () => {
      const req = new NextRequest('http://localhost/api/admin/prayers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ id: '1', status: 'approved' }),
      });
      const response = await PATCH(req);
      expect(response.status).toBe(200);
      expect(mockSql).toHaveBeenCalled();
    });

    it('updates isAnswered and answeredStory', async () => {
      const req = new NextRequest('http://localhost/api/admin/prayers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ id: '1', isAnswered: true, answeredStory: 'God provided.' }),
      });
      const response = await PATCH(req);
      expect(response.status).toBe(200);
    });

    it('requires id', async () => {
      const req = new NextRequest('http://localhost/api/admin/prayers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ status: 'approved' }),
      });
      expect((await PATCH(req)).status).toBe(400);
    });
  });

  describe('DELETE', () => {
    it('requires authentication', async () => {
      const req = new NextRequest('http://localhost/api/admin/prayers?id=1');
      expect((await DELETE(req)).status).toBe(401);
    });

    it('deletes prayer when authenticated', async () => {
      const req = new NextRequest('http://localhost/api/admin/prayers?id=1', {
        headers: authHeader(),
      });
      const response = await DELETE(req);
      expect(response.status).toBe(200);
    });

    it('requires id', async () => {
      const req = new NextRequest('http://localhost/api/admin/prayers', {
        headers: authHeader(),
      });
      expect((await DELETE(req)).status).toBe(400);
    });
  });
});

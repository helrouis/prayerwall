import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

const mockBegin = vi.fn(async (fn: (sql: typeof mockSql) => Promise<void>) => fn(mockSql));
const mockSql = vi.fn(() => []);
Object.assign(mockSql, { begin: mockBegin });

vi.mock('@/lib/db', () => ({
  getDB: vi.fn(() => mockSql),
}));

vi.mock('@/lib/auth', () => ({
  hashIP: vi.fn(() => 'hashed-ip'),
}));

function makeRequest(id: string, ip = '1.2.3.4') {
  return new NextRequest(new URL(`http://localhost/api/prayers/${id}/pray`), {
    method: 'POST',
    headers: { 'x-forwarded-for': ip },
  });
}

describe('POST /api/prayers/[id]/pray', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSql.mockImplementation(() => []);
    mockBegin.mockImplementation(async (fn) => fn(mockSql));
  });

  it('increments prayer count for new IP', async () => {
    const response = await POST(makeRequest('prayer-1'), { params: Promise.resolve({ id: 'prayer-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockBegin).toHaveBeenCalled();
  });

  it('returns already prayed for duplicate IP', async () => {
    mockSql.mockImplementationOnce(() => [{ id: 'existing-reaction' }]);

    const response = await POST(makeRequest('prayer-1'), { params: Promise.resolve({ id: 'prayer-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toMatch(/already/i);
    expect(mockBegin).not.toHaveBeenCalled();
  });

  it('returns 500 on database error', async () => {
    mockSql.mockImplementationOnce(() => {
      throw new Error('db down');
    });

    const response = await POST(makeRequest('prayer-1'), { params: Promise.resolve({ id: 'prayer-1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toMatch(/record/i);
  });
});

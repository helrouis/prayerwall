import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

const sampleRow = { id: 'new-prayer-id' };

const mockSql = vi.fn(() => [sampleRow]);

vi.mock('@/lib/db', () => ({
  getDB: vi.fn(() => mockSql),
}));

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url), init);
}

function makePost(body: object, ip = '10.0.0.1') {
  return makeRequest('http://localhost/api/prayers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  title: 'Please pray',
  body: 'Need healing',
  category: 'Health',
  isAnonymous: true,
  firstName: '',
  email: '',
  agreed: true,
};

describe('GET /api/prayers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSql.mockImplementation(() => [{
      id: '1',
      title: 'Test Prayer',
      body: 'This is a test prayer body.',
      firstName: 'John',
      isAnonymous: false,
      category: 'Thanksgiving',
      createdAt: new Date().toISOString(),
      prayerCount: 10,
      isAnswered: false,
    }]);
  });

  it('should return approved prayers', async () => {
    const response = await GET(makeRequest('http://localhost/api/prayers'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.prayers).toHaveLength(1);
    expect(data.prayers[0].title).toBe('Test Prayer');
    expect(mockSql).toHaveBeenCalled();
  });

  it('should filter prayers by category', async () => {
    const response = await GET(makeRequest('http://localhost/api/prayers?category=Health'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.prayers).toHaveLength(1);
    expect(mockSql).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining("AND category="),
      ]),
      'Health',
    );
  });

  it('should return an empty array if no prayers are found', async () => {
    mockSql.mockImplementationOnce(() => []);

    const response = await GET(makeRequest('http://localhost/api/prayers'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.prayers).toHaveLength(0);
  });

  it('should handle database errors', async () => {
    mockSql.mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });

    const response = await GET(makeRequest('http://localhost/api/prayers'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.prayers).toHaveLength(0);
  });
});

describe('POST /api/prayers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSql.mockImplementation(() => [sampleRow]);
  });

  it('creates a pending prayer with valid input', async () => {
    const response = await POST(makePost(validBody));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe('new-prayer-id');
    expect(mockSql).toHaveBeenCalled();
  });

  it('rejects missing title or body', async () => {
    const response = await POST(makePost({ ...validBody, title: '  ' }, `missing-title-${Date.now()}`));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/required/i);
  });

  it('rejects invalid category', async () => {
    const response = await POST(makePost({ ...validBody, category: 'Invalid' }, `invalid-cat-${Date.now()}`));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/category/i);
  });

  it('rejects when consent not given', async () => {
    const response = await POST(makePost({ ...validBody, agreed: false }, `no-consent-${Date.now()}`));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/agree/i);
  });

  it('rate limits after 3 submissions per IP per hour', async () => {
    const ip = `rate-limit-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      const res = await POST(makePost(validBody, ip));
      expect(res.status).toBe(201);
    }
    const blocked = await POST(makePost(validBody, ip));
    const data = await blocked.json();
    expect(blocked.status).toBe(429);
    expect(data.error).toMatch(/too many/i);
  });

  it('returns 500 on database error', async () => {
    mockSql.mockImplementationOnce(() => {
      throw new Error('insert failed');
    });
    const response = await POST(makePost(validBody, `err-${Date.now()}`));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toMatch(/save/i);
  });
});

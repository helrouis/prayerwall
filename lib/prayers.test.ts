import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getApprovedPrayers, getApprovedPrayerById, getWallStats } from './prayers';

const samplePrayer = {
  id: '1',
  title: 'Test Prayer',
  body: 'Body text',
  firstName: 'John',
  isAnonymous: false,
  category: 'Health',
  createdAt: new Date().toISOString(),
  prayerCount: 5,
  isAnswered: false,
};

const mockSql = vi.fn(() => [samplePrayer]);

vi.mock('@/lib/db', () => ({
  getDB: vi.fn(() => mockSql),
}));

describe('getApprovedPrayers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSql.mockImplementation(() => [samplePrayer]);
  });

  it('returns all approved prayers when no category', async () => {
    const prayers = await getApprovedPrayers();
    expect(prayers).toHaveLength(1);
    expect(prayers[0].title).toBe('Test Prayer');
    expect(mockSql).toHaveBeenCalled();
  });

  it('filters by category when provided', async () => {
    await getApprovedPrayers('Health');
    expect(mockSql).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining("AND category="),
      ]),
      'Health',
    );
  });

  it('does not filter when category is All', async () => {
    await getApprovedPrayers('All');
    const call = mockSql.mock.calls[0];
    expect(call[0].join('')).not.toContain('AND category=');
  });
});

describe('getApprovedPrayerById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSql.mockImplementation(() => [samplePrayer]);
  });

  it('returns a prayer when found', async () => {
    const prayer = await getApprovedPrayerById('1');
    expect(prayer?.id).toBe('1');
  });

  it('returns null when not found', async () => {
    mockSql.mockImplementationOnce(() => []);
    const prayer = await getApprovedPrayerById('missing');
    expect(prayer).toBeNull();
  });
});

describe('getWallStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSql.mockImplementation(() => [{
      totalPrayers: 10,
      totalPrayed: 100,
      answeredCount: 3,
    }]);
  });

  it('returns aggregated stats', async () => {
    const stats = await getWallStats();
    expect(stats).toEqual({
      totalPrayers: 10,
      totalPrayed: 100,
      answeredCount: 3,
    });
  });

  it('returns zeros when no rows', async () => {
    mockSql.mockImplementationOnce(() => []);
    const stats = await getWallStats();
    expect(stats).toEqual({
      totalPrayers: 0,
      totalPrayed: 0,
      answeredCount: 0,
    });
  });
});

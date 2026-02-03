import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getRedis } from '@/lib/redis';

export const runtime = 'nodejs';

const KEY = 'snake:leaderboard';
const MAX_ENTRIES = 500;
const NICKNAME_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.[A-Z0-9]{3}$/;

const isValidNickname = (nickname: string) => {
  if (!NICKNAME_REGEX.test(nickname)) return false;
  const parts = nickname.split('.');
  if (parts.length !== 4) return false;
  return parts.slice(0, 3).every(part => {
    const value = Number(part);
    return Number.isInteger(value) && value >= 0 && value <= 999;
  });
};

const parseLimit = (value: string | null) => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 5;
  return Math.min(parsed, 20);
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get('limit'));
    const redis = await getRedis();
    const rows = await redis.zRangeWithScores(KEY, 0, limit - 1, { REV: true });
    const entries = rows
      .map(row => {
        try {
          const parsed = JSON.parse(row.value) as {
            nick?: string;
            score?: number;
            ts?: number;
          };
          if (!parsed?.nick) return null;
          return {
            nick: parsed.nick,
            score: Number.isFinite(parsed.score) ? parsed.score : Math.floor(row.score),
            ts: Number.isFinite(parsed.ts) ? parsed.ts : 0,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Leaderboard GET failed', error);
    return NextResponse.json({ entries: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const score = Number(body?.score);
    const nick = typeof body?.nick === 'string' ? body.nick : '';

    if (!Number.isInteger(score) || score <= 0) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }

    if (!isValidNickname(nick)) {
      return NextResponse.json({ error: 'Invalid nickname' }, { status: 400 });
    }

    const redis = await getRedis();
    const ts = Date.now();
    const entry = {
      id: randomUUID(),
      nick,
      score,
      ts,
    };
    const zScore = score + ts / 1e13;

    await redis.zAdd(KEY, [{ score: zScore, value: JSON.stringify(entry) }]);

    const total = await redis.zCard(KEY);
    if (total > MAX_ENTRIES) {
      await redis.zRemRangeByRank(KEY, 0, total - MAX_ENTRIES - 1);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Leaderboard POST failed', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

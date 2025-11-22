const IDEMPOTENT_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export type IdempotencyRecord<Result> = {
  status: number;
  body: Result;
  headers?: Record<string, string>;
};

export interface IdempotencyStore<Result> {
  get(key: string): Promise<IdempotencyRecord<Result> | null>;
  set(key: string, record: IdempotencyRecord<Result>, ttlMs: number): Promise<void>;
}

/**
 * Wraps a handler with Idempotency-Key enforcement.
 * - Rejects unsafe requests without the header.
 * - Replays cached responses when the same key is reused.
 * - Stores successful responses for 24h (customizable via `ttlMs`).
 */
export async function withIdempotency<Result>(
  req: Request,
  store: IdempotencyStore<Result>,
  handler: () => Promise<IdempotencyRecord<Result>>,
  options: { ttlMs?: number } = {}
): Promise<IdempotencyRecord<Result>> {
  const method = req.method.toUpperCase();
  if (!IDEMPOTENT_METHODS.has(method)) {
    return handler();
  }

  const headerKey = req.headers.get('Idempotency-Key')?.trim();
  if (!headerKey) {
    throw new Response(JSON.stringify({ error: { code: 'Validation', message: 'Missing Idempotency-Key header.' } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cacheKey = `idem:${method}:${headerKey}`;
  const cached = await store.get(cacheKey);
  if (cached) {
    return {
      ...cached,
      headers: {
        ...(cached.headers ?? {}),
        'Idempotency-Key': headerKey,
        'X-Idempotency-Result': 'replayed',
      },
    };
  }

  const result = await handler();
  await store.set(cacheKey, result, options.ttlMs ?? 1000 * 60 * 60 * 24);

  return {
    ...result,
    headers: {
      ...(result.headers ?? {}),
      'Idempotency-Key': headerKey,
      'X-Idempotency-Result': 'created',
    },
  };
}

/**
 * In production, pass an Upstash Redis client here. For the showcase repo we expose
 * a memory-backed store to keep the snippet self-contained.
 */
export function createInMemoryStore<Result>(): IdempotencyStore<Result> {
  const map = new Map<string, { record: IdempotencyRecord<Result>; expiresAt: number }>();

  return {
    async get(key) {
      const entry = map.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) {
        map.delete(key);
        return null;
      }
      return entry.record;
    },
    async set(key, record, ttlMs) {
      map.set(key, { record, expiresAt: Date.now() + ttlMs });
    },
  };
}

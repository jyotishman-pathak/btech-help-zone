const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const record = store.get(key);

  if (!record || record.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (record.count >= limit) return false; // blocked

  record.count++;
  return true; // allowed
}

// Usage in any API route:
// const allowed = rateLimit(`submit_${userId}`, 5, 60_000); // 5 per minute
// if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
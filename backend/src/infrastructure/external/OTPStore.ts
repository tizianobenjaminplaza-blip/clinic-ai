/**
 * In-memory OTP store with TTL.
 * Production: swap for Redis with `SET key value EX 300`.
 */
interface OTPEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

const store = new Map<string, OTPEntry>();

const TTL_MS = 5 * 60 * 1000;   // 5 minutes
const MAX_ATTEMPTS = 5;

export const otpStore = {
  set(email: string, code: string): void {
    store.set(email.toLowerCase(), {
      code,
      expiresAt: Date.now() + TTL_MS,
      attempts: 0,
    });
  },

  verify(email: string, code: string): 'ok' | 'expired' | 'invalid' | 'max_attempts' {
    const entry = store.get(email.toLowerCase());
    if (!entry) return 'expired';
    if (Date.now() > entry.expiresAt) { store.delete(email.toLowerCase()); return 'expired'; }
    if (entry.attempts >= MAX_ATTEMPTS) return 'max_attempts';

    entry.attempts++;
    if (entry.code !== code) return 'invalid';

    store.delete(email.toLowerCase());
    return 'ok';
  },

  // Cleanup expired entries (call on a slow interval — not critical)
  purge(): void {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.expiresAt) store.delete(key);
    }
  },
};

setInterval(() => otpStore.purge(), 10 * 60 * 1000);

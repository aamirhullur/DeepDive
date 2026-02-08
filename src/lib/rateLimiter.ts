import redis from './redis';

export class RateLimiter {
    private readonly maxRequests: number;

    constructor(maxRequests: number = 3) { // Default: 3 requests per day
        this.maxRequests = maxRequests;
    }

    private getTodayKey(visitorId: string): string {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        return `rate_limit:${visitorId}:${today}`;
    }

    private getSecondsUntilMidnight(): number {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // Next midnight
        return Math.floor((midnight.getTime() - now.getTime()) / 1000);
    }

    async checkAndIncrementUsage(visitorId: string): Promise<{ allowed: boolean; remaining: number; timeUntilReset: number }> {
        const key = this.getTodayKey(visitorId);
        const count = await redis.incr(key);

        // Set expiry to midnight on first request of the day
        if (count === 1) {
            const secondsUntilMidnight = this.getSecondsUntilMidnight();
            await redis.expire(key, secondsUntilMidnight);
        }

        const allowed = count <= this.maxRequests;
        const remaining = Math.max(0, this.maxRequests - count);
        const timeUntilReset = this.getSecondsUntilMidnight();

        return { allowed, remaining, timeUntilReset };
    }

    async getRemainingAttempts(visitorId: string): Promise<number> {
        const key = this.getTodayKey(visitorId);
        const count = await redis.get(key);
        return Math.max(0, this.maxRequests - (count ? parseInt(count) : 0));
    }

    async getTimeUntilReset(visitorId: string): Promise<number> {
        return this.getSecondsUntilMidnight();
    }
}
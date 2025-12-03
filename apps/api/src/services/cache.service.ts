import Redis from 'ioredis';

class CacheService {
    private redis: Redis | null = null;
    private memoryCache: Map<string, { value: any; expiry: number }> = new Map();
    private useRedis: boolean = false;

    constructor() {
        if (process.env.REDIS_URL) {
            this.redis = new Redis(process.env.REDIS_URL);
            this.useRedis = true;
            console.log('CacheService: Using Redis');

            this.redis.on('error', (err) => {
                console.error('Redis error:', err);
                this.useRedis = false; // Fallback on error
            });
        } else {
            console.log('CacheService: Using In-Memory Cache');
        }
    }

    async get<T>(key: string): Promise<T | null> {
        if (this.useRedis && this.redis) {
            try {
                const data = await this.redis.get(key);
                return data ? JSON.parse(data) : null;
            } catch (error) {
                console.error('Cache get error:', error);
                return this.getFromMemory(key);
            }
        }
        return this.getFromMemory(key);
    }

    async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
        if (this.useRedis && this.redis) {
            try {
                await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
                return;
            } catch (error) {
                console.error('Cache set error:', error);
            }
        }
        this.setInMemory(key, value, ttlSeconds);
    }

    async del(key: string): Promise<void> {
        if (this.useRedis && this.redis) {
            try {
                await this.redis.del(key);
            } catch (error) {
                console.error('Cache del error:', error);
            }
        }
        this.memoryCache.delete(key);
    }

    private getFromMemory<T>(key: string): T | null {
        const item = this.memoryCache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.memoryCache.delete(key);
            return null;
        }

        return item.value;
    }

    private setInMemory(key: string, value: any, ttlSeconds: number) {
        this.memoryCache.set(key, {
            value,
            expiry: Date.now() + ttlSeconds * 1000
        });

        // Simple cleanup to prevent memory leaks in dev
        if (this.memoryCache.size > 1000) {
            const firstKey = this.memoryCache.keys().next().value;
            if (firstKey) this.memoryCache.delete(firstKey);
        }
    }
}

export const cacheService = new CacheService();

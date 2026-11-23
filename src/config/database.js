const redis = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// If using Upstash (rediss://), enable TLS explicitly
let socketOptions;
if (redisUrl.startsWith('rediss://')) {
    const { hostname } = new URL(redisUrl);
    socketOptions = {
        tls: true,
        rejectUnauthorized: false,
        servername: hostname
    };
}

// Redis client setup
const redisClient = redis.createClient({
    url: redisUrl,
    socket: socketOptions
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Redis connection established');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        process.exit(1);
    }
};

module.exports = { redisClient, connectRedis };

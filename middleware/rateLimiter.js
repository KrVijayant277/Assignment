import { rateLimit } from 'express-rate-limit';

// Create rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: (req, res) => {
        return {
            error: 'Too many requests',
            message: `Rate limit exceeded, try again later`,
        };
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export default limiter; 
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors.js';

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new AuthenticationError('Authentication required');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (jwtError) {
            throw new AuthenticationError('Invalid token', { original: jwtError.message });
        }
    } catch (error) {
        next(error);
    }
};

export default auth; 
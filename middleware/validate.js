import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().reduce((acc, error) => {
      const field = error.path;
      acc[field] = acc[field] || [];
      acc[field].push(error.msg);
      return acc;
    }, {});
    
    throw new ValidationError('Validation failed', errorDetails);
  }
  
  next();
};

export default validate; 
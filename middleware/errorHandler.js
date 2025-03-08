// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error encountered:', err);
  
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorDetails = err.details || {};
  
  // Determine if we should show detailed error info based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Handle specific error types
  if (err.type === 'ValidationError') {
    statusCode = 400;
  } else if (err.type === 'AuthenticationError') {
    statusCode = 401;
  } else if (err.type === 'ForbiddenError') {
    statusCode = 403;
  } else if (err.type === 'NotFoundError') {
    statusCode = 404;
  }
  
  // Send response
  res.status(statusCode).json({
    error: message,
    ...(isProduction ? {} : { details: errorDetails, stack: err.stack })
  });
};

export default errorHandler; 
/**
 * Central Error Handling Middleware
 * Ensures sensitive database connection strings, credentials, or internal stack traces
 * are never exposed to clients or in public API responses.
 */

function errorHandler(err, req, res, next) {
  // Log error internally for server debugging
  console.error('[CareCompass API Error]:', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Determine appropriate HTTP status code
  let statusCode = 500;
  if (err.statusCode && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
  } else if (err.status && typeof err.status === 'number') {
    statusCode = err.status;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
  }

  // Safe client response
  const response = {
    success: false,
    error: statusCode === 500
      ? 'An internal error occurred while processing healthcare directory data. Please try again later.'
      : err.message
  };

  res.status(statusCode).json(response);
}

module.exports = errorHandler;

import ApiError from '../utils/api-error.js';

export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Get all errors, not just the first
      stripUnknown: true, // Remove unknown fields
      convert: true, // Convert types automatically
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      throw ApiError.validation('Validation failed', errors);
    }

    // Replace request data with validated and sanitized data
    req[property] = value;
    next();
  };
};

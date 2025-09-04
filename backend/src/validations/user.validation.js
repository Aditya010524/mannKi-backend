import Joi from 'joi';

const userValidation = {
  // PUT /me -> Update Profile
  updateProfile: Joi.object({
    displayName: Joi.string().min(1).max(50).trim().optional().messages({
      'string.max': 'Display name cannot exceed 50 characters',
    }),

    bio: Joi.string().max(160).allow('').optional().messages({
      'string.max': 'Bio cannot exceed 160 characters',
    }),

    avatar: Joi.string()
      .uri()
      .allow('')
      .optional()
      .regex(/\.(jpg|jpeg|png|gif|webp)$/i)
      .messages({
        'string.uri': 'Avatar must be a valid URL',
        'string.pattern.base': 'Avatar must be an image (jpg, jpeg, png, gif, webp)',
      }),

    coverPhoto: Joi.string()
      .uri()
      .allow('')
      .optional()
      .regex(/\.(jpg|jpeg|png|gif|webp)$/i)
      .messages({
        'string.uri': 'Cover photo must be a valid URL',
        'string.pattern.base': 'Cover photo must be an image (jpg, jpeg, png, gif, webp)',
      }),

    location: Joi.string().max(30).allow('').optional().messages({
      'string.max': 'Location cannot exceed 30 characters',
    }),

    website: Joi.string()
      .uri({ scheme: [/https?/] }) // must start with http or https
      .allow('')
      .optional()
      .messages({
        'string.uri': 'Please provide a valid website URL (must include http:// or https://)',
      }),

    dateOfBirth: Joi.date()
      .iso() // enforce ISO 8601 format
      .max('now') // must not be in the future
      .optional()
      .messages({
        'date.format': 'Date of birth must be in YYYY-MM-DD format',
        'date.iso': 'Date of birth must be in YYYY-MM-DD format',
        'date.max': 'Date of birth cannot be in the future',
      }),

    isPrivate: Joi.boolean().optional(),
  }).min(1), // At least one field required

  // PUT /me/username -> Update Username
  updateUsername: Joi.object({
    username: Joi.string()
      .min(3)
      .max(20)
      .pattern(/^[a-z0-9_]+$/)
      .lowercase()
      .required()
      .messages({
        'string.pattern.base':
          'Username can only contain lowercase letters, numbers, and underscores',
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username cannot exceed 20 characters',
        'any.required': 'Username is required',
      }),

    password: Joi.string().required().messages({
      'any.required': 'Current password is required for verification',
    }),
  }),

  // PUT /me/email -> Update Username
  updateEmail: Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
      'string.email': 'Please provide a valid email address',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Current password is required for verification',
    }),
  }),

  // PUT /me/changepassword -> Change Password
  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),

    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'New password must be at least 6 characters',
      'any.required': 'New password is required',
    }),

    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Passwords do not match',
    }),
  }),

  // DELETE /delte -> Delete Account
  deleteAccount: Joi.object({
    password: Joi.string().required().messages({
      'any.required': 'Password is required to delete account',
    }),

    confirmDelete: Joi.string().valid('DELETE').required().messages({
      'any.only': 'Please type DELETE to confirm account deletion',
      'any.required': 'Confirmation is required',
    }),
  }),
};

export default userValidation;

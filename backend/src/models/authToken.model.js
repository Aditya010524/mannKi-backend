import mongoose from 'mongoose';

const authTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true,
      select: false, // Don't expose token in queries
    },

    tokenId: {
      type: String,
      required: function () {
        return this.type === 'refresh';
      },
    },

    type: {
      type: String,
      enum: ['refresh', 'access', 'email_verification', 'password_reset'],
      required: [true, 'Token type is required'],
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: { expireAfterSeconds: 0 }, // MongoDB TTL - auto cleanup
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    deviceInfo: {
      userAgent: String,
      ip: String,
      deviceName: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound indexes for better query performance
authTokenSchema.index({ userId: 1, type: 1, isActive: 1 });
authTokenSchema.index({ token: 1, type: 1, isActive: 1 });

// CRITICAL: Sparse unique index for tokenId
authTokenSchema.index(
  { tokenId: 1 },
  {
    unique: true,
    sparse: true,
    name: 'tokenId_sparse_unique',
  }
);

// Instance methods (logout) -> revoke a single token
authTokenSchema.methods.revoke = function () {
  this.isActive = false;
  this.revokedAt = new Date();
  return this.save();
};

// Static method to find active token
authTokenSchema.statics.findActiveToken = function (token, type) {
  return this.findOne({
    token,
    type,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).select('+token');
};

// Static method to revoke all tokens for a user
authTokenSchema.statics.revokeUserTokens = function (userId, type = null) {
  const query = { userId, isActive: true };
  if (type) query.type = type;

  return this.updateMany(query, {
    $set: {
      isActive: false,
      revokedAt: new Date(),
    },
  });
};

const AuthToken = mongoose.model('AuthToken', authTokenSchema);

export default AuthToken;

import mongoose from 'mongoose';

const userSessionSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  username: { type: String, required: true },
  token: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  lastActivity: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true
});

// Índice TTL para expiração automática
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
userSessionSchema.index({ userId: 1 });
userSessionSchema.index({ token: 1 });

export default mongoose.model('UserSession', userSessionSchema);
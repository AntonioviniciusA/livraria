import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  collectionName: { type: String, required: true },
  documentId: { type: String, required: true },
  operation: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE'], required: true },
  oldData: { type: Object },
  newData: { type: Object },
  userId: { type: String },
  userIp: { type: String },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Índices para performance
auditLogSchema.index({ collectionName: 1, documentId: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
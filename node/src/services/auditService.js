import AuditLog from '../models/mongodb/AuditLog.js';

export class AuditService {
  static async logAction(collectionName, documentId, operation, oldData, newData, userId, userIp) {
    try {
      await AuditLog.create({
        collectionName,
        documentId,
        operation,
        oldData,
        newData,
        userId,
        userIp
      });
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error);
    }
  }

  static async getLogs(collectionName, documentId, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      const query = {};
      
      if (collectionName) query.collectionName = collectionName;
      if (documentId) query.documentId = documentId;

      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await AuditLog.countDocuments(query);

      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      throw error;
    }
  }
}
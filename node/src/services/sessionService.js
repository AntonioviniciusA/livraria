import UserSession from '../models/mongodb/UserSession.js';

export class SessionService {
  static async createSession(userId, username, token, ipAddress = '', userAgent = '') {
    try {
      // Expira em 8 horas
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
      
      await UserSession.create({
        userId,
        username,
        token,
        ipAddress,
        userAgent,
        expiresAt
      });
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
    }
  }

  static async validateSession(token) {
    try {
      const session = await UserSession.findOne({ token }).lean();
      return session && new Date(session.expiresAt) > new Date();
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      return false;
    }
  }

  static async updateSessionActivity(token) {
    try {
      await UserSession.findOneAndUpdate(
        { token },
        { lastActivity: new Date() }
      );
    } catch (error) {
      console.error('Erro ao atualizar atividade da sessão:', error);
    }
  }

  static async logoutSession(token) {
    try {
      await UserSession.deleteOne({ token });
    } catch (error) {
      console.error('Erro ao fazer logout da sessão:', error);
    }
  }

  static async getUserSessions(userId) {
    try {
      return await UserSession.find({ userId }).lean();
    } catch (error) {
      console.error('Erro ao buscar sessões do usuário:', error);
      return [];
    }
  }
}
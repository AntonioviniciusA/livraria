import BookCache from '../models/mongodb/BookCache.js';

export class CacheService {
  static async cacheBook(bookData) {
    try {
      await BookCache.findOneAndUpdate(
        { bookId: bookData.id },
        {
          title: bookData.titulo,
          isbn: bookData.isbn,
          price: bookData.preco,
          publisher: bookData.editora_nome,
          category: bookData.categoria_nome,
          stock: bookData.quantidade || 0,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Erro ao fazer cache do livro:', error);
    }
  }

  static async getCachedBook(bookId) {
    try {
      return await BookCache.findOne({ bookId }).lean();
    } catch (error) {
      console.error('Erro ao buscar livro em cache:', error);
      return null;
    }
  }

  static async updateBookSales(bookId, quantity) {
    try {
      await BookCache.findOneAndUpdate(
        { bookId },
        { 
          $inc: { salesCount: quantity },
          lastUpdated: new Date()
        }
      );
    } catch (error) {
      console.error('Erro ao atualizar vendas do livro:', error);
    }
  }

  static async getTopSellingBooks(limit = 10) {
    try {
      return await BookCache.find()
        .sort({ salesCount: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Erro ao buscar livros mais vendidos:', error);
      return [];
    }
  }
}
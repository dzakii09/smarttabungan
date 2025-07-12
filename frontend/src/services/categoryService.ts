import api from '../api';
import { Category } from '../types';

class CategoryService {
  // Get all categories
  async getAll(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  }
}

export const categoryService = new CategoryService(); 
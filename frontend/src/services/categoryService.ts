import api from '../api';
import { Category } from '../types';

class CategoryService {
  private baseUrl = '/api/categories';

  // Get all categories
  async getAll(): Promise<Category[]> {
    const response = await api.get(this.baseUrl);
    return (response.data as any).data;
  }
}

export const categoryService = new CategoryService(); 
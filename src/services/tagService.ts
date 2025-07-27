import ApiService from './api';
import {
  Tag,
  TagCreate,
  TagUpdate,
} from '../types';

class TagService {
  async getTags(category?: string): Promise<Tag[]> {
    const params = category ? { category } : undefined;
    return ApiService.get<Tag[]>('/tags/', params);
  }

  async getTag(id: number): Promise<Tag> {
    return ApiService.get<Tag>(`/tags/${id}`);
  }

  async createTag(data: TagCreate): Promise<Tag> {
    return ApiService.post<Tag>('/tags/', data);
  }

  async updateTag(id: number, data: TagUpdate): Promise<Tag> {
    return ApiService.put<Tag>(`/tags/${id}`, data);
  }

  async deleteTag(id: number): Promise<void> {
    return ApiService.delete<void>(`/tags/${id}`);
  }

  async getTagCategories(): Promise<string[]> {
    return ApiService.get<string[]>('/tags/categories/');
  }
}

const tagService = new TagService();
export default tagService;

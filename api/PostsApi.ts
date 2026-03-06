import { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiUrls } from '../constants/api/apiUrls';
import { Post } from '../types/api/Post';

type ApiResult = { response: APIResponse; body: Post };

export class PostsApi {
  constructor(private readonly request: APIRequestContext) {}

  async createPost(data: Omit<Post, 'id'>): Promise<ApiResult> {
    const response = await this.request.post(ApiUrls.posts, { data });
    const body: Post = await response.json();
    return { response, body };
  }

  async getPost(id: number): Promise<ApiResult> {
    const response = await this.request.get(ApiUrls.post(id));
    const body: Post = await response.json();
    return { response, body };
  }

  async updatePost(id: number, data: Partial<Omit<Post, 'id'>>): Promise<ApiResult> {
    const response = await this.request.patch(ApiUrls.post(id), { data });
    const body: Post = await response.json();
    return { response, body };
  }

  async deletePost(id: number): Promise<APIResponse> {
    return this.request.delete(ApiUrls.post(id));
  }
}

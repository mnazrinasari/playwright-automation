import { test as base } from '@playwright/test';
import { PostsApi } from '../api/PostsApi';

type ApiFixtures = {
  postsApi: PostsApi;
};

export const test = base.extend<ApiFixtures>({
  postsApi: async ({ playwright }, use) => {
    const apiContext = await playwright.request.newContext({
      baseURL: 'https://jsonplaceholder.typicode.com',
      extraHTTPHeaders: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });
    await use(new PostsApi(apiContext));
    await apiContext.dispose();
  },
});

export { expect } from '@playwright/test';

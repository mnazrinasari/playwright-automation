import { test, expect } from '../../fixtures/apiFixtures';
import postData from '../../test-data/api/post.json';
import { assertPostSchema, assertPostData, assertEmptyPostResponse } from '../../utils/api/apiAssertions';

let createdPostId: number;

test.describe('JSONPlaceholder - Posts CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  let apiLog: { status: number; body: unknown };

  test.afterEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'API Response',
      description: JSON.stringify(apiLog, null, 2),
    });
  });

  test('TC001-Create - should create a new post and return the created resource', { tag: ['@api'] }, async ({ postsApi }) => {
    const { response, body } = await postsApi.createPost(postData.create);
    apiLog = { status: response.status(), body };

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toContain('application/json');
    assertPostSchema(body);
    assertPostData(body, postData.create);

    createdPostId = body.id!;
  });

  test('TC002-Read - should return 404 for a non-persisted post (JSONPlaceholder simulation)', { tag: ['@api'] }, async ({ postsApi }) => {
    // JSONPlaceholder does not persist POSTed data — GET on created id returns 404 by design.
    const { response, body } = await postsApi.getPost(createdPostId);
    apiLog = { status: response.status(), body };

    expect(response.status()).toBe(404);
    expect(body).toEqual({});
  });

  test('TC003-Read Seeded - should return an existing post from JSONPlaceholder dummy data', { tag: ['@api'] }, async ({ postsApi }) => {
    const { response, body } = await postsApi.getPost(postData.seededPostId);
    apiLog = { status: response.status(), body };

    expect(response.status()).toBe(200);
    assertPostSchema(body);
    expect(body.id).toBe(postData.seededPostId);
  });

  test('TC004-Update - should update specific fields and return the merged resource', { tag: ['@api'] }, async ({ postsApi }) => {
    const { response, body } = await postsApi.updatePost(createdPostId, postData.update);
    apiLog = { status: response.status(), body };

    expect(response.status()).toBe(200);
    assertPostData(body, postData.update);
  });

  test('TC005-Verify Update - should confirm updated fields changed', { tag: ['@api'] }, async ({ postsApi }) => {
    const { response, body } = await postsApi.updatePost(createdPostId, postData.update);
    apiLog = { status: response.status(), body };

    expect(response.status()).toBe(200);
    assertPostData(body, postData.update);
  });

  test('TC006-Delete - should delete the post and return 200', { tag: ['@api'] }, async ({ postsApi }) => {
    const response = await postsApi.deletePost(createdPostId);
    apiLog = { status: response.status(), body: {} };

    expect(response.status()).toBe(200);
  });

  test('TC007-Verify Deletion - should return 404 after the post is deleted', { tag: ['@api'] }, async ({ postsApi }) => {
    const { response, body } = await postsApi.getPost(createdPostId);
    apiLog = { status: response.status(), body };

    expect(response.status()).toBe(404);
    expect(body).toEqual({});
  });
});

test.describe('JSONPlaceholder - Posts Negative', () => {
  let apiLog: { status: number; body: unknown };

  test.afterEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'API Response',
      description: JSON.stringify(apiLog, null, 2),
    });
  });

  test('TC008-Read Non-Existent - should return 404 and empty body for a post that does not exist', { tag: ['@api'] }, async ({ postsApi }) => {
    // Confirms 404 with empty body for an id that has never existed.
    const { response, body } = await postsApi.getPost(postData.nonExistentPostId);
    apiLog = { status: response.status(), body };

    expect(response.status()).toBe(404);
    expect(body).toEqual({});
  });

  test('TC009-Create Empty Payload - should still return 201 but expose missing fields in response', { tag: ['@api'] }, async ({ postsApi }) => {
    // JSONPlaceholder accepts empty payloads — documents permissive behaviour vs a real API returning 400.
    const { response, body } = await postsApi.createPost({} as any);
    apiLog = { status: response.status(), body };

    expect(response.status()).toBe(201);
    assertEmptyPostResponse(body);
  });
});

import { expect } from '@playwright/test';
import { Post } from '../../types/api/Post';

//Validates that the response body has the correct schema
export const assertPostSchema = (body: Post) => {
  expect(body, 'Response body should not be empty').toBeTruthy();
  expect(typeof body.id, 'id should be a number').toBe('number');
  expect(typeof body.userId, 'userId should be a number').toBe('number');
  expect(typeof body.title, 'title should be a string').toBe('string');
  expect(typeof body.body, 'body should be a string').toBe('string');
  expect(body.title.length, 'title should not be empty').toBeGreaterThan(0);
  expect(body.body.length, 'body should not be empty').toBeGreaterThan(0);
};

// Validates that specific field values in the response match the expected payload.
export const assertPostData = (actual: Post, expected: Partial<Post>) => {
  if (expected.userId !== undefined) expect(actual.userId).toBe(expected.userId);
  if (expected.title !== undefined) expect(actual.title).toBe(expected.title);
  if (expected.body !== undefined) expect(actual.body).toBe(expected.body);
};

// Validates that an empty payload response contains only an id and no post fields.
export const assertEmptyPostResponse = (body: Post) => {
  expect(body).toHaveProperty('id');
  expect(body).not.toHaveProperty('title');
  expect(body).not.toHaveProperty('body');
  expect(body).not.toHaveProperty('userId');
};

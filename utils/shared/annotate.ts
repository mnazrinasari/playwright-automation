import { test } from '@playwright/test';

export const annotate = (type: string, data: unknown) => {
  test.info().annotations.push({
    type,
    description: JSON.stringify(data, null, 2),
  });
};

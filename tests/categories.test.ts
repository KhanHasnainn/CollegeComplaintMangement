import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../lib/db';

describe('Category Integrity & Deduplication Tests', () => {
  it('should have zero duplicate categories in the database', async () => {
    const categories = await db.category.findMany({
      include: { department: true },
    });

    expect(categories.length).toBeGreaterThanOrEqual(25);

    const keys = categories.map(
      (c) => `${c.departmentId}::${c.name.trim().toLowerCase()}`
    );
    const uniqueKeys = new Set(keys);

    expect(keys.length).toBe(uniqueKeys.size);
  });

  it('should cover all 5 college departments with complaint categories', async () => {
    const departments = await db.department.findMany({
      include: { categories: true },
    });

    expect(departments.length).toBeGreaterThanOrEqual(5);

    for (const dept of departments) {
      expect(dept.categories.length).toBeGreaterThan(0);
    }
  });

  it('should reject creating a duplicate category under the same department', async () => {
    const existing = await db.category.findFirst();
    expect(existing).not.toBeNull();

    await expect(
      db.category.create({
        data: {
          name: existing!.name,
          departmentId: existing!.departmentId,
        },
      })
    ).rejects.toThrow();
  });
});

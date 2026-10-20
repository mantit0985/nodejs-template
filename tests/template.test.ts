import { describe, it, expect } from 'vitest';
import { config } from '../src/core/config';
import { AbstractRepository } from '../src/core/database/repository';

/**
 * Implementation Example: How to test a feature in this project.
 *
 * This test demonstrates how to implement a concrete repository
 * and verify its behavior using Vitest.
 */
describe('Implementation Example: Repository Pattern', () => {
  interface User {
    id: string;
    name: string;
  }

  class UserRepository extends AbstractRepository<User> {
    protected collectionName = 'users';

    override async create(item: Partial<User>): Promise<User> {
      return this.executeQuery(async (_db) => {
        return {
          id: 'generated-id',
          ...item,
        } as User;
      });
    }

    async findByName(name: string): Promise<User[]> {
      return this.executeQuery(async (_db) => {
        return [{ id: '1', name }];
      });
    }
  }

  const repo = new UserRepository();

  it('should successfully create an item with a generated ID', async () => {
    const item = { name: 'Test User' };
    const result = await repo.create(item);

    expect(result).toMatchObject(item);
    expect(result.id).toBe('generated-id');
  });

  it('should return null when finding a non-existent item', async () => {
    const result = await repo.findById('non-existent');
    expect(result).toBeNull();
  });

  it('should exercise custom repository methods', async () => {
    const name = 'Jane Doe';
    const results = await repo.findByName(name);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe(name);
  });
});


export interface BaseRepository<T> {
  findById(id: string): Promise<T | null>;
  create(item: Partial<T>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  list(filter?: any): Promise<T[]>;
}

export abstract class AbstractRepository<T> implements BaseRepository<T> {
  protected abstract collectionName: string;

  // In a real implementation, this would be the DB connection/client
  protected async executeQuery<R>(query: (db: any) => Promise<R>): Promise<R> {
    // This is a placeholder for actual DB logic (e.g., MongoDB or Postgres)
    console.log(`Executing query on ${this.collectionName}...`);
    return query({});
  }

  async findById(_id: string): Promise<T | null> {
    return this.executeQuery(async (_db) => {
      // Mock: return null
      return null;
    });
  }

  async create(item: Partial<T>): Promise<T> {
    return this.executeQuery(async (_db) => {
      return item as T;
    });
  }

  async update(_id: string, item: Partial<T>): Promise<T | null> {
    return this.executeQuery(async (_db) => {
      return item as T;
    });
  }

  async delete(_id: string): Promise<boolean> {
    return this.executeQuery(async (_db) => {
      return true;
    });
  }

  async list(_filter?: any): Promise<T[]> {
    return this.executeQuery(async (_db) => {
      return [];
    });
  }

}

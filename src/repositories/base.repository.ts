import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from "mongoose";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  select?: string | Record<string, number>;
  populate?: string | string[];
}

export interface PaginatedResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T> | Record<string, unknown>): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string, select?: string): Promise<T | null> {
    const query = this.model.findById(id);
    if (select) query.select(select);
    return query.exec();
  }

  async findOne(filter: FilterQuery<T>, select?: string): Promise<T | null> {
    const query = this.model.findOne(filter);
    if (select) query.select(select);
    return query.exec();
  }

  async find(filter: FilterQuery<T> = {}, options: PaginationOptions = {}): Promise<T[]> {
    const query = this.model.find(filter);

    if (options.select) query.select(options.select);
    if (options.sort) query.sort(options.sort);
    if (options.populate) query.populate(options.populate);

    return query.exec();
  }

  async findPaginated(
    filter: FilterQuery<T> = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 10);
    const skip = (page - 1) * limit;

    const [docs, totalDocs] = await Promise.all([
      this.model
        .find(filter)
        .sort(options.sort || { createdAt: -1 })
        .select(options.select || "")
        .skip(skip)
        .limit(limit)
        .populate(options.populate || "")
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return {
      docs,
      totalDocs,
      limit,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async update(
    id: string,
    updateData: UpdateQuery<T>,
    options: QueryOptions = { new: true },
  ): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, updateData, options).exec();
  }

  async updateMany(filter: FilterQuery<T>, updateData: UpdateQuery<T>): Promise<unknown> {
    return this.model.updateMany(filter, updateData).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async deleteMany(filter: FilterQuery<T>): Promise<unknown> {
    return this.model.deleteMany(filter).exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}

import mongoose from "mongoose";

export class ApiFilters {
  public query: mongoose.Query<any[], any>;
  private queryStr: any;
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search(): this {
    const keyword = this.queryStr?.keyword
      ? {
          name: { $regex: this.queryStr.keyword, $options: "i" },
        }
      : {};

    this.query = this.query.find(keyword);
    return this;
  }

  filter(): this {
    const queryCopy = { ...this.queryStr };
    // Removing fields for other features
    const removeFields = ["keyword", "page", "limit", "sort", "fields"];
    removeFields.forEach((key) => delete queryCopy[key]);

    // Advanced filter for price, ratings etc. (gte, lte)
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort(): this {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  paginate(): this {
    const page = parseInt(this.queryStr.page, 10) || 1;
    const limit = parseInt(this.queryStr.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

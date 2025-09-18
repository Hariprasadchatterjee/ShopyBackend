class ApiError extends Error {
  public statusCode: number;
  public data: null;
  public success: boolean;
  public errors: [];

  constructor(
    statusCode: number,
    message: string = "something went wrong",
    errors: [] = [],
    stack: string = "",
  ) {
    super(message)
    this.statusCode = statusCode
    this.data = null; // Standardizing the response format
    this.success = false;
    this.errors = errors

    if (stack) {
      this.stack = stack
    }
    else{
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export {ApiError}

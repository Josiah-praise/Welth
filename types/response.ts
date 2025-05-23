// export type serverActionResponse

export type successResponse<T=unknown> = {
  info: "successful";
  data?: T;
};

export type errorResponse = {
  info: "error";
  error?: string;
};

export type unauthorizedResponse = {
  info: "unauthorized";
  error?: string;
};

export type notFoundResponse = {
  info: "not found",
  error?: string
}

export type tooManyRequestsResponse = {
  info: "too many requests";
  error?: string;
};

export type serverResponse<T = unknown> =
  | notFoundResponse
  | unauthorizedResponse
  | tooManyRequestsResponse
  | errorResponse
  | successResponse<T>;

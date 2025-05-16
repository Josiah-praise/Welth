import { serverResponse } from "./response"

export type serverAction<TParam, TResponseData> = (data?: TParam) => Promise<serverResponse<TResponseData>>
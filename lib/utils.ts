import {
  accountResponse,
  serializableAccountsResponse,
} from "@/actions/Account";
import { serverResponse, successResponse } from "@/types/response";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isAccountsResponse = (
  response: accountResponse
): response is serializableAccountsResponse => {
  return Array.isArray(response);
};

export const isSuccessResponse = (response: serverResponse): response is successResponse => {
  return response.info === 'successful'
} 

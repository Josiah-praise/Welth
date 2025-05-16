import { serverAction } from "@/types/server-action";
import { useState } from "react";

type fetchState<T> = {
  data: null | T;
  error: null | unknown | string;
  loading: boolean;
};

// a function that takes a server action and helps with state management for the server action call for use in client components

export function useFetch<TParam, PResponse = unknown>(callback: serverAction<TParam,PResponse>) {
  const [data, setFetchData] = useState<fetchState<PResponse>>({
    data: null,
    error: null,
    loading: false,
  });

  const fetch = async (param?: TParam) => {
    setFetchData((data) => ({ ...data, loading: true }));
    setFetchData((data) => ({ ...data, error: null }));

    try {
      const result = await callback(param);

      if (result.info === "successful") {
        setFetchData({
          error: null,
          data: result.data || null,
          loading: false,
        });
      } else {
        setFetchData((state) => ({
          ...state,
          error: result.error || "Something went wrong on the server",

          loading: false,
        }));
      }
    } catch (error: unknown) {
      console.error(error);
      setFetchData((state) => ({
        ...state,
        error: (error as any).message || "Something went wrong on the server",
        loading: false,
      }));
    }
  };

  const setData = (data: PResponse) => {
    setFetchData((state) => ({ ...state, data }));
  };
    
    return {...data, fetch, setData}
}

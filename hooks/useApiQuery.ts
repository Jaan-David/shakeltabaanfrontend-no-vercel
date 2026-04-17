import useSWR, { type SWRConfiguration } from "swr";

const defaultFetcher = async <T>(key: string): Promise<T> => {
  const response = await fetch(key, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export interface UseApiQueryOptions<T> {
  enabled?: boolean;
  swr?: SWRConfiguration<T, Error>;
  fetcher?: (key: string) => Promise<T>;
}

export function useApiQuery<T>(
  key: string | null,
  options: UseApiQueryOptions<T> = {}
) {
  const { enabled = true, swr, fetcher } = options;

  return useSWR<T, Error>(enabled ? key : null, fetcher ?? defaultFetcher<T>, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60_000,
    focusThrottleInterval: 60_000,
    ...swr,
  });
}

export default useApiQuery;

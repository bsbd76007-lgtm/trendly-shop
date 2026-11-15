import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { errorMessage } from "./labels.ts";

interface Resource<T> {
  data: T | undefined;
  error: string;
  loading: boolean;
  reload: () => Promise<void>;
  setData: Dispatch<SetStateAction<T | undefined>>;
}

export function useResource<T>(load: () => Promise<T>): Resource<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setData(await load());
      setError("");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}

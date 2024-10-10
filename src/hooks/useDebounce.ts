import { useCallback, useEffect, useRef } from "react";

const useDebounce = (
  callback: (args: Record<string, string | string[]>) => void,
  delay: number
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = useCallback(
    (args: Record<string, string | string[]>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        callback(args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedFunction;
};

export default useDebounce;

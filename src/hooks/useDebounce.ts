import { useEffect, useRef } from "react";

const useDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = (...args: Parameters<T>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

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

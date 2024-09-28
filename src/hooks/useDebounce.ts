import { useEffect, useRef } from "react";

const useDebounce = (callback: (dataString: string) => void, delay: number) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = (dataString: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      callback(dataString);
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

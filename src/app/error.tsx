"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex justify-center items-center h-[100vh]">
      <div className="bg-zinc-100 h-[150px] w-[500px]">
        <h1>500 - Internal Server Error</h1>
      </div>
    </div>
  );
}

"use client";

import useDebounce from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";

interface DataTableSearchBoxProps {
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  className?: string;
  placeHolder: string;
}

export default function DataTableSearchBox({
  setSearchQuery,
  setPage,
  className,
  placeHolder,
}: DataTableSearchBoxProps) {
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (searchParams.get("search")) {
      setInputValue(searchParams.get("search")!);
    }
  }, [searchParams]);

  const sendSearchQuery = (searchQuery: string) => {
    setPage(1);
    setSearchQuery(searchQuery);
  };

  const handleInputChange = useDebounce(sendSearchQuery, 700);
  return (
    <div className="relative">
      <Search className="w-4 h-4 absolute top-2 left-4" />
      <Input
        className={cn("h-8 w-[200px] lg:w-[250px] text-sm pl-10", className)}
        ref={inputRef}
        value={inputValue}
        placeholder={placeHolder}
        onChange={(event) => {
          setInputValue(event.target.value);
          handleInputChange(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            sendSearchQuery(event.currentTarget.value);
          }
        }}
      />
      <Button
        variant={"ghost"}
        onClick={() => {
          setInputValue("");
          setSearchQuery("");
        }}
        disabled={inputValue.length === 0}
        className="absolute  right-2 top-1/4 h-3 hover:bg-white disabled:hidden"
      >
        <Cross2Icon className="absolute h-3 w-3 text-gray-500" />
      </Button>
    </div>
  );
}

"use client";

import useDebounce from "@/hooks/useDebounce";
import { ColumnFilter, FilterOptionsConfig } from "./dataTable";
import { Input } from "./ui/input";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface DataTableSearchBoxProps {
  filterOptionsConfig: FilterOptionsConfig;
  filterForId: string;
  setFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export default function DataTableSearchBox({
  filterOptionsConfig,
  filterForId,
  setFilter,
  setPage,
}: DataTableSearchBoxProps) {
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!searchParams.get(filterForId)) {
      setInputValue("");
    }
  }, [searchParams, filterForId]);

  const sendSearchQuery = (searchQuery: string) => {
    setPage(1);
    setFilter((prev) => {
      const newFilter = prev.filter((filter) => filter.id !== filterForId);

      newFilter.push({
        id: filterForId,
        value: searchQuery,
      });
      return newFilter;
    });
  };

  const handleInputChange = useDebounce(sendSearchQuery, 700);
  return (
    <Input
      ref={inputRef}
      value={inputValue}
      placeholder={
        filterOptionsConfig.variant === "searchBox"
          ? filterOptionsConfig.placeholder
          : ""
      }
      onChange={(event) => {
        setInputValue(event.target.value);
        handleInputChange(event.target.value);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          sendSearchQuery(event.currentTarget.value);
        }
      }}
      className="h-8 w-[150px] lg:w-[250px]"
    />
  );
}

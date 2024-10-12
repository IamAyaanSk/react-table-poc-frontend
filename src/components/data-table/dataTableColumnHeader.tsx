"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from "@radix-ui/react-icons";
import { Column, SortingState } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dispatch, SetStateAction } from "react";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  children: React.ReactNode;
  setSortting: Dispatch<SetStateAction<SortingState>>;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  children,
  className,
  setSortting,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return <span>{children}</span>;
  }
  const handleSortingState = (desc: boolean) => {
    setSortting((prev) => {
      const newSorting = prev.filter((sort) => sort.id !== column.id);
      return [...newSorting, { id: column.id, desc }];
    });
  };

  const removeSorting = () => {
    setSortting((prev) => {
      const newSorting = prev.filter((sort) => sort.id !== column.id);
      return newSorting;
    });
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 text-sm text-black h-8 data-[state=open]:bg-primary/10 data-[state=open]:text-accent-foreground hover:bg-primary/10"
          >
            <span className="font-bold">{children}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="text-primary ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="text-primary ml-2 h-4 w-4" />
            ) : (
              <CaretSortIcon className="text-primary ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {column.getCanSort() && (
            <>
              <DropdownMenuItem onClick={() => handleSortingState(false)}>
                <ArrowUpIcon className="mr-2 h-3.5 w-3.5" />
                Asc
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortingState(true)}>
                <ArrowDownIcon className="mr-2 h-3.5 w-3.5" />
                Desc
              </DropdownMenuItem>

              {column.getIsSorted() && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => removeSorting()}>
                    Unsort
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
            </>
          )}
          {column.getCanHide() && (
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeNoneIcon className="mr-2 h-3.5 w-3.5" />
              Hide
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
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
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{children}</div>;
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
            className="-ml-3 h-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
          >
            <span>{children}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <CaretSortIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
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
                Reset
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

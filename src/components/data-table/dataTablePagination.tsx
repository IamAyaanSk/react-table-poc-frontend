"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizes: number[];
  setPage: Dispatch<SetStateAction<number>>;
  setPageSize: Dispatch<SetStateAction<number>>;
  page: number;
  pageSize: number;
}

export default function DataTablePagination<TData>({
  table,
  pageSizes,
  setPage,
  setPageSize,
  page,
  pageSize,
}: DataTablePaginationProps<TData>) {
  const handlePageLimitChange = (newPageSize: number) => {
    const firstRecordOnCurrentPage = (page - 1) * pageSize + 1;
    const newPage = Math.ceil(firstRecordOnCurrentPage / newPageSize);

    setPageSize(newPageSize);
    setPage(newPage);
  };
  return (
    <div className="flex items-center justify-between px-2 flex-wrap">
      <div className="flex-1 text-xs text-muted-foreground">
        {table.getRowCount()} row(s) in total.
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center space-x-2">
          <p className="text-xs font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(newPageSize) =>
              handlePageLimitChange(parseInt(newPageSize))
            }
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizes.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {table.getPageCount() > 0 && (
          <div className="flex w-[100px] items-center justify-center text-xs font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0 flex"
            onClick={() => setPage(1)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPage(page - 1)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPage(page + 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 flex"
            onClick={() => setPage(table.getPageCount())}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

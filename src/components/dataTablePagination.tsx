import { Table } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { Dispatch, SetStateAction } from "react";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  setPage: Dispatch<SetStateAction<number>>;
  setPageSize: Dispatch<SetStateAction<number>>;
  page: number;
  pageSize: number;
}

export default function DataTablePagination<TData>({
  table,
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
    <>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page - 1)}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page + 1)}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      <select
        value={table.getState().pagination.pageSize}
        onChange={(e) => {
          handlePageLimitChange(parseInt(e.target.value));
        }}
      >
        {[10, 20, 30, 40, 50].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            {pageSize}
          </option>
        ))}
      </select>
    </>
  );
}

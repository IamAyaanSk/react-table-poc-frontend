"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import DataTablePagination from "./dataTablePagination";
import {
  getCurrentSortingOrderArray,
  getCurrentSortingOrderParamString,
  htmlTableToExcelFileBuffer,
  setStartAndEndOfDay,
} from "@/lib/utils";

import { DataTableColumnHeader } from "./dataTableColumnHeader";
import { DataTableFacetedFilter } from "./dataTableFacetedFilter";
import DataTableSearchBox from "./dataTableSearchBox";
import { DataTableDatePicker } from "./dataTableDatePicker";
import { DateRange } from "react-day-picker";
import DataTableViewController from "./dataTableViewController";
import { Button } from "../ui/button";
import saveAs from "file-saver";
import { toast } from "sonner";
import { FileSpreadsheet } from "lucide-react";

type OptionalFilterOptions<T> = {
  [K in keyof T]?: FilterOptionsConfig;
};

type FacetedFilterOptions = {
  label: string;
  value: string;
}[];

export interface ColumnFilter {
  id: string;
  value: string[] | string;
}

export type FilterOptionsConfig =
  | { variant: "faceted"; options: FacetedFilterOptions }
  | { variant: "searchBox"; placeholder: string };

interface DataTableProps<TData, TValue> {
  config: {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    totalRecords: number;
    pageSizes: number[];
    defaultPageSize?: number;
    filterOptions?: OptionalFilterOptions<TData>;
    showDateRange?: boolean;
    allowExport?: boolean;
    showViewControlButton?: boolean;
  };
}

export function DataTable<TData, TValue>({
  config: {
    columns,
    data,
    totalRecords,
    filterOptions,
    pageSizes,
    defaultPageSize = pageSizes[0],
    showDateRange = true,
    allowExport = true,
    showViewControlButton = true,
  },
}: DataTableProps<TData, TValue>) {
  const tableRef = useRef<HTMLTableElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [pageSize, setPageSize] = useState(
    parseInt(searchParams.get("page_size") || defaultPageSize.toString())
  );
  const [sorting, setSorting] = useState<SortingState>(
    getCurrentSortingOrderArray(searchParams.get("sort_by") || "")
  );
  const currDate: DateRange = setStartAndEndOfDay({
    from: new Date(searchParams.get("from_date") || new Date()),
    to: new Date(searchParams.get("to_date") || new Date()),
  });

  const [dateRange, setDateRange] = useState<DateRange>(currDate);

  let filterState: ColumnFilter[] = [];

  if (filterOptions) {
    filterState = Object.keys(filterOptions).reduce((acc, key) => {
      const queryParam = searchParams.get(key);
      if (queryParam) {
        acc.push({
          id: key,
          value: queryParam.split(","),
        });
      }
      return acc;
    }, [] as ColumnFilter[]);
  }

  const [filter, setFilter] = useState<ColumnFilter[]>(filterState);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const setQueryParams = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams();

      for (const [key, value] of Object.entries(params)) {
        if (value) {
          newParams.set(key, value);
        }
      }

      router.push(`${pathname}?${newParams.toString()}`);
    },
    [router, pathname]
  );

  useEffect(() => {
    console.log(dateRange);
    const filterQueryParams = filter.reduce((acc, curr) => {
      if (typeof curr.value === "string") {
        acc[curr.id] = curr.value;
      } else {
        acc[curr.id] = curr.value.join(",");
      }
      return acc;
    }, {} as Record<string, string>);

    setQueryParams({
      page: String(page),
      page_size: String(pageSize),
      sort_by: getCurrentSortingOrderParamString(sorting),
      ...filterQueryParams,
      from_date: dateRange?.from?.toISOString() as string,
      to_date: dateRange?.to?.toISOString() as string,
    });
  }, [page, pageSize, sorting, filter, dateRange]);

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: totalRecords,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      },
      sorting,
      columnFilters: filter,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleExport = async () => {
    if (table.getRowCount() > 0) {
      if (tableRef.current) {
        const file = await htmlTableToExcelFileBuffer(tableRef.current);
        if (!file) {
          toast.error("Failed to export data");
          return;
        }
        saveAs(file, `aipay-data-export-${Date.now()}.xlsx`);
        console.log(file);
      } else {
        toast.error("No data to export");
      }
    } else {
      toast.error("No data to export");
    }
  };

  const handleResetFilter = () => {
    setFilter([]);
  };

  return (
    <div>
      {allowExport && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handleExport} size="sm" className="h-8 flex">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      )}

      {showDateRange && (
        <div>
          <DataTableDatePicker
            date={dateRange}
            setDateQueryParams={setDateRange}
            currDateQueryParams={dateRange}
            setPage={setPage}
          />
        </div>
      )}

      {showViewControlButton && (
        <div>
          <DataTableViewController table={table} />
        </div>
      )}

      <div>
        {filterOptions && (
          <div>
            {Object.keys(filterOptions).map((key) => {
              const filterConfig = filterOptions[key as keyof TData];

              if (filterConfig?.variant === "faceted") {
                return (
                  <DataTableFacetedFilter
                    key={key}
                    title={key}
                    options={filterConfig.options}
                    setFilter={setFilter}
                    setPage={setPage}
                    column={table.getColumn(key)}
                  />
                );
              }

              if (filterConfig?.variant === "searchBox") {
                return (
                  <DataTableSearchBox
                    key={key}
                    filterForId={key}
                    filterOptionsConfig={filterConfig}
                    setFilter={setFilter}
                    setPage={setPage}
                  />
                );
              }
            })}
          </div>
        )}
        <Button
          disabled={
            !(filter.length > 0) ||
            !(filter.filter((obj) => obj.value !== "").length > 0)
          }
          onClick={() => handleResetFilter()}
          variant="ghost"
        >
          Reset Filters
        </Button>
      </div>

      <div className="rounded-md border">
        <Table ref={tableRef}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      <DataTableColumnHeader
                        column={header.column}
                        setSortting={setSorting}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </DataTableColumnHeader>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="text-sm" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        table={table}
        pageSizes={pageSizes}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
      />
    </div>
  );
}

// TODO:
// Add debouncing to input fields  // Completed
// Add date picker // Completed
// Handle hidden columns // Completed
// Add export button // Completed
// Add reset filters button // Completed
// Improve data table option types // Completed
// Improve UI
// Add proper loading and empty state

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
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import DataTablePagination from "./dataTablePagination";
import {
  getCurrentSortingOrderArray,
  getCurrentSortingOrderParamString,
  getFromDateIstString,
  htmlTableToExcelFileBuffer,
  isValidDate,
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
import { Cross2Icon } from "@radix-ui/react-icons";
import { Separator } from "@/components/ui/separator";

type OptionalFilterOptions<T> = {
  [K in keyof T]?: FilterOptionsConfig;
};

type FacetedFilterOptions = {
  label: string;
  value: string;
}[];

export interface ColumnFilter {
  id: string;
  value: string[];
}

export type FilterOptionsConfig = { options: FacetedFilterOptions };

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
    hideColumns?: Record<string, string[]>;
    searchBox?:
      | {
          placeHolder: string;
        }
      | false;
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
    hideColumns,
    searchBox = {
      placeHolder: "Search here..",
    },
  },
}: DataTableProps<TData, TValue>) {
  const memoizedColumns = useMemo(() => columns, [columns]);

  const role = "ADMIN";

  // A re-render is most likely to happen when the data changes
  // So, no need to memoize the data

  const tableRef = useRef<HTMLTableElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const loadingToastId = useRef<number | string | null>(null);

  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  const queryParamPageSize = searchParams.get("pageSize");
  const parsedPageSize = queryParamPageSize
    ? parseInt(queryParamPageSize)
    : null;

  const isValidPageSize = parsedPageSize && pageSizes.includes(parsedPageSize);
  const [pageSize, setPageSize] = useState(
    isValidPageSize ? parsedPageSize : defaultPageSize
  );

  const [sorting, setSorting] = useState<SortingState>(
    getCurrentSortingOrderArray(searchParams.get("sortBy") || "")
  );

  let currDate: DateRange = {
    from: undefined,
    to: undefined,
  };

  if (showDateRange) {
    const queryParamsFromDate = searchParams.get("fromDate");
    const queryParamsToDate = searchParams.get("toDate");

    currDate = {
      from:
        queryParamsFromDate && isValidDate(queryParamsFromDate)
          ? new Date(queryParamsFromDate)
          : new Date(),
      to:
        queryParamsToDate && isValidDate(queryParamsToDate)
          ? new Date(queryParamsToDate)
          : new Date(),
    };
  }

  const [dateRange, setDateRange] = useState<DateRange>(currDate);

  const [searchQuery, setSearchQuery] = useState(
    (searchBox && searchParams.get("search")) || ""
  );

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

  let columnVisibilityState: VisibilityState = {};

  if (hideColumns) {
    columnVisibilityState = Object.keys(hideColumns).reduce((acc, key) => {
      const hideForRoles = hideColumns[key];
      if (hideForRoles && hideForRoles.includes(role)) acc[key] = false;
      return acc;
    }, {} as VisibilityState);
  }

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    columnVisibilityState
  );

  const setQueryParams = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams();

      for (const [key, value] of Object.entries(params)) {
        if (value) {
          newParams.set(key, value);
        }
      }
      startTransition(() => {
        router.push(`${pathname}?${newParams.toString()}`);
      });
    },
    [router, pathname]
  );

  useEffect(() => {
    if (isPending) {
      if (!loadingToastId.current) {
        loadingToastId.current = toast.loading("Fetching data", {
          closeButton: false,
        });
      }
    } else {
      if (loadingToastId.current) {
        toast.dismiss(loadingToastId.current);
        loadingToastId.current = null;
      }
    }

    return () => {
      if (loadingToastId.current) {
        toast.dismiss(loadingToastId.current);
        loadingToastId.current = null;
      }
    };
  }, [isPending]);

  useEffect(() => {
    console.log(dateRange);
    const filterQueryParams = filter.reduce((acc, curr) => {
      acc[curr.id] = curr.value.join(",");
      return acc;
    }, {} as Record<string, string>);

    setQueryParams({
      page: String(page),
      pageSize: String(pageSize),
      search: searchQuery,
      sortBy: getCurrentSortingOrderParamString(sorting),
      ...filterQueryParams,
      fromDate: getFromDateIstString(dateRange?.from),
      toDate: getFromDateIstString(dateRange?.to),
    });
  }, [page, pageSize, sorting, filter, dateRange, searchQuery, setQueryParams]);

  const table = useReactTable({
    data: data,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: totalRecords,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
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
    <div className="m-4 border border-primary px-6 rounded-md pb-6">
      <div className="flex flex-col gap-2 justify-center pt-6 pb-4">
        <div
          className={`flex items-center ${
            showDateRange ? "justify-between" : "justify-end"
          }`}
        >
          {showDateRange && (
            <div>
              <DataTableDatePicker
                setDateQueryParams={setDateRange}
                currDateQueryParams={dateRange}
                setPage={setPage}
              />
            </div>
          )}
          <div className={`flex gap-4 items-center`}>
            {allowExport && (
              <div className="flex items-center gap-2 flex-wrap">
                <Button onClick={handleExport} size="sm" className="h-8 flex">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            )}

            {showViewControlButton && (
              <div>
                <DataTableViewController table={table} />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {filterOptions && (
            <>
              {Object.keys(filterOptions).map((key) => {
                const filterConfig = filterOptions[
                  key as keyof TData
                ] as FilterOptionsConfig;
                return (
                  <DataTableFacetedFilter
                    className="order-2"
                    key={key}
                    title={key}
                    options={filterConfig.options}
                    setFilter={setFilter}
                    setPage={setPage}
                    column={table.getColumn(key)}
                  />
                );
              })}
            </>
          )}

          {searchBox && (
            <DataTableSearchBox
              className="order-1"
              setSearchQuery={setSearchQuery}
              setPage={setPage}
              placeHolder={searchBox.placeHolder}
            />
          )}
          <Button
            disabled={
              filter.length === 0 ||
              filter.every((obj) => obj.value.length === 0)
            }
            onClick={() => handleResetFilter()}
            variant="ghost"
            className="order-3 text-sm font-semibold p-1 h-8 disabled:hidden"
          >
            Reset Filters
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
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

      <Separator className="bg-primary/20" />

      <div className="my-4 border rounded-md">
        <Table
          ref={tableRef}
          style={{
            width: table.getCenterTotalSize(),
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-primary/10 bg-primary/10"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={`py-2 px-7`}
                      style={{
                        width: header.column.getSize(),
                      }}
                    >
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
                    <TableCell
                      className={`text-sm py-4 px-7`}
                      style={{
                        width: cell.column.getSize(),
                      }}
                      key={cell.id}
                    >
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

"use client";

import {
  ColumnDef,
  DeepKeys,
  flexRender,
  getCoreRowModel,
  RowData,
  SortingState,
  TableMeta,
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
  TableFooter,
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
  getCurrentSortingOrderState,
  getCurrentSortingOrderParamArray,
  getUtcTimestampsForSelectedDates,
  htmlTableToExcelFileBuffer,
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
import useDebounce from "@/hooks/useDebounce";
import qs from "qs";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line
  interface TableMeta<TData extends RowData> {
    remitterMobileNumber?: string;
    totalCreditAmount: number;
    totalDebitAmount: number;
  }
}

type OptionalFilterOptions<T> = {
  [K in DeepKeys<T>]?: FilterOptionsConfig;
};
type FacetedFilterOptions = {
  label: string;
  value: string;
}[];

export interface ColumnFilter {
  id: string;
  name?: string;
  value: string[];
}

export type FilterOptionsConfig = {
  filterName?: string;
  options: FacetedFilterOptions;
  filterTitle: string;
};

interface DataTableProps<TData, TValue> {
  config: {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    totalRecords: number;
    filterOptions?: OptionalFilterOptions<TData>;
    showDateRange?: boolean;
    allowExport?: Partial<Record<string, string[]>> | boolean;
    showViewControlButton?: boolean;
    columnVisibilityConfig?: Record<string, Partial<Record<string, string[]>>>;
    searchBox?:
      | {
          placeHolder: string;
        }
      | false;
    meta?: TableMeta<TData>;
  };
}

export function DataTable<TData, TValue>({
  config: {
    columns,
    data,
    totalRecords,
    filterOptions,
    showDateRange = true,
    allowExport,
    showViewControlButton = true,
    columnVisibilityConfig,
    searchBox = {
      placeHolder: "Search here..",
    },
    meta,
  },
}: DataTableProps<TData, TValue>) {
  const pageSizes = [200, 400, 600, 800, 1000];
  const memoizedColumns = useMemo(() => columns, [columns]);

  const userOrganisation = "ADMIN";
  const userRole = "ADMIN";

  // A re-render is most likely to happen when the data changes
  // So, no need to memoize the data

  const tableRef = useRef<HTMLTableElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const loadingToastId = useRef<number | string | null>(null);

  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  const pageSizeQueryParam = searchParams.get("pageSize");
  const [pageSize, setPageSize] = useState(
    pageSizeQueryParam ? parseInt(pageSizeQueryParam) : pageSizes[0]
  );

  const [sorting, setSorting] = useState<SortingState>(
    getCurrentSortingOrderState(searchParams.getAll("sort[]"))
  );

  let currDate: DateRange = {
    from: undefined,
    to: undefined,
  };

  if (showDateRange) {
    const queryParamsStartDate = searchParams.get("startDate");
    const queryParamsEndDate = searchParams.get("endDate");

    currDate = {
      from: queryParamsStartDate
        ? new Date(parseInt(queryParamsStartDate))
        : new Date(),
      to: queryParamsEndDate
        ? new Date(parseInt(queryParamsEndDate))
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
      const filterName = filterOptions[key as keyof TData]?.filterName;

      const queryParam = searchParams.getAll(
        filterName ? `${filterName}[]` : `${key}[]`
      );

      if (queryParam) {
        acc.push({
          id: key,
          name: filterName,
          value: queryParam,
        });
      }
      return acc;
    }, [] as ColumnFilter[]);
  }

  const [filter, setFilter] = useState<ColumnFilter[]>(filterState);

  let columnVisibilityState: VisibilityState = {};

  if (columnVisibilityConfig) {
    columnVisibilityState = Object.keys(columnVisibilityConfig).reduce(
      (acc, key) => {
        const allowFor = columnVisibilityConfig[key];
        const allowedRolesForCurrentOrg =
          userOrganisation && allowFor[userOrganisation];

        // If a particular organization is not specified in config then the column will be invisible for all roles under that org
        const isColumnAllowedForUser =
          userRole &&
          allowedRolesForCurrentOrg &&
          allowedRolesForCurrentOrg.includes(userRole);

        if (!isColumnAllowedForUser) acc[key] = false;
        return acc;
      },
      {} as VisibilityState
    );
  }

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    columnVisibilityState
  );

  const setQueryParams = useCallback(
    (params: Record<string, string | string[]>) => {
      for (const key in params) {
        if (!params[key]) delete params[key];
      }
      // Create new search params string
      const newSearchParams = qs.stringify(params, { arrayFormat: "brackets" });

      // Get the current search params string
      const currentSearchParams = qs.stringify(searchParams, {
        arrayFormat: "brackets",
      });

      // Only replace the URL if the new params are different from the current ones
      if (newSearchParams !== currentSearchParams) {
        startTransition(() => {
          router.replace(`${pathname}?${newSearchParams}`);
        });
      }
    },
    [router, pathname, searchParams]
  );

  const debouncedSetQueryParams = useDebounce(setQueryParams, 500);

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
    const filterQueryParams = filter.reduce((acc, curr) => {
      const filterName = curr.name || curr.id;
      acc[filterName] = curr.value;
      return acc;
    }, {} as Record<string, string[]>);

    const utcTimeStamps = getUtcTimestampsForSelectedDates(dateRange);

    debouncedSetQueryParams({
      page: String(page),
      pageSize: String(pageSize),
      search: searchQuery,
      sort: getCurrentSortingOrderParamArray(sorting),
      ...filterQueryParams,
      startDate: showDateRange ? utcTimeStamps.from : "",
      endDate: showDateRange ? utcTimeStamps.to : "",
    });
  }, [
    page,
    pageSize,
    sorting,
    filter,
    dateRange,
    searchQuery,
    showDateRange,
    debouncedSetQueryParams,
  ]);

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
    meta,
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

  if (allowExport && typeof allowExport === "object") {
    const allowedRolesForCurrentOrg = userOrganisation
      ? allowExport[userOrganisation]
      : null;
    const isExportAllowedForUser =
      allowedRolesForCurrentOrg && userRole
        ? allowedRolesForCurrentOrg.includes(userRole)
        : false;

    allowExport = isExportAllowedForUser ? allowExport : false;
  }

  return (
    <div className="m-4 border border-primary px-6 rounded-md pb-6">
      <div className="flex flex-col gap-6 justify-center pt-6 pb-4 sm:gap-2">
        <div
          className={`flex items-center flex-wrap gap-2 ${
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
              <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-2 flex-wrap">
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
                    filterName={filterConfig.filterName}
                    title={filterConfig.filterTitle}
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
            minWidth: table.getCenterTotalSize(),
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

          {data.length > 0 && (
            <TableFooter>
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <TableCell
                      className="text-center border-none"
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext()
                          )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableFooter>
          )}
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

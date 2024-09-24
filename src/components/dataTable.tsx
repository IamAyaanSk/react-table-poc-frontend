"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
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
import { useCallback, useEffect, useState } from "react";
import DataTablePagination from "./dataTablePagination";
import {
  getCurrentSortingOrderArray,
  getCurrentSortingOrderParamString,
} from "@/lib/utils";
import { DataTableColumnHeader } from "./dataTableColumnHeader";
import { DataTableFacetedFilter } from "./dataTableFacetedFilter";

type FilterOptions = {
  label: string;
  value: string;
}[];

export interface ColumnFilter {
  id: string;
  value: string[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalRecords: number;
  filterOptiions?: Record<string, Record<"options", FilterOptions>>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalRecords,
  filterOptiions,
}: DataTableProps<TData, TValue>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [pageSize, setPageSize] = useState(
    parseInt(searchParams.get("pageSize") || "10")
  );
  const [sorting, setSorting] = useState<SortingState>(
    getCurrentSortingOrderArray(searchParams.get("sort_by") || "")
  );

  let filterState: ColumnFilter[] = [];

  if (filterOptiions) {
    filterState = Object.entries(filterOptiions).reduce((acc, [key]) => {
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

  const setQueryParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value) {
        newParams.set(key, value);
      }
    }
    router.push(`${pathname}?${newParams.toString()}`);
  };

  useEffect(() => {
    const filterQueryParams = filter.reduce((acc, curr) => {
      acc[curr.id] = curr.value.join(",");
      return acc;
    }, {} as Record<string, string>);

    console.log(filterQueryParams);
    console.log(filter);

    setQueryParams({
      page: String(page),
      pageSize: String(pageSize),
      sort_by: getCurrentSortingOrderParamString(sorting),
      ...filterQueryParams,
    });
  }, [page, pageSize, sorting, filter]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    rowCount: totalRecords,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      },
      sorting,
      columnFilters: filter,
    },
  });

  return (
    <div>
      <div>
        {filterOptiions && (
          <div>
            {Object.keys(filterOptiions).map((key) => (
              <DataTableFacetedFilter
                key={key}
                title={key}
                options={filterOptiions[key].options}
                setFilter={setFilter}
                column={table.getColumn(key)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
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
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
      />
    </div>
  );
}

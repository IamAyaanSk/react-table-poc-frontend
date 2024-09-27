"use client";

import { getIstString } from "@/lib/utils";
import { Ledger } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export type WalletLedgerTableRecord = Omit<
  Ledger,
  "id" | "createdAt" | "updatedAt"
>;

export const columns: ColumnDef<WalletLedgerTableRecord>[] = [
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.original.amount;
      return <span>{amount}</span>;
    },
  },
  {
    accessorKey: "openingBalance",
    header: "Opening Balance",
    cell: ({ row }) => {
      const openingBalance = row.original.openingBalance;
      return <span>{openingBalance}</span>;
    },
  },
  {
    accessorKey: "closingBalance",
    header: "Closing Balance",
    cell: ({ row }) => {
      const closingBalance = row.original.closingBalance;
      return <span>{closingBalance}</span>;
    },
  },
  {
    accessorKey: "dateTime",
    header: "Date | Time",
    cell: ({ row }) => {
      const dateObject =
        typeof row.original.dateTime === "string"
          ? new Date(row.original.dateTime)
          : row.original.dateTime;
      return <span>{getIstString(dateObject)}</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      return <span>{type}</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
    cell: ({ row }) => {
      const purpose = row.original.purpose;
      return <span>{purpose}</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "service",
    header: "Service",
    cell: ({ row }) => {
      const service = row.original.service;
      return <span>{service}</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "transferredTo",
    header: "Transferred To",
    cell: ({ row }) => {
      const transferredTo = row.original.transferredTo;
      return <span>{transferredTo}</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description;
      return <span>{description}</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "referenceId",
    header: "Reference Id",
    cell: ({ row }) => {
      const referenceId = row.original.referenceId;
      return <span>{referenceId}</span>;
    },
    enableSorting: false,
  },
];

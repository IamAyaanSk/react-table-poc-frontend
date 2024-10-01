"use client";

import { Badge } from "@/components/ui/badge";
import { getIstString } from "@/lib/utils";
import { Ledger } from "@prisma/client";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

export type WalletLedgerTableRecord = Omit<
  Ledger,
  "id" | "createdAt" | "updatedAt"
>;

const walletLedgerColumnHelper = createColumnHelper<WalletLedgerTableRecord>();

export const columns = [
  walletLedgerColumnHelper.accessor("amount", {
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.original.amount;
      return <p className="text-right mr-4">₹{amount}</p>;
    },
    size: 60,
  }),

  walletLedgerColumnHelper.accessor("openingBalance", {
    header: "Opening Balance",
    cell: ({ row }) => {
      const openingBalance = row.original.openingBalance;
      return <p className="text-right mr-10">₹{openingBalance.toFixed(2)}</p>;
    },
  }),

  walletLedgerColumnHelper.accessor("closingBalance", {
    header: "Closing Balance",
    cell: ({ row }) => {
      const closingBalance = row.original.closingBalance;
      return <p className="text-right mr-10">₹{closingBalance.toFixed(2)}</p>;
    },
  }),
  walletLedgerColumnHelper.accessor("dateTime", {
    header: "Date | Time",
    cell: ({ row }) => {
      const dateObject =
        typeof row.original.dateTime === "string"
          ? new Date(row.original.dateTime)
          : row.original.dateTime;
      return <p>{getIstString(dateObject)}</p>;
    },
    enableSorting: false,
  }),
  walletLedgerColumnHelper.accessor("type", {
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge
          className={`${
            type === "CREDIT"
              ? "bg-green-200 hover:bg-green-200"
              : "bg-red-200 hover:bg-red-200"
          } text-xs text-gray-600`}
        >
          {type}
        </Badge>
      );
    },
    enableSorting: false,
  }),

  walletLedgerColumnHelper.accessor("purpose", {
    header: "Purpose",
    cell: ({ row }) => {
      const purpose = row.original.purpose;
      return <p>{purpose}</p>;
    },
    enableSorting: false,
  }),

  walletLedgerColumnHelper.accessor("service", {
    header: "Service",
    cell: ({ row }) => {
      const service = row.original.service;
      return <p>{service}</p>;
    },
    enableSorting: false,
  }),
  walletLedgerColumnHelper.accessor("transferredTo", {
    header: "Transferred To",
    cell: ({ row }) => {
      const transferredTo = row.original.transferredTo;
      return <p>{transferredTo}</p>;
    },
    enableSorting: false,
  }),
  walletLedgerColumnHelper.accessor("description", {
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description;
      return <p>{description}</p>;
    },
    enableSorting: false,
    size: 480,
  }),
  walletLedgerColumnHelper.accessor("referenceId", {
    header: "Reference Id",
    cell: ({ row }) => {
      const referenceId = row.original.referenceId;
      return <p>{referenceId}</p>;
    },
    enableSorting: false,
    size: 380,
  }),
] as ColumnDef<WalletLedgerTableRecord>[];

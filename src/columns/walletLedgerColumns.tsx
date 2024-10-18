"use client";

import { Badge } from "@/components/ui/badge";
import WalletLedgerAction from "@/components/walletLedgerActionComponent";
import { fromDateIstDateTime } from "@/lib/utils";
import { Ledger } from "@prisma/client";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

export type WalletLedgerTableRecord = Omit<
  Ledger,
  "id" | "createdAt" | "updatedAt"
>;

const walletLedgerColumnHelper = createColumnHelper<WalletLedgerTableRecord>();
const TABLE_DATE_TIME_FORMAT = "yyyy-MMM-dd | hh:mm:ss a";

export const columns = [
  walletLedgerColumnHelper.accessor("amount", {
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.original.amount;
      return <p className="text-right mr-4">₹{amount}</p>;
    },
    footer: ({ table }) => {
      const totalCreditAmount = table.options.meta?.totalCreditAmount || 0;
      const totalDebitAmount = table.options.meta?.totalDebitAmount || 0;

      return (
        <>
          <p className="mr-4 p-2 font-bold text-left text-green-600">
            CREDIT:
            <span className="text-right text-black">{` ₹${totalCreditAmount.toFixed(
              2
            )}`}</span>
          </p>

          <p className="mr-4 p-2 font-bold text-left text-red-600">
            DEBIT:
            <span className="text-right text-black">{` ₹${totalDebitAmount.toFixed(
              2
            )}`}</span>
          </p>
        </>
      );
    },
    size: 60,
    enableHiding: false,
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
      const formattedForTooltipAbsolute = fromDateIstDateTime(
        new Date(row.original.dateTime)
      ).toFormat(TABLE_DATE_TIME_FORMAT);

      return <p>{formattedForTooltipAbsolute}</p>;
    },
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

  walletLedgerColumnHelper.display({
    header: "Actions",
    id: "actions",
    cell: ({ row, table }) => {
      const metaData = table.options.meta?.remitterMobileNumber;
      if (!metaData) return null;
      return <WalletLedgerAction remitterMobileNumber={metaData} row={row} />;
    },
    size: 80,
    enableSorting: false,
  }),
] as ColumnDef<WalletLedgerTableRecord>[];

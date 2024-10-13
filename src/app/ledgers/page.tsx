import { columns } from "@/columns/walletLedgerColumns";
import { DataTable } from "@/components/data-table/dataTable";
import { API_PATHS } from "@/constants/apiPaths";
import qs from "qs";
import { AlertTriangle } from "lucide-react";
import { StateFullPage } from "@/components/statefullPage";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function WalletLedgerTable({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  let data = [];
  let totalRecords = 0;
  let isError = false;
  let message = "Failed to fetch data.";

  const response = await fetch(
    `${API_PATHS.LEDGERS}/?${qs.stringify(searchParams, {
      arrayFormat: "brackets",
    })}`
  );
  const result = await response.json();
  console.log("Data fetched", result);
  console.log("Search Params", searchParams);

  if (!response.ok) {
    isError = true;
    message = `Error: ${response.status} - ${result.error}`;
  } else {
    data = result.data;
    totalRecords = result.totalRecords;
  }

  return (
    <div>
      {isError ? (
        <div className="flex flex-col gap-3 justify-center items-center">
          <StateFullPage>
            <AlertTriangle className="w-8 h-8" />
            <h2>{message}</h2>
          </StateFullPage>
          <Button>
            <Link href={"/ledgers"}>Refresh Query</Link>
          </Button>
        </div>
      ) : (
        <DataTable
          config={{
            columns,
            data,
            totalRecords,
            pageSizes: [100, 200, 300, 400, 500, 1000],
            defaultPageSize: 300,
            filterOptions: {
              type: {
                filterTitle: "Ledger Type",
                options: [
                  { label: "Credit", value: "CREDIT" },
                  { label: "Debit", value: "DEBIT" },
                ],
              },
              purpose: {
                filterTitle: "Ledger Purpose",
                options: [
                  { label: "Wallet", value: "WALLET" },
                  { label: "Fund Request", value: "FUND_REQUEST" },
                  { label: "Service", value: "SERVICE" },
                  { label: "Commission", value: "COMMISION" },
                  { label: "Refund", value: "REFUND" },
                  { label: "Surcharge", value: "SURCHARGE" },
                ],
              },
            },

            columnVisibilityConfig: {
              amount: {
                ADMIN: ["ADMIN"],
              },
            },
            allowExport: {
              ADMIN: ["ADMIN"],
            },
          }}
        />
      )}
    </div>
  );
}

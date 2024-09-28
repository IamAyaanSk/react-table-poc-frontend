import { columns } from "@/columns/walletLedgerColumns";
import { DataTable } from "@/components/data-table/dataTable";
import { API_PATHS } from "@/constants/apiPaths";

export default async function WalletLedgerTable({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  const searchParamsString = new URLSearchParams(searchParams).toString();

  console.log(`${API_PATHS.LEDGERS}?${searchParamsString}`);

  const response = await fetch(`${API_PATHS.LEDGERS}/?${searchParamsString}`);
  let { data, totalRecords } = await response.json();

  if (!response.ok) {
    console.error("Failed to fetch data");
    data = [];
    totalRecords = 0;
  }

  return (
    <DataTable
      config={{
        columns,
        data,
        totalRecords,
        pageSizes: [500, 1000, 2000, 5000],
        filterOptions: {
          type: {
            options: [
              {
                label: "Credit",
                value: "CREDIT",
              },
              {
                label: "Debit",
                value: "DEBIT",
              },
            ],
            variant: "faceted",
          },
          purpose: {
            options: [
              {
                label: "Wallet",
                value: "WALLET",
              },
              {
                label: "Fund Request",
                value: "FUND_REQUEST",
              },
              {
                label: "Service",
                value: "SERVICE",
              },
              {
                label: "Comission",
                value: "COMMISION",
              },
              {
                label: "Refund",
                value: "REFUND",
              },
              {
                label: "Surcharge",
                value: "SURCHARGE",
              },
            ],
            variant: "faceted",
          },

          referenceId: {
            placeholder: "Search by Reference ID",
            variant: "searchBox",
          },
        },
      }}
    />
  );
}

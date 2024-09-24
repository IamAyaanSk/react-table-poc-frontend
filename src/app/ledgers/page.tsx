import { columns } from "@/columns/walletLedgerColumns";
import { DataTable } from "@/components/dataTable";
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
      columns={columns}
      data={data}
      totalRecords={totalRecords}
      filterOptiions={{
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
        },
      }}
    />
  );
}

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
  if (!response.ok) {
    console.error("Failed to fetch data");
    return;
  }

  const { data, totalRecords } = await response.json();

  return (
    <DataTable columns={columns} data={data} totalRecords={totalRecords} />
  );
}

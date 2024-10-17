import { WalletLedgerTableRecord } from "@/columns/walletLedgerColumns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export default function WalletLedgerAction({
  remitterMobileNumber,
  row,
}: {
  remitterMobileNumber: string;
  row: Row<WalletLedgerTableRecord>;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>View</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dummy Action</DialogTitle>
          <DialogDescription>
            Remitter Meta Demo: {remitterMobileNumber}
            Amount: {row.original.amount}
          </DialogDescription>
        </DialogHeader>
        <div>Wallet Ledger Content</div>
      </DialogContent>
    </Dialog>
  );
}

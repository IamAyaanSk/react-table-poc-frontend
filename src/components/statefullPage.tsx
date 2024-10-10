import { cn } from "@/lib/utils";

type StateFullPageProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export function StateFullPage({
  children,
  className,
  ...props
}: StateFullPageProps) {
  return (
    <div
      className={cn(
        "flex text-center flex-col gap-5 justify-center items-center w-full h-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

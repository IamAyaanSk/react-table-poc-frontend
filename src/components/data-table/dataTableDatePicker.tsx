import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn, setStartAndEndOfDay } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DataTableDatePicker({
  className,
  setDateQueryParams,
  currDateQueryParams,
  setPage,
}: React.HTMLAttributes<HTMLDivElement> & {
  currDateQueryParams: DateRange;
  setDateQueryParams: React.Dispatch<React.SetStateAction<DateRange>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [date, setDate] = React.useState<DateRange>(currDateQueryParams);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const checkDateRangesForEquality = (
    firstDateRange: DateRange,
    secondDateRange: DateRange
  ) => {
    if (!firstDateRange || !secondDateRange) return false;
    return (
      firstDateRange.from?.getTime() === secondDateRange.from?.getTime() &&
      firstDateRange.to?.getTime() === secondDateRange.to?.getTime()
    );
  };

  const handlePopoverChange = (open: boolean) => {
    if (!open && date?.from && date?.to) {
      setDateQueryParams(setStartAndEndOfDay(date));
      setPage(1);
    } else {
      setDate(currDateQueryParams);
    }
    setIsOpen(open);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={handlePopoverChange}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            className={cn(
              "w-[250px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(e) => setDate(e as DateRange)}
            max={20}
          />
          <Button
            className="text-xs mx-2 h-8 mb-4"
            disabled={
              !(date?.from && date?.to) ||
              checkDateRangesForEquality(date, currDateQueryParams)
            }
            onClick={() => {
              setPage(1);
              setDateQueryParams(setStartAndEndOfDay(date));
              setIsOpen(false);
            }}
          >
            Search
          </Button>
          <Button
            className="text-xs m-2 h-8 mb-4"
            variant="outline"
            disabled={checkDateRangesForEquality(date, currDateQueryParams)}
            onClick={() => setDate(currDateQueryParams)}
          >
            Reset
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}

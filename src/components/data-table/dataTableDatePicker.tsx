"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { DateRange } from "react-day-picker";

import { cn, getFromDateIstString } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateTime } from "luxon";

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

  const checkDateRangesForEquality = React.useCallback(
    (firstDateRange: DateRange, secondDateRange: DateRange) => {
      if (!firstDateRange || !secondDateRange) {
        return false;
      }

      const { from: firstFrom, to: firstTo } = firstDateRange;
      const { from: secondFrom, to: secondTo } = secondDateRange;

      const isFirstRangeValid = firstFrom && firstTo;
      const isSecondRangeValid = secondFrom && secondTo;

      if (!isFirstRangeValid || !isSecondRangeValid) {
        return false;
      }

      const areFromDatesEqual = DateTime.fromJSDate(firstFrom).hasSame(
        DateTime.fromJSDate(secondFrom),
        "day"
      );

      const areToDatesEqual = DateTime.fromJSDate(firstTo).hasSame(
        DateTime.fromJSDate(secondTo),
        "day"
      );

      return areFromDatesEqual && areToDatesEqual;
    },
    []
  );

  const today = DateTime.fromJSDate(new Date(), { zone: "Asia/Kolkata" });
  const threeMonthsAgo = today.minus({ months: 3 });

  const handlePopoverChange = (open: boolean) => {
    if (!open && date?.from && date?.to) {
      setDateQueryParams(date);
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
                  {getFromDateIstString(date.from)} -{" "}
                  {getFromDateIstString(date.to)}
                </>
              ) : (
                getFromDateIstString(date.from)
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
            toDate={today.toJSDate()}
            fromDate={threeMonthsAgo.toJSDate()}
            max={30}
            disabled={{
              before: threeMonthsAgo.toJSDate(),
              after: today.toJSDate(),
            }}
          />
          <Button
            className="text-xs mx-2 h-8 mb-4"
            disabled={
              !(date?.from && date?.to) ||
              checkDateRangesForEquality(date, currDateQueryParams)
            }
            onClick={() => {
              setPage(1);
              setDateQueryParams(date);
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

import { SortingState } from "@tanstack/react-table";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DateTime } from "luxon";
import { startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import * as xlsx from "xlsx";

const TABLE_DATE_TIME_FORMAT = "yyyy-MMM-dd | hh:mm:ss a";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrentSortingOrderState(sortingParams: string[]) {
  const initialArray: SortingState = [];
  const orderByArray = sortingParams.reduce((acc, curr) => {
    const [key, value] = curr.split("-");

    const desc = value === "desc" ? true : false;

    acc.push({
      id: key,
      desc: desc,
    });

    return acc;
  }, initialArray);

  return orderByArray;
}

export function getCurrentSortingOrderParamArray(sortingArray: SortingState) {
  return sortingArray.map((sort) => {
    return `${sort.id}-${sort.desc === true ? "desc" : "asc"}`;
  });
}

export async function htmlTableToExcelFileBuffer(
  table: HTMLTableElement
): Promise<Blob | false> {
  function preprocessTable(table: HTMLTableElement): HTMLTableElement {
    const clonedTable = table.cloneNode(true) as HTMLTableElement;

    // Remove all <a> tags and concatenate <p> tags
    const cells = clonedTable.querySelectorAll("td, th");
    cells.forEach((cell) => {
      const links = cell.querySelectorAll("a");
      links.forEach((link) => link.remove());

      const paragraphs = cell.querySelectorAll("p");
      if (paragraphs.length > 0) {
        const contentArray: string[] = [];
        paragraphs.forEach((p) => contentArray.push(p.textContent || ""));
        cell.textContent = contentArray.join(" "); // You can use '\n' for new lines instead of spaces if preferred
      }
    });

    return clonedTable;
  }

  function removeEmptyColumns(ws: xlsx.WorkSheet): void {
    const range = xlsx.utils.decode_range(ws["!ref"] || "");
    const columnsToDelete: number[] = [];

    for (let C = range.s.c; C <= range.e.c; ++C) {
      let isEmpty = true;
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        // Start from the second row (skip header)
        const cellAddress = xlsx.utils.encode_cell({ c: C, r: R });
        const cell = ws[cellAddress];
        if (
          cell &&
          cell.v !== undefined &&
          cell.v !== null &&
          cell.v.toString().trim() !== ""
        ) {
          isEmpty = false;
          break;
        }
      }
      if (isEmpty) {
        columnsToDelete.push(C);
      }
    }

    // Delete columns from the worksheet and update the range
    columnsToDelete.reverse().forEach((col) => {
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = xlsx.utils.encode_cell({ c: col, r: R });
        delete ws[cellAddress];
      }
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = col; C < range.e.c; ++C) {
          const fromCell = xlsx.utils.encode_cell({ c: C + 1, r: R });
          const toCell = xlsx.utils.encode_cell({ c: C, r: R });
          ws[toCell] = ws[fromCell];
          delete ws[fromCell];
        }
      }
    });

    // Update the range
    range.e.c -= columnsToDelete.length;
    ws["!ref"] = xlsx.utils.encode_range(range);
  }

  try {
    const preprocessedTable = preprocessTable(table);
    const wb = xlsx.utils.table_to_book(preprocessedTable, {
      raw: true,
    });
    const ws = wb.Sheets[wb.SheetNames[0]];

    if (!ws || !ws["!ref"]) {
      throw new Error("Worksheet is empty or invalid");
    }

    // Remove columns with all empty rows (excluding the header row)
    removeEmptyColumns(ws);

    const range = xlsx.utils.decode_range(ws["!ref"]);

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = xlsx.utils.encode_cell({ c: C, r: R });
        const cell = ws[cellAddress];

        if (cell) {
          try {
            const date = DateTime.fromFormat(cell.v, TABLE_DATE_TIME_FORMAT);

            if (!isNaN(Date.parse(date.toString()))) {
              cell.v = date;
              cell.t = "d"; // Set cell type to date
              cell.z = "dd-mm-yyyy hh:mm:ss a"; // Set desired date-time format
            }

            if (typeof cell.v === "string" && cell.v.trim().startsWith("₹")) {
              const numericValue = parseFloat(cell.v.replace(/[^0-9.-]+/g, ""));
              if (!isNaN(numericValue)) {
                cell.v = numericValue;
                cell.t = "n"; // Set cell type to number
                cell.z = "₹#,##0.00;[Red]-₹#,##0.00"; // Set desired currency format with decimal support
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    }

    const wbout = xlsx.write(wb, {
      bookType: "xlsx",
      type: "array",
      bookSST: true, // Use the Shared String Table to optimize storage of repeated strings
    });

    return new Blob([wbout], { type: "application/octet-stream" });
  } catch (error) {
    console.error(error);
    return false;
  }
}

export const getFromDateIstString = (date: Date) => {
  return DateTime.fromJSDate(date, {
    zone: "Asia/Kolkata",
  }).toFormat("yyyy-MM-dd");
};

export const getUtcTimestampsForSelectedDates = (selectedDates: DateRange) => {
  const dateRange = {
    from: selectedDates.from || new Date(),
    to: selectedDates.to || new Date(),
  };

  const startOfDay = DateTime.fromJSDate(dateRange.from, {
    zone: "Asia/Kolkata",
  })
    .startOf("day")
    .toUTC();

  const endOfDay = DateTime.fromJSDate(dateRange.to, { zone: "Asia/Kolkata" })
    .endOf("day")
    .toUTC();

  return {
    from: startOfDay.toMillis().toString(),
    to: endOfDay.toMillis().toString(),
  };
};

export const fromDateIstDateTime = (date: Date) =>
  DateTime.fromJSDate(date, {
    zone: "Asia/Kolkata",
  });

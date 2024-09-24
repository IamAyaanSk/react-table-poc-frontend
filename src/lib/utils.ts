import { SortingState } from "@tanstack/react-table";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrentSortingOrderArray(sortingParams: string) {
  if (!sortingParams) return [];
  const initialArray: SortingState = [];
  const orderByArray = sortingParams.split(",").reduce((acc, curr) => {
    const [key, value] = [curr.slice(1), curr[0]];

    const desc = value === "-" ? true : false;

    acc.push({
      id: key,
      desc: desc,
    });

    return acc;
  }, initialArray);

  return orderByArray;
}

export function getCurrentSortingOrderParamString(sortingArray: SortingState) {
  return sortingArray
    .map((sort) => {
      return `${sort.desc ? "-" : "+"}${sort.id}`;
    })
    .join(",");
}

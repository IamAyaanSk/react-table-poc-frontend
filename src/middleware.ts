import { NextRequest, NextResponse } from "next/server";
import { getUtcTimestampsForSelectedDates } from "./lib/utils";

const addDateParams = (url: URL) => {
  const todayDates = getUtcTimestampsForSelectedDates({
    from: new Date(),
    to: new Date(),
  });

  url.searchParams.set("startDate", todayDates.from);
  url.searchParams.set("endDate", todayDates.to);

  return url;
};

const addDataTablePageParams = (url: URL) => {
  url.searchParams.set("page", "1");
  url.searchParams.set("pageSize", "200");

  return url;
};

export default async function middleWareFunc(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/ledgers", req.nextUrl.origin));
  }
  // Add date params to specific routes
  const routesNeedingDateParams: string[] = [];

  const dataTableRoutesNeedingDateParams = ["/ledgers"];
  const dataTableRoutesWithoutDateParams: string[] = [];

  if (routesNeedingDateParams.includes(req.nextUrl.pathname)) {
    const { searchParams } = req.nextUrl;

    if (!searchParams.get("startDate") || !searchParams.get("endDate")) {
      return NextResponse.redirect(addDateParams(new URL(req.nextUrl.href)));
    }
  }

  if (dataTableRoutesWithoutDateParams.includes(req.nextUrl.pathname)) {
    const { searchParams } = req.nextUrl;

    if (!searchParams.get("page") || !searchParams.get("pageSize")) {
      return NextResponse.redirect(
        addDataTablePageParams(new URL(req.nextUrl.href))
      );
    }
  }

  if (dataTableRoutesNeedingDateParams.includes(req.nextUrl.pathname)) {
    const { searchParams } = req.nextUrl;

    if (!searchParams.get("startDate") || !searchParams.get("endDate")) {
      const urlWithPageParams = addDataTablePageParams(
        new URL(req.nextUrl.href)
      );
      const urlWithDateParams = addDateParams(urlWithPageParams);

      return NextResponse.redirect(urlWithDateParams);
    }
  }
}

export const config = {
  // matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source:
        "/((?!api|_next/static|_next/image|assets|web|media|fonts|favicon.ico|favicon.png).*)",
      missing: [
        // Exclude Server Actions
        { type: "header", key: "next-action" },
      ],
    },
  ],
};

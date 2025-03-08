## React table POC

This is a basic POC which I developed as a proof of concept when we wanted a table component which implements server side functionalities including sorting, searching, filtering, pagination, total records and dynamic page sizes.

-------------

## Features
- A really dynamic and configurable DataTable component which supports server side table features.
- Provided an easy config option to control visibility of various columns based on  various roles.
- Created a Date range filter to allow user select data within a range.
- Provided cap to restrict past data lookup upto certain period on both backend and frontend.
- Also added a cap on maximum selectable range on both backend and frontend.
- Added dynamic facet filters for enum values.
- Added a summary row to display computed data using Table Meta provided by React Table.

-------------

## Tech
- Nextjs
- React
- Postgres
- Prisma
- Nodejs
- Express
- Zod
- Qs
- React Table
- Shadcn
- Render ( Please wait for initial request when using live URL as the backend is hosted on free tier )
- Vercel

-------------

## How it improved performance 

After I integrated this, the following results were obtained
- Initially every table functionality was done at client side, moving it to server the app ultimately became highly scalable.
- We reduced bandwidth usage significantly as only the filtered, paginated data is fetched from the d=server.
- The app performance increased as the calculations were no longer done on the client side.
- Developed a better and more consistent and responsive User Interface.

## Author
### Ayaan

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

const makeApiPath = (base: string) => `${BASE_API_URL}/${base}`;

export const API_PATHS = {
  LEDGERS: makeApiPath("ledgers"),
};

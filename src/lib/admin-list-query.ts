export function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function buildAdminListUrl(input: {
  pathname: string;
  searchParams: URLSearchParams;
  values: Record<string, string | number>;
  defaults: Record<string, string | number>;
}): string {
  const params = new URLSearchParams(input.searchParams.toString());

  for (const [key, value] of Object.entries(input.values)) {
    const defaultValue = input.defaults[key];

    if (String(value) === String(defaultValue) || value === "") {
      params.delete(key);
      continue;
    }

    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `${input.pathname}?${queryString}` : input.pathname;
}

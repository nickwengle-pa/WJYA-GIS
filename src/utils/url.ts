export const appendQueryParams = (baseUrl: string, params: Record<string, string | number | boolean | undefined>): string => {
  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

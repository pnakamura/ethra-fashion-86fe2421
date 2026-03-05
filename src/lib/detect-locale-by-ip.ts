const LUSOPHONE_COUNTRIES = ['BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL'];

export async function detectLocaleByIP(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const data = await response.json();
    const countryCode = data?.country_code;

    if (!countryCode) return null;

    return LUSOPHONE_COUNTRIES.includes(countryCode) ? 'pt-BR' : 'en-US';
  } catch {
    return null;
  }
}

import { useTranslation } from 'react-i18next';
import { ptBR, enUS } from 'date-fns/locale';
import type { Locale } from 'date-fns';

interface LocaleConfig {
  locale: string;
  dateFnsLocale: Locale;
  dateFormat: {
    short: string;
    long: string;
    monthYear: string;
  };
  currency: {
    code: string;
    symbol: string;
    locale: string;
  };
  changeLanguage: (lng: string) => Promise<void>;
}

export function useLocale(): LocaleConfig {
  const { i18n } = useTranslation();
  const locale = i18n.language || 'pt-BR';

  const isPtBR = locale.startsWith('pt');

  return {
    locale,
    dateFnsLocale: isPtBR ? ptBR : enUS,
    dateFormat: isPtBR
      ? { short: 'dd/MM/yyyy', long: "dd 'de' MMMM 'de' yyyy", monthYear: "MMMM 'de' yyyy" }
      : { short: 'MM/dd/yyyy', long: 'MMMM dd, yyyy', monthYear: 'MMMM yyyy' },
    currency: isPtBR
      ? { code: 'BRL', symbol: 'R$', locale: 'pt-BR' }
      : { code: 'USD', symbol: '$', locale: 'en-US' },
    changeLanguage: async (lng: string) => {
      await i18n.changeLanguage(lng);
      localStorage.setItem('ethra-locale', lng);
    },
  };
}

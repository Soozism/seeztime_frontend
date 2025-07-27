import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fa from './fa';

const resources = {
  fa: {
    translation: fa,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fa',
    fallbackLng: 'fa',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

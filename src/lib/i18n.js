
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: { "welcome": "Welcome to ArthaQuest", "micro_decision": "A friend asks to borrow ₹200 and says he'll return it Friday. What do you do?" } },
  te: { translation: { "welcome": "అర్థక్వెస్ట్ కు స్వాగతం" } },
  ur: { translation: { "welcome": "آرتھ کویسٹ میں خوش آمدید" } },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;

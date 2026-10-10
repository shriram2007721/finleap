
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export default function RootShell() {
  const { i18n } = useTranslation();

  // Handle RTL for Urdu
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="min-h-screen font-sans text-[#241632] bg-[#E8F1EE]">
      <header className="flex justify-between items-center p-4 bg-[#FBFDFC] shadow-sm">
        <h1 className="font-bold text-xl text-[#C2185B]">ArthaQuest</h1>
        <div className="flex gap-2">
          <button onClick={() => i18n.changeLanguage('en')} className="px-2 py-1 text-sm border rounded">EN</button>
          <button onClick={() => i18n.changeLanguage('te')} className="px-2 py-1 text-sm border rounded">TE</button>
          <button onClick={() => i18n.changeLanguage('ur')} className="px-2 py-1 text-sm border rounded">UR</button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="p-4 text-center text-sm text-gray-500 mt-8 border-t border-gray-200">
        Learning simulation. No real money.
      </footer>
    </div>
  );
}

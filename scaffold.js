import fs from 'fs';
import path from 'path';

const dirs = [
  'src/lib',
  'src/lib/data',
  'src/lib/store',
  'src/components',
  'src/pages',
  'src/pages/public',
  'src/pages/student',
  'src/pages/school',
  'src/pages/ngo',
];

dirs.forEach(d => fs.mkdirSync(path.resolve(d), { recursive: true }));

// 1. i18n setup
fs.writeFileSync(path.resolve('src/lib/i18n.js'), `
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
`);

// 2. Mock Adapter (Dexie + Data Layer)
fs.writeFileSync(path.resolve('src/lib/data/mockAdapter.js'), `
import Dexie from 'dexie';

export const db = new Dexie('ArthaQuestDB');
db.version(1).stores({
  programs: 'id, ngoId, status',
  schools: 'id, status, programId',
  classes: 'id, schoolId, joinCode',
  learners: 'id, classId',
  attempts: 'id, learnerId, skillId',
  rewards: 'id, learnerId',
});

// Deterministic Seeding will be implemented here
export async function seedMockData() {
  const count = await db.programs.count();
  if (count > 0) return; // Already seeded

  await db.programs.add({
    id: 'prog-1', ngoId: 'ngo-1', name: 'Financial Literacy for Grades 11-12, Hyderabad',
    version: '1.0', grades: [11, 12], region: 'Hyderabad', weeks: 8,
    languages: ['en', 'te', 'ur'], objectives: [], pillars: ['budget', 'save', 'invest', 'safe'],
    status: 'published', targetLearners: 1500, createdAt: new Date().toISOString()
  });

  // Additional seeds (schools, classes, learners) go here
}
`);

// 3. Zustand Store
fs.writeFileSync(path.resolve('src/lib/store/useAppStore.js'), `
import { create } from 'zustand';

export const useAppStore = create((set) => ({
  role: 'student', // student | teacher | school_coordinator | ngo_admin
  learnerId: null,
  setRole: (role) => set({ role }),
  setLearner: (id) => set({ learnerId: id }),
}));
`);

// 4. Router Setup
fs.writeFileSync(path.resolve('src/lib/router.jsx'), `
import { createBrowserRouter } from 'react-router-dom';
import RootShell from '../components/RootShell';
import Home from '../pages/public/Home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootShell />,
    children: [
      { index: true, element: <Home /> },
      // Other routes to be implemented: /demo, /join, /login/staff, /ngo, /school, /learn
    ],
  }
]);
`);

// 5. Root Shell (UI Tokens & Navigation)
fs.writeFileSync(path.resolve('src/components/RootShell.jsx'), `
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
`);

// 6. Home Page (Bazaar Street Hero)
fs.writeFileSync(path.resolve('src/pages/public/Home.jsx'), `
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function Home() {
  const { t } = useTranslation();
  const [choice, setChoice] = useState(null);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-[#E5DADB]">
        <div className="bg-[#F2A900] p-6 text-[#241632]">
          <h2 className="text-2xl font-black mb-2">The Bazaar</h2>
          <p className="font-medium text-lg">A playable street of financial choices.</p>
        </div>
        
        {/* Micro-decision hero */}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">{t('micro_decision')}</h3>
          {!choice ? (
            <div className="flex flex-col gap-3">
              <button onClick={() => setChoice('lend')} className="bg-[#0E8F6B] text-white p-4 rounded-xl font-bold text-left hover:opacity-90">
                Lend the ₹200 (I have enough)
              </button>
              <button onClick={() => setChoice('say_no')} className="bg-[#C2185B] text-white p-4 rounded-xl font-bold text-left hover:opacity-90">
                Say no (I need it for a bus pass)
              </button>
            </div>
          ) : (
            <div className="bg-[#E6F4EC] p-4 rounded-xl border border-[#14613A]">
              <p className="font-bold text-[#14613A]">
                {choice === 'lend' 
                  ? "You lent the money. Friday comes, and he forgets. You now have to walk to college. Lesson: Only lend what you can afford to lose."
                  : "You kept the money. It felt awkward, but your bus pass is secure. Lesson: Budget for needs before social pressure."}
              </p>
              <button onClick={() => setChoice(null)} className="mt-4 underline font-bold text-[#1E9FC2]">Try another choice</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-6 bg-white rounded-xl shadow border border-gray-200 font-bold hover:border-[#C2185B]">Enter as Student</button>
        <button className="p-6 bg-white rounded-xl shadow border border-gray-200 font-bold hover:border-[#1E9FC2]">Enter as Teacher</button>
        <button className="p-6 bg-white rounded-xl shadow border border-gray-200 font-bold hover:border-[#F2A900]">Enter as NGO Admin</button>
      </div>
    </div>
  );
}
`);

console.log('Scaffolding complete.');

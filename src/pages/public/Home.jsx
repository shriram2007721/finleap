
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

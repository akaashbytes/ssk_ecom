import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { useLanguageStore } from '../stores/useLanguageStore';

export const AboutUsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'about';
  const [activeTab, setActiveTab] = useState<'about' | 'faq'>(activeTabParam === 'faq' ? 'faq' : 'about');
  const { language } = useLanguageStore();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleTabChange = (tab: 'about' | 'faq') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const faqItems = [
    {
      q: 'What is Marachekku / Vaagai Wood Pressed Oil?',
      qTa: 'மரச்செக்கு / வாகை மர எண்ணெய் என்றால் என்ன?',
      a: 'Marachekku refers to the centuries-old traditional South Indian method of cold-pressing edible oil seeds using a pestle and mortar crafted from heavy Vaagai wood (Albizia lebbeck). Because the pestle rotates at very low RPMs without electric motor friction heat, the oil temperature never exceeds 42°C, preserving all delicate micronutrients, natural aroma, and essential fatty acids.',
      aTa: 'வாகை மர உரலில் மெதுவாக ஆட்டி எடுக்கப்படும் எண்ணெய் மரச்செக்கு எண்ணெய் எனப்படும். உராய்வு வெப்பம் ஏறாமல் 42°C-க்கு குறைவாக பிழியப்படுவதால், இயற்கையான சத்துக்களும் மணமும் முழுமையாக காக்கப்படுகிறது.',
    },
    {
      q: 'Why do you add Karupatti (Palm Jaggery) to Sesame Oil?',
      qTa: 'நல்லெண்ணெயில் பனை கருப்பட்டி சேர்ப்பது ஏன்?',
      a: 'Authentic Tamil cold-press tradition pairs black sesame seeds with pure unrefined palm jaggery (Karupatti). The jaggery acts as a natural binder during wood crushing, moderates temperature, balances bitter sesamol notes with pleasant earthy sweetness, and prevents seed rancidity without chemical preservatives.',
      aTa: 'கருப்பட்டி சேர்த்து ஆட்டும் போது எள்ளின் கசப்புத்தன்மை நீங்கி, உடலுக்கு உஷ்ணம் தணிக்கக் கூடிய தனித்துவமான சுவையும் நறுமணமும் கிடைக்கிறது. இது பாரம்பரிய ஆரோக்கிய முறை.',
    },
    {
      q: 'Is there any sediment or cloudiness in SSK Natural Gold oils?',
      qTa: 'எண்ணெயில் ஏதேனும் வண்டல் அல்லது அடர்த்தி இருக்குமா?',
      a: 'Yes, slight natural sediment at the bottom of the bottle is absolute proof of authentic unrefined cold-pressed oil! Commercial refined oils use acid neutralization and bleaching clay to make oil look like transparent water. We only filter our oil through unbleached natural cotton cloth after 48 hours of natural gravity settling.',
      aTa: 'ஆம், சிறிதளவு இயற்கை வண்டல் இருப்பது கலப்படமற்ற உண்மையான மரச்செக்கு எண்ணெயின் முக்கிய அடையாளம்! ரசாயன வடிகட்டுதல் இன்றி இயற்கை பருத்தி துணியில் மட்டுமே வடிக்கப்படுகிறது.',
    },
    {
      q: 'What is the shelf life of your cold-pressed oils?',
      qTa: 'எண்ணெயின் ஆயுட்காலம் எவ்வளவு?',
      a: 'Stored in a cool, dry place away from direct sunlight, our pure cold-pressed oils have a natural shelf life of 6 months from the date of extraction. Always keep the tamper-proof cap tightly closed after everyday cooking.',
      aTa: 'நேரடி வெயில் படாமல் குளிர்ந்த இடத்தில் வைத்தால், தயாரிப்பு தேதியிலிருந்து 6 மாதங்கள் வரை அதன் தரம் மற்றும் சுவை மாறாமல் இருக்கும்.',
    },
    {
      q: 'Do you offer bulk supply for restaurants and sweet manufacturers?',
      qTa: 'உணவகங்கள் மற்றும் பலகார தயாரிப்பாளர்களுக்கு மொத்த விற்பனை உண்டா?',
      a: 'Yes! We supply food-grade 15-Litre commercial tins directly from our Tenkasi mill to leading sweet shops, traditional caterers, and organic retailers across Tamil Nadu and South India at wholesale pricing. Visit our Wholesale B2B page to submit your requirement.',
      aTa: 'நிச்சயமாக! 15 லிட்டர் டின் மற்றும் பெரிய அளவுகளில் உணவகங்கள், பலகார கடைகள் மற்றும் வியாபாரிகளுக்கு மொத்த விலையில் நேரடியாக ஆலை டெலிவரி செய்கிறோம்.',
    },
    {
      q: 'What are your delivery timelines and FSSAI credentials?',
      qTa: 'டெலிவரி காலம் மற்றும் FSSAI உரிமம் விபரம் என்ன?',
      a: 'All orders are dispatched within 24 hours of fresh extraction. Deliveries within Tamil Nadu take 1-3 business days, while pan-India delivery takes 4-6 business days. Our operations are registered under Central FSSAI License No. 22426293000431 [Demo Placeholder / Not Verified].',
      aTa: 'ஆர்டர் செய்த 24 மணி நேரத்தில் தென்காசி ஆலையிலிருந்து அனுப்பி வைக்கப்படும். தமிழ்நாட்டிற்குள் 1-3 நாட்களுக்குள் பாதுகாப்பாக வந்து சேரும். மத்திய FSSAI உரிமம் எண்: 22426293000431 [டெமோ].',
    },
  ];

  return (
    <CustomerLayout>
      <div className="w-full max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <Link to="/" className="hover:text-brand-slate transition">
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-brand-slate font-bold">
            {activeTab === 'about' ? 'About Our Mill (ஆலை பற்றி)' : 'FAQ Hub (கேள்வி பதில்)'}
          </span>
        </nav>

        {/* Tab Toggle Switch (Matching Stitch Screen fbbae8fd...) */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => handleTabChange('about')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-brand-slate text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌿 Heritage & Extraction (ஆலை வரலாறு)
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('faq')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-brand-slate text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ❓ FAQ Hub (அடிக்கடி கேட்கப்படும் கேள்விகள்)
            </button>
          </div>
        </div>

        {activeTab === 'about' ? (
          /* About Us Heritage Story */
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-surface-border shadow-card space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Tenkasi Traditional Mill Heritage
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-brand-slate tracking-tight">
                Preserving Centered Wellness in Every Cold-Pressed Drop
              </h1>
              <p className="text-sm font-semibold text-amber-700 font-tamil">
                வாகை மரச்செக்கில் பிழியப்படும் தூய பாரம்பரிய எண்ணெய்
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                Founded by Sivasakthi Enterprises in the foothills of Tenkasi, Tamil Nadu, SSK Natural Gold was established with a singular mission: to bring 100% unadulterated, unheated, single-origin cold-pressed oils back into modern Indian kitchens without industrial compromises.
              </p>
            </div>

            {/* 4-Stage Extraction Pipeline */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-surface-border shadow-card space-y-6">
              <h2 className="text-xl font-black text-brand-slate tracking-tight">
                Our 4-Stage Traditional Cold-Press Process
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-black flex items-center justify-center text-sm">
                    1
                  </div>
                  <h3 className="font-bold text-sm text-brand-slate">Single-Origin Seed Selection</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Saurashtra peanuts, Pollachi sun-dried whole copra, and native black sesame seeds sorted rigorously by hand to reject mold and contaminants.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-black flex items-center justify-center text-sm">
                    2
                  </div>
                  <h3 className="font-bold text-sm text-brand-slate">Slow Vaagai Wood Mortar Churn</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Heavy pestles rotate at under 14 RPM. Friction heat is naturally absorbed by the Vaagai wood, keeping oil below 42°C throughout crushing.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-black flex items-center justify-center text-sm">
                    3
                  </div>
                  <h3 className="font-bold text-sm text-brand-slate">48-Hour Gravity Cloth Filtration</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Zero chemical flocculants or bleaching clays. The freshly pressed oil settles naturally for two days and is passed through sterile cotton cloth.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-black flex items-center justify-center text-sm">
                    4
                  </div>
                  <h3 className="font-bold text-sm text-brand-slate">Tamper-Proof Direct Mill Bottling</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Poured into virgin food-grade PET bottles and reinforced tins, batch coded, and sealed with tamper-evident induction foil for doorstep dispatch.
                  </p>
                </div>
              </div>
            </div>

            {/* Quality Commitments */}
            <div className="p-6 sm:p-8 rounded-3xl bg-brand-slate text-white space-y-4">
              <h2 className="text-lg font-black tracking-tight">Our Statutory Quality Guarantee</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                  <p className="font-bold text-amber-400">0% Sulphur & Hexane</p>
                  <p className="text-slate-300 mt-1">Never extracted with petroleum solvents or industrial bleaching acids.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                  <p className="font-bold text-amber-400">Direct From Mill</p>
                  <p className="text-slate-300 mt-1">Eliminating middlemen ensures honest rates and fresh milling batches.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                  <p className="font-bold text-amber-400">FSSAI Lic. 22426293000431 <span className="text-[10px] text-amber-200 font-normal">[Demo / Not Verified]</span></p>
                  <p className="text-slate-300 mt-1">Facility in Tenkasi district (Demonstration record).</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* FAQ Accordion Section */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-surface-border shadow-card space-y-4 animate-fadeIn">
            <div className="pb-4 border-b border-slate-100">
              <h1 className="text-2xl font-black text-brand-slate">
                Frequently Asked Questions
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Everything you need to know about our cold-pressed oils, extraction methodology, and delivery.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {faqItems.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-4">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-brand-slate hover:text-brand-amber transition cursor-pointer"
                    >
                      <div>
                        <span>{language === 'ta' ? item.qTa : item.q}</span>
                        <span className="block text-xs font-semibold text-amber-700 font-tamil mt-0.5">
                          {item.qTa}
                        </span>
                      </div>
                      <span className="text-lg text-slate-400 shrink-0 font-mono">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="mt-3 text-xs text-slate-600 leading-relaxed pl-2 border-l-2 border-brand-amber animate-slideDown">
                        <p>{language === 'ta' ? item.aTa : item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

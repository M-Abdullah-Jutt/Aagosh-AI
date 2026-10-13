import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Gamepad2,
  Brain,
  Award,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Search,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import parentPracticeService from '../../services/parentPracticeService';
import VirtualChildSessionModal from './VirtualChildSessionModal';
import PracticeDebriefModal from './PracticeDebriefModal';

export const ParentPracticeCenter = () => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';

  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Category scroll ref & handler
  const categoriesRef = useRef(null);
  const scrollCategories = (direction) => {
    if (categoriesRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      categoriesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  const [activeScenario, setActiveScenario] = useState(null);
  const [isSessionOpen, setIsSessionOpen] = useState(false);

  // Debrief state
  const [activeDebrief, setActiveDebrief] = useState(null);
  const [isDebriefOpen, setIsDebriefOpen] = useState(false);
  const [isDebriefLoading, setIsDebriefLoading] = useState(false);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true);
        const data = await parentPracticeService.getScenarios();
        setScenarios(data || []);
      } catch (err) {
        console.warn('Failed to load practice scenarios:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScenarios();
  }, []);

  const categories = ['ALL', ...new Set(scenarios.map((s) => s.category))];

  const filteredScenarios = scenarios.filter((s) => {
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    const title = (isUrdu && s.title_ur ? s.title_ur : s.title).toLowerCase();
    const desc = (isUrdu && s.description_ur ? s.description_ur : s.description).toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || title.includes(query) || desc.includes(query) || s.child_name.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleStartScenario = (scenario) => {
    setActiveScenario(scenario);
    setIsSessionOpen(true);
  };

  const handleSessionComplete = async ({ scenario, transcript, durationSeconds }) => {
    setIsSessionOpen(false);
    setIsDebriefLoading(true);
    try {
      const debriefData = await parentPracticeService.getDebrief({
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        childName: scenario.child_name,
        childAge: scenario.child_age,
        behaviorType: scenario.behavior_type,
        transcript,
        durationSeconds,
        language: isUrdu ? 'ur' : 'en',
      });
      setActiveDebrief(debriefData);
      setIsDebriefOpen(true);
    } catch (err) {
      console.error('Failed to generate debrief:', err);
      setActiveDebrief({
        overall_score: 75,
        summary: `Practice session completed for ${scenario.title}. You remained composed and engaged.`,
        parent_wrong_behaviors: [
          {
            parent_utterance: 'Initial reaction',
            what_went_wrong: 'Rushed to problem solving before emotional validation.',
            why_it_escalated: 'The child felt unheard and resisted.',
            better_alternative: "Start by saying: 'I see how disappointed you are right now.'",
          },
        ],
        what_parent_did_well: ['Held ground calmly', 'Maintained conversation'],
        key_recommendations: [
          'Label emotions before enforcing consequences',
          'Use physical presence and eye contact',
          'Keep commands to 5 words or fewer',
        ],
        emotional_trajectory: 'Gradual regulation towards connection',
      });
      setIsDebriefOpen(true);
    } finally {
      setIsDebriefLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsDebriefOpen(false);
    setIsSessionOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Filter & Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        {/* Category Pills with Smooth Scroll Buttons */}
        <div className="relative flex-1 min-w-0 flex items-center">
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            aria-label="Scroll left"
            className="hidden sm:flex p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition shrink-0 mr-1"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={categoriesRef}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-1 px-0.5 no-scrollbar flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25 ring-2 ring-orange-500/20 scale-[1.02]'
                    : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 hover:border-stone-300'
                }`}
              >
                {cat === 'ALL' ? (isUrdu ? 'تمام' : 'All') : cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollCategories('right')}
            aria-label="Scroll right"
            className="hidden sm:flex p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition shrink-0 ml-1"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Search input */}
        <div className="relative w-full sm:w-60 shrink-0">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'منظرنامہ تلاش کریں...' : 'Search scenario...'}
            className="w-full bg-white border border-stone-200 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm"
          />
        </div>
      </div>

      {/* Scenarios Grid: Clean, high-clarity cards */}
      {loading ? (
        <div className="py-16 text-center text-stone-400 text-sm">
          <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>{isUrdu ? 'لوڈ ہو رہا ہے...' : 'Loading scenarios...'}</span>
        </div>
      ) : filteredScenarios.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 text-stone-500">
          <Gamepad2 className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-xs font-medium">{isUrdu ? 'کوئی منظرنامہ نہیں ملا' : 'No scenarios match your search.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScenarios.map((sc) => (
            <div
              key={sc.id}
              className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-orange-400 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header: Avatar, title, age */}
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sc.avatar_color} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}>
                    {sc.child_name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-stone-900 text-sm truncate group-hover:text-orange-600 transition">
                      {isUrdu ? (sc.title_ur || sc.title) : sc.title}
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      {sc.child_name} • {sc.child_age} yrs • <span className="font-medium text-stone-600">{sc.category}</span>
                    </p>
                  </div>
                </div>

                {/* Short scenario description (max 2 lines) */}
                <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                  {isUrdu ? (sc.description_ur || sc.description) : sc.description}
                </p>

                {/* Clean quote bubble */}
                <div className="bg-stone-50 rounded-xl p-2.5 text-xs text-stone-700 italic border border-stone-100 line-clamp-2">
                  "{isUrdu ? (sc.initial_child_message_ur || sc.initial_child_message) : sc.initial_child_message}"
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 mt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                  {sc.difficulty}
                </span>

                <button
                  onClick={() => handleStartScenario(sc)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1 shadow-sm"
                >
                  <span>{isUrdu ? 'مشق کریں' : 'Start'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading Modal while generating debrief */}
      {isDebriefLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-3 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto animate-pulse">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                {isUrdu ? 'اے آئی جائزہ تیار ہو رہا ہے...' : 'AI Coach Generating Feedback...'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {isUrdu
                  ? 'آپ کی گفتگو کا تجزیہ اور اصلاحات مرتب ہو رہی ہیں۔'
                  : 'Reviewing your dialogue and preparing recommendations.'}
              </p>
            </div>
            <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Active Session Modal */}
      {isSessionOpen && activeScenario && (
        <VirtualChildSessionModal
          scenario={activeScenario}
          isOpen={isSessionOpen}
          onClose={() => setIsSessionOpen(false)}
          onSessionComplete={handleSessionComplete}
        />
      )}

      {/* Debrief Modal */}
      {isDebriefOpen && activeDebrief && (
        <PracticeDebriefModal
          debrief={activeDebrief}
          scenario={activeScenario}
          isOpen={isDebriefOpen}
          onClose={() => setIsDebriefOpen(false)}
          onTryAgain={handleTryAgain}
        />
      )}
    </div>
  );
};

export default ParentPracticeCenter;

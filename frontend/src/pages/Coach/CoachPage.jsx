import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import childrenService from '../../services/childrenService';
import coachService from '../../services/coachService';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizeOptions } from '../../utils/i18nOptions';
import { ANALYSIS_PERIODS } from '../../utils/checkInConstants';

/** Renders **bold** markdown and \n as <br/> */
function RichText({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>;
        }
        return part.split('\n').map((line, j) => (
          <React.Fragment key={`${i}-${j}`}>
            {j > 0 && <br />}
            {line}
          </React.Fragment>
        ));
      })}
    </>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-emerald-500"
          style={{ display: 'inline-block', animation: `dotBounce 1.3s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  );
}

function Avatar({ large = false }) {
  const { t } = useLanguage();
  return (
    <div
      className={`rounded-full shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm ${
        large ? 'w-14 h-14 rounded-2xl shadow-md shadow-emerald-200' : 'w-8 h-8 mt-0.5'
      }`}
    >
      <span className={`text-white font-bold ${large ? 'text-xl font-black' : 'text-[10px]'}`}>
        {t('coach.aiInitial')}
      </span>
    </div>
  );
}

function MessageBubble({ msg }) {
  const { t, formatTime } = useLanguage();
  const isUser = msg.role === 'user';
  const [srcOpen, setSrcOpen] = useState(false);

  const keyPoints = msg.key_points?.length ? msg.key_points
    : (msg.metadata?.key_points?.length ? msg.metadata.key_points : []);
  const steps = msg.suggested_steps?.length ? msg.suggested_steps
    : (msg.metadata?.suggested_steps?.length ? msg.metadata.suggested_steps : []);
  const sources = Array.isArray(msg.source_references) ? msg.source_references : [];
  const isWelcome = msg.metadata?.model === 'welcome-init';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%]">
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">
            {msg.content}
          </div>
          <p className="text-[10px] text-slate-400 text-right mt-1 pr-0.5">{formatTime(msg.created_at)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-5 max-w-[88%]">
      <Avatar />

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-emerald-700 mb-1.5">
          {isWelcome ? t('coach.welcomeLabel') : t('coach.groundedLabel')}
        </p>

        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden">
          <div className="px-4 py-3.5">
            <p className="text-sm text-slate-700 leading-7">
              <RichText text={msg.content || msg.answer} />
            </p>
          </div>

          {keyPoints.length > 0 && (
            <div className="mx-4 mb-3.5 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-2">{t('coach.keyTakeaways')}</p>
              <ul className="space-y-1.5">
                {keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-emerald-600 shrink-0 font-bold mt-0.5">✓</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {steps.length > 0 && (
            <div className="mx-4 mb-3.5 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-2">{t('coach.actionSteps')}</p>
              <ol className="space-y-2">
                {steps.map((st, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {st}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {sources.length > 0 && (
            <div className="mx-4 mb-3">
              <button
                onClick={() => setSrcOpen(v => !v)}
                className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
              >
                {srcOpen ? '▾' : '▸'} {t('coach.sourcesCited', { count: sources.length, n: sources.length })}
              </button>
              {srcOpen && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {sources.map((s, i) => (
                    <span key={i} className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded font-mono">
                      {s.source}{s.page ? ` · p.${s.page}` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            {!isWelcome && (
              <span className="text-[9px] text-slate-400 italic">{t('coach.notClinical')}</span>
            )}
            {isWelcome && <span />}
            <span className="text-[9px] text-slate-400">{formatTime(msg.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConvItem({ conv, active, onClick, onArchive }) {
  const { t, formatDate } = useLanguage();
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if(e.key === 'Enter') onClick(); }}
      className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all ${
        active
          ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold truncate">{conv.title || t('coach.untitledSession')}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {formatDate(conv.updated_at, { month: 'short', day: 'numeric' })}
        </p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onArchive(conv.id); }}
        aria-label={t('common.delete')}
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 text-lg leading-none ml-1 transition"
      >
        ×
      </button>
    </div>
  );
}

export default function CoachPage() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { t, lang, formatAgeShort } = useLanguage();

  const [child, setChild] = useState(null);
  const [childrenList, setChildrenList] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState('');
  const [period, setPeriod] = useState('30d');
  const [sending, setSending] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError] = useState(null);

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  const isThinking = sending || initializing;
  const lastMsg = messages[messages.length - 1];
  const starters = [
    { emoji: '😤', text: t('coach.starters.1') },
    { emoji: '🌙', text: t('coach.starters.2') },
    { emoji: '👨‍👧‍👦', text: t('coach.starters.3') },
    { emoji: '📱', text: t('coach.starters.4') },
  ];


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isThinking]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingConvs(true);
        setError(null);
        const allChildren = await childrenService.getChildren();
        setChildrenList(allChildren || []);
        const found = (allChildren || []).find(c => c.id.toString() === childId.toString());
        if (!found && allChildren?.length > 0) { navigate(`/children/${allChildren[0].id}/coach`); return; }
        setChild(found || null);
        const convs = await coachService.getConversations(childId);
        setConversations(convs || []);
        if (convs?.length > 0) setActiveConvId(convs[0].id);
      } catch {
        setError(t('coach.loadError'));
      } finally {
        setLoadingConvs(false);
      }
    };
    load();
  }, [childId, navigate, t]);

  useEffect(() => {
    if (!activeConvId) { setMessages([]); return; }
    const load = async () => {
      try {
        setLoadingMsgs(true);
        const detail = await coachService.getConversationDetail(childId, activeConvId);
        setMessages(detail.messages || []);
      } catch { /* silent */ }
      finally { setLoadingMsgs(false); }
    };
    load();
  }, [activeConvId, childId]);

  const handleNewConversation = async () => {
    try {
      setError(null);
      const newConv = await coachService.createConversation(childId, t('coach.newConversationTitle'));
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setMessages([]);
      setInitializing(true);
      abortControllerRef.current = new AbortController();
      try {
        const welcome = await coachService.initializeConversation(childId, newConv.id, lang, abortControllerRef.current.signal);
        setMessages([welcome]);
        const updated = await coachService.getConversations(childId);
        setConversations(updated || []);
      } catch (e) {
        if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') {
          console.warn('Welcome init failed:', e);
        }
      } finally {
        abortControllerRef.current = null;
        setInitializing(false);
      }
    } catch { setError(t('coach.createError')); }
  };

  const handleArchive = async (convId) => {
    if (!window.confirm(t('coach.archiveConfirm'))) return;
    try {
      await coachService.archiveConversation(childId, convId);
      const updated = conversations.filter(c => c.id !== convId);
      setConversations(updated);
      if (activeConvId === convId) setActiveConvId(updated[0]?.id ?? null);
    } catch { setError(t('coach.archiveError')); }
  };

  const handleSend = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || isThinking) return;
    let targetId = activeConvId;
    setSending(true);
    setError(null);
    setInput('');
    const tempId = `tmp-${Date.now()}`;
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: text, created_at: new Date().toISOString() }]);

    abortControllerRef.current = new AbortController();

    try {
      if (!targetId) {
        const newConv = await coachService.createConversation(childId, t('coach.newConversationTitle'));
        setConversations(prev => [newConv, ...prev]);
        targetId = newConv.id;
        setActiveConvId(newConv.id);
      }
      await coachService.sendMessage(childId, targetId, text, period, lang, abortControllerRef.current.signal);
      const detail = await coachService.getConversationDetail(childId, targetId);
      setMessages(detail.messages || []);
      const convs = await coachService.getConversations(childId);
      setConversations(convs || []);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || err.message === 'canceled') {
        // Silently handle cancellation
      } else {
        setError(err.response?.data?.detail || t('coach.sendError'));
      }
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      abortControllerRef.current = null;
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const shortAge = (c) => (c?.date_of_birth ? formatAgeShort(c.date_of_birth) : '');
  const childAge = shortAge(child);
  const childName = child?.first_name || t('coach.childFallback');
  const periods = localizeOptions(t, ANALYSIS_PERIODS);

  return (
    <div className="py-6">
      {/* Page header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link
            to={`/children/${childId}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-700 transition mb-1"
          >
            {t('common.backToProfile', { name: child?.first_name || t('coach.childLabelFallback') })}
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {t('coach.title')}
            {child && (
              <span className="text-sm font-normal text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                {child.first_name}{childAge ? ` · ${childAge}` : ''}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t('coach.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            aria-label={t('analytics.periodLabel')}
            className="bg-white border border-slate-200 text-slate-600 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {periods.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <Link
            to={`/children/${childId}/check-ins/new`}
            className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
          >
            {t('coach.addCheckIn')}
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex justify-between items-center">
          {error}
          <button
            onClick={() => setError(null)}
            aria-label={t('common.close')}
            className="text-red-400 hover:text-red-700 font-bold text-lg leading-none ml-3"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex gap-5 h-[600px] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Conversations sidebar */}
        <aside className="w-56 shrink-0 border-r border-slate-100 flex flex-col bg-slate-50/60">
          <div className="p-3 border-b border-slate-100 space-y-2.5">
            {childrenList.length > 1 && (
              <select
                value={childId}
                onChange={e => navigate(`/children/${e.target.value}/coach`)}
                aria-label={t('nav.children')}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {childrenList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.first_name}{shortAge(c) ? ` · ${shortAge(c)}` : ''}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={handleNewConversation}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              {t('coach.newChat')}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            <p className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('coach.recentSessions')}</p>
            {loadingConvs ? (
              <p className="text-xs text-slate-400 text-center py-4">{t('coach.loadingSessions')}</p>
            ) : conversations.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-6 px-3 leading-relaxed italic">
                {t('coach.noSessions')}
              </p>
            ) : (
              conversations.map(conv => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  active={conv.id === activeConvId}
                  onClick={() => setActiveConvId(conv.id)}
                  onArchive={handleArchive}
                />
              ))
            )}
          </div>
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          <div className="shrink-0 h-11 border-b border-slate-100 px-4 flex items-center bg-white">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            <span className="text-xs font-semibold text-slate-600">
              {activeConvId
                ? conversations.find(c => c.id === activeConvId)?.title || t('coach.chatFallback')
                : t('coach.startConversation')}
            </span>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-5 bg-slate-50/40">

            {!activeConvId && !loadingConvs && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-5 px-4">
                <Avatar large />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{t('coach.emptyTitle')}</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    {t('coach.emptyBody', { name: childName })}
                  </p>
                </div>
                <button
                  onClick={handleNewConversation}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                >
                  {t('coach.newConversation')}
                </button>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {starters.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s.text)}
                      className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl text-left text-xs text-slate-600 hover:text-slate-800 transition"
                    >
                      <span className="text-lg shrink-0">{s.emoji}</span>
                      <span className="leading-snug">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loadingMsgs && (
              <div className="flex justify-center py-10">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loadingMsgs && messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {isThinking && (
              <div className="flex items-start gap-3 mb-4">
                <Avatar />
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3">
                  <TypingDots />
                </div>
              </div>
            )}


          </div>



          <div className="shrink-0 p-3 border-t border-slate-100 bg-white">
            <div className={`flex items-end gap-2 bg-slate-50 border rounded-xl p-2 transition ${
              isThinking ? 'border-slate-200' : 'border-slate-300 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100'
            }`}>
              <textarea
                ref={textareaRef}
                rows={2}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                maxLength={2000}
                disabled={isThinking}
                placeholder={
                  activeConvId
                    ? t('coach.placeholderActive', { name: childName })
                    : t('coach.placeholderIdle')
                }
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none leading-relaxed disabled:opacity-50 p-1"
              />
              {isThinking ? (
                <button
                  onClick={handleStop}
                  title={t('common.stop') || 'Stop'}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition shrink-0 shadow-sm flex items-center justify-center"
                >
                  <span className="w-3 h-3 bg-white rounded-sm inline-block" />
                </button>
              ) : (
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition shrink-0 shadow-sm"
                >
                  {t('coach.send')}
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 text-center">
              {t('coach.inputHint', { n: input.length })}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

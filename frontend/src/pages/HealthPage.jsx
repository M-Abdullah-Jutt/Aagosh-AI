import React from 'react';
import { BookOpen, ExternalLink, Database, FileText, Baby, ShieldCheck, Layers } from 'lucide-react';

const CDC_SOURCES = [
  {
    id: 'cdc-stacks',
    title: 'CDC Stacks — Digital Publication Repository',
    icon: Database,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-100',
    tag: 'Vector-indexed',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description:
      'A free, open-access digital repository of CDC-authored publications. Contains evidence-informed developmental milestone checklists, surveillance instruments, and programmatic reports that are structured for parsing into the Aaghosh RAG vector database.',
    url: 'https://stacks.cdc.gov',
    highlights: [
      'Peer-reviewed and evidence-based developmental data',
      'Machine-readable structured document formats (PDF, HTML)',
      'Covers cognitive, social, emotional, and physical milestones',
      'Regularly updated with current CDC recommendations',
    ],
  },
  {
    id: 'positive-parenting',
    title: 'Positive Parenting Tips — Age-Band Guidelines',
    icon: Baby,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-100',
    tag: 'Core RAG source',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description:
      'Detailed age-banded parenting guidelines covering Infants (0–1), Toddlers (1–3), Preschoolers (3–5), Middle Childhood (6–8), and older age groups. These guidelines form the primary grounding corpus for the AI Coach\'s responses.',
    url: 'https://www.cdc.gov/child-development/positive-parenting-tips/',
    highlights: [
      'Age-segmented structure (0–1, 1–3, 3–5, 6–8, 9–11 years)',
      'Covers emotional regulation, social skills, communication, and cognition',
      'Actionable, parent-friendly guidance — ideal for RAG chunking',
      'Directly cited in AI Coach responses via source references',
    ],
  },
  {
    id: 'learn-the-signs',
    title: '"Learn the Signs. Act Early." Program',
    icon: ShieldCheck,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50 border-violet-100',
    tag: 'Milestone tracking',
    tagColor: 'bg-violet-50 text-violet-700 border-violet-200',
    description:
      'A CDC public health program that provides normative developmental data and evidence-informed, actionable advice for tracking child development and identifying potential delays. Covers key milestones at 2, 4, 6, 9, 12, 15, 18, 24, and 30 months and 2–5 years.',
    url: 'https://www.cdc.gov/ncbddd/actearly/index.html',
    highlights: [
      'Normative milestone data per age checkpoint',
      'Specific "what to expect" vs "when to seek help" guidance',
      'Supports early identification of developmental concerns',
      'Structured for trigger-based RAG retrieval (by age + domain)',
    ],
  },
];

const HOW_RAG_WORKS = [
  {
    step: '01',
    title: 'Chunking',
    desc: 'CDC source documents are split into semantically meaningful chunks (paragraphs or milestone entries) of ~300–500 tokens each.',
    color: 'bg-slate-800 text-white',
  },
  {
    step: '02',
    title: 'Embedding',
    desc: 'Each chunk is converted to a dense vector embedding and stored in the vector database with metadata (source, age-band, category, page).',
    color: 'bg-emerald-700 text-white',
  },
  {
    step: '03',
    title: 'Retrieval',
    desc: 'When a parent asks a question, the top-k most semantically similar chunks are retrieved from the vector store.',
    color: 'bg-indigo-700 text-white',
  },
  {
    step: '04',
    title: 'Grounded Generation',
    desc: 'The AI Coach synthesises a response using only the retrieved chunks as its knowledge source — preventing hallucination.',
    color: 'bg-teal-700 text-white',
  },
];

export const HealthPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">

      {/* Page header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-3">
          <Layers className="w-3.5 h-3.5" />
          Knowledge Base
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          RAG Knowledge Sources
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
          Aaghosh AI's coaching responses are grounded exclusively in the following authoritative sources.
          The AI never fabricates guidance — every recommendation is retrieved directly from these indexed documents.
        </p>
      </div>

      {/* Publisher banner */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 shadow-md">
        <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold">
            Centers for Disease Control and Prevention (CDC)
          </h2>
          <p className="text-blue-100 text-sm mt-0.5 leading-relaxed">
            The CDC is the primary publisher of the knowledge base currently indexed in Aaghosh AI.
            It offers extensive, structured data on child development that is highly suitable for
            parsing into a vector database and used in Retrieval-Augmented Generation (RAG).
          </p>
        </div>
        <a
          href="https://www.cdc.gov"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-100 hover:text-white border border-white/25 hover:border-white/50 px-3 py-2 rounded-lg transition"
        >
          cdc.gov <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Source cards */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          Indexed Sources
          <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 ml-1">
            {CDC_SOURCES.length} active
          </span>
        </h2>
        <div className="space-y-4">
          {CDC_SOURCES.map((source) => {
            const Icon = source.icon;
            return (
              <div
                key={source.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${source.iconBg}`}>
                    <Icon className={`w-5 h-5 ${source.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-slate-900 text-base">{source.title}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full ${source.tagColor}`}>
                        {source.tag}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{source.description}</p>

                    {/* Highlights */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
                      {source.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                          {h}
                        </li>
                      ))}
                    </ul>

                    {/* Link */}
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                      Visit source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How RAG works */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500" />
          How RAG Works in Aaghosh AI
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HOW_RAG_WORKS.map((item) => (
            <div key={item.step} className={`rounded-2xl p-4 space-y-2 ${item.color}`}>
              <span className="text-2xl font-black opacity-40">{item.step}</span>
              <p className="font-bold text-sm">{item.title}</p>
              <p className="text-xs opacity-80 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 leading-relaxed">
          <strong className="font-bold">Important:</strong> Aaghosh AI uses these sources to provide
          evidence-informed <em>parenting support guidance only</em>. It is <strong>not a medical diagnostic
          tool</strong> and cannot replace a licensed psychologist, paediatrician, or healthcare professional.
          All AI responses cite the specific knowledge source they are grounded in.
        </div>
      </div>

    </div>
  );
};

export default HealthPage;

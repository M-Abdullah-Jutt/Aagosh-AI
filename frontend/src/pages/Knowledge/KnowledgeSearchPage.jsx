import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import knowledgeService from '../../services/knowledgeService';

export default function KnowledgeSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [age, setAge] = useState('');
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError('');
      setSearched(true);
      const data = await knowledgeService.searchKnowledge({
        query,
        age: age !== '' ? age : null,
        top_k: topK
      });
      setResults(data);
    } catch (err) {
      console.error("Knowledge search error:", err);
      setError("Failed to retrieve knowledge protocols. Make sure backend is running and authenticated.");
    } finally {
      setLoading(false);
    }
  };

  const presetQueries = [
    { label: "Baby Crying", text: "My baby won't stop crying.", age: 0 },
    { label: "Toddler Tantrum", text: "My toddler has a tantrum when it is time to leave the park.", age: 2 },
    { label: "Sibling Hitting", text: "My child hits their sibling or snatches a toy.", age: 4 },
    { label: "Homework Refusal", text: "My child refuses to do homework.", age: 9 },
    { label: "Teen Curfew", text: "My teenager missed curfew.", age: 16 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Developer Banner */}
        <div className="bg-amber-500 text-amber-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-between mb-6 shadow-sm">
          <span>DEVELOPER & AUDIT TEST PAGE — RAG Knowledge Base Retrieval</span>
          <span className="bg-amber-600 text-white px-2 py-0.5 rounded text-[10px] uppercase">Step 7 Test Mode</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Parenting Knowledge Base Retrieval</h1>
          <p className="text-xs text-slate-500 mt-1">
            Source-grounded semantic search across CDC Positive Parenting Protocols in <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">Parentingpdf.pdf</code>.
            Zero LLM response generation.
          </p>

          {/* Quick Preset Queries */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-2">Preset Scenario Queries:</span>
            <div className="flex flex-wrap gap-2">
              {presetQueries.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(preset.text);
                    setAge(preset.age);
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-medium transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Situation / Situation Query</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. My child refuses to do homework..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Optional Child Age Filter (Years)</label>
              <input
                type="number"
                min="0"
                max="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 2"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Top-K Results</label>
              <select
                value={topK}
                onChange={(e) => setTopK(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">Top 1</option>
                <option value="3">Top 3</option>
                <option value="5">Top 5</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Retrieving Grounded Knowledge...</span>
              </>
            ) : (
              <span>Search Knowledge Protocols</span>
            )}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs mb-6">
            {error}
          </div>
        )}

        {/* Search Results */}
        {searched && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800">
              Retrieved Grounded Protocols ({results.length})
            </h2>

            {results.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-sm">
                No matching protocols found for the query/filters.
              </div>
            ) : (
              results.map((res, idx) => (
                <div key={res.chunk_id || idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full border border-indigo-200">
                        Result #{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        Similarity Score: <span className="text-emerald-600 font-bold">{(res.score * 100).toFixed(1)}%</span>
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      Source: <span className="font-semibold text-slate-700">{res.source}</span> (Page {res.page})
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Category & Applicable Ages ({res.age_min}–{res.age_max} Years)
                    </span>
                    <p className="text-sm font-bold text-slate-900">{res.category}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {res.tags?.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                      Child Action / Situation
                    </span>
                    <p className="text-xs text-slate-800 font-medium">{res.situation}</p>
                  </div>

                  <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                      Approved Parent Response Protocol
                    </span>
                    <pre className="text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                      {res.parent_response}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

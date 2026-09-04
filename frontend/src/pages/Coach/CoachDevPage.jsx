import React, { useState, useEffect } from 'react';
import childrenService from '../../services/childrenService';
import coachService from '../../services/coachService';

export default function CoachDevPage() {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [message, setMessage] = useState('My toddler throws a tantrum when it is time to leave the park.');
  const [period, setPeriod] = useState('30d');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const data = await childrenService.getChildren();
      setChildren(data || []);
      if (data && data.length > 0) {
        setSelectedChildId(data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load children:', err);
      setError('Failed to load children list.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChildId) {
      setError('Please select a child.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await coachService.askCoach(selectedChildId, message.trim(), period);
      setResponse(res);
    } catch (err) {
      console.error('Coach query failed:', err);
      const errMsg = err.response?.data?.detail || 'Failed to generate coaching response.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Dev Header Badge */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-center justify-between">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500 text-black uppercase tracking-wider mb-1">
            Development / Testing
          </span>
          <h1 className="text-xl font-bold text-slate-100">Step 8B: Grounded LLM Response Generation</h1>
          <p className="text-sm text-slate-400">Minimal test interface for validating grounded parenting coaching responses.</p>
        </div>
      </div>

      {/* Query Form */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Select Child</label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {children.length === 0 ? (
                  <option value="">No children found</option>
                ) : (
                  children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} ({c.age_years || 0}y {c.age_months || 0}m)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Analytics Window Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="7d">7 Days</option>
                <option value="14d">14 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Parent Question / Message</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter question about your child's behavior..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !selectedChildId}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition shadow-lg shadow-indigo-600/20"
            >
              {loading ? 'Generating Grounded Response...' : 'Submit to Coach'}
            </button>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Structured Output Display */}
      {response && (
        <div className="space-y-6">
          {/* Main Answer Box */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h2 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
                <span>💡 Grounded AI Guidance</span>
              </h2>
              <div className="text-xs text-slate-400 space-x-3">
                <span>Provider: <strong className="text-slate-200">{response.metadata?.provider}</strong></span>
                <span>Model: <strong className="text-slate-200">{response.metadata?.model}</strong></span>
                <span>Retrieved Chunks: <strong className="text-emerald-400">{response.metadata?.retrieval_count}</strong></span>
              </div>
            </div>

            <p className="text-slate-200 text-base leading-relaxed whitespace-pre-line">{response.answer}</p>

            {/* Key Points */}
            {response.key_points && response.key_points.length > 0 && (
              <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800 space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Points</h3>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                  {response.key_points.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Steps */}
            {response.suggested_steps && response.suggested_steps.length > 0 && (
              <div className="bg-indigo-950/30 rounded-lg p-4 border border-indigo-900/40 space-y-2">
                <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Suggested Action Protocol</h3>
                <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
                  {response.suggested_steps.map((st, idx) => (
                    <li key={idx}>{st}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Sources and Context Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source References */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-300">Retrieved Source References</h3>
              {response.source_references && response.source_references.length > 0 ? (
                <div className="space-y-2">
                  {response.source_references.map((ref, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs flex justify-between items-center">
                      <div>
                        <div className="font-medium text-indigo-300">{ref.source}</div>
                        <div className="text-slate-400">{ref.category || 'General'}</div>
                      </div>
                      <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs">
                        Page {ref.page || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No specific sources cited.</p>
              )}
            </div>

            {/* Context Used */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-300">Context Used</h3>
              <div className="space-y-1.5 text-xs text-slate-400">
                <div><strong className="text-slate-300">Child Age:</strong> {response.context_used?.child_age || 'N/A'}</div>
                <div><strong className="text-slate-300">Active Goals:</strong> {response.context_used?.goal || 'None'}</div>
                <div><strong className="text-slate-300">Observations:</strong> {response.context_used?.relevant_observations || 'None'}</div>
              </div>
            </div>
          </div>

          {/* Clinical Disclaimer */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-center text-xs text-slate-400">
            <strong>Disclaimer:</strong> {response.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}

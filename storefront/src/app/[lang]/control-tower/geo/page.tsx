'use client';

import { useState, useEffect } from 'react';

export default function GeoAdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'monitoring'>('dashboard');
  const [optimizing, setOptimizing] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [enqueuing, setEnqueuing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<any>(null);
  const [monitorResult, setMonitorResult] = useState<any>(null);
  const [enqueueResult, setEnqueueResult] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/geo/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const refreshStats = () => {
    fetch('/api/geo/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(console.error);
  };

  const runOptimize = async () => {
    setOptimizing(true);
    setOptimizeResult(null);
    try {
      const res = await fetch('/api/geo/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: 5 }),
      });
      const data = await res.json();
      setOptimizeResult(data);
      refreshStats();
    } catch (e: any) {
      setOptimizeResult({ success: false, error: e.message });
    }
    setOptimizing(false);
  };

  const runEnqueue = async () => {
    setEnqueuing(true);
    setEnqueueResult(null);
    try {
      const res = await fetch('/api/geo/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ types: ['product', 'supplier', 'category'], limit: 500 }),
      });
      const data = await res.json();
      setEnqueueResult(data);
      refreshStats();
    } catch (e: any) {
      setEnqueueResult({ success: false, error: e.message });
    }
    setEnqueuing(false);
  };

  const runMonitoring = async () => {
    setMonitoring(true);
    setMonitorResult(null);
    try {
      const res = await fetch('/api/geo/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 20 }),
      });
      const data = await res.json();
      setMonitorResult(data);
    } catch (e: any) {
      setMonitorResult({ success: false, error: e.message });
    }
    setMonitoring(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">GEO - Generative Engine Optimization</h1>
          <p className="text-gray-600 mt-1">
            Optimize content for AI search engines (ChatGPT, Perplexity, Claude, Gemini)
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border mb-6">
          <div className="flex border-b">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'content', label: 'Content Optimization' },
              { id: 'monitoring', label: 'AI Mention Monitoring' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl">
                    <p className="text-blue-600 text-sm font-medium">AI Mention Rate</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">
                      {stats?.overview?.mention_rate || 0}%
                    </p>
                    <p className="text-blue-700 text-xs mt-1">
                      {stats?.overview?.total_mentions || 0} mentions in {stats?.overview?.total_checks || 0} checks
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl">
                    <p className="text-green-600 text-sm font-medium">Content Optimized</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">
                      {stats?.overview?.total_checks || 0}
                    </p>
                    <p className="text-green-700 text-xs mt-1">Pages optimized for GEO</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl">
                    <p className="text-purple-600 text-sm font-medium">Avg Score Improvement</p>
                    <p className="text-3xl font-bold text-purple-900 mt-1">+23</p>
                    <p className="text-purple-700 text-xs mt-1">GEO score points gained</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl">
                    <p className="text-orange-600 text-sm font-medium">Monitoring Queries</p>
                    <p className="text-3xl font-bold text-orange-900 mt-1">20</p>
                    <p className="text-orange-700 text-xs mt-1">Tracked B2B questions</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={runOptimize}
                      disabled={optimizing}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {optimizing ? (
                        <>
                          <span className="animate-spin">⚙️</span> Optimizing...
                        </>
                      ) : (
                        <>⚡ Run Content Optimization (batch of 5)</>
                      )}
                    </button>
                    <button
                      onClick={runMonitoring}
                      disabled={monitoring}
                      className="bg-purple-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {monitoring ? (
                        <>
                          <span className="animate-spin">🔍</span> Checking AI mentions...
                        </>
                      ) : (
                        <>🔍 Run AI Mention Check (20 queries)</>
                      )}
                    </button>
                  </div>

                  {optimizeResult && (
                    <div className={`mt-4 p-4 rounded-lg ${optimizeResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {optimizeResult.success ? (
                        <p>✅ Processed {optimizeResult.processed} items: {optimizeResult.success} succeeded, {optimizeResult.failed} failed</p>
                      ) : (
                        <p>❌ Error: {optimizeResult.error}</p>
                      )}
                    </div>
                  )}

                  {monitorResult && (
                    <div className={`mt-4 p-4 rounded-lg ${monitorResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {monitorResult.success ? (
                        <p>✅ Checked {monitorResult.total} queries: mentioned in {monitorResult.mentioned} ({Math.round(monitorResult.mentionRate * 100)}%)</p>
                      ) : (
                        <p>❌ Error: {monitorResult.error}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Competitor Mention Stats */}
                {stats?.competitors?.length > 0 && (
                  <div className="border rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Competitor Mentions in AI (last 30 days)</h3>
                    <div className="space-y-3">
                      {stats.competitors.map((c: any) => (
                        <div key={c.competitor} className="flex items-center gap-4">
                          <span className="w-32 text-sm font-medium text-gray-700">{c.competitor}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-gray-400 h-full rounded-full"
                              style={{ width: `${Math.min(100, c.mention_count * 5)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{c.mention_count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h3 className="font-bold text-blue-900 mb-2">Content Optimization Strategy</h3>
                  <p className="text-blue-800 text-sm mb-4">
                    Content is optimized using 5 strategies to maximize AI search visibility:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {[
                      { name: 'Structure', desc: 'Clear headings, lists, scannable format' },
                      { name: 'Schema-Friendly', desc: 'Explicit specs with numbers and units' },
                      { name: 'Answer First', desc: 'Lead with key info buyers want' },
                      { name: 'Authority', desc: 'Certifications, use cases, trust signals' },
                      { name: 'FAQ', desc: '5-6 common B2B buyer Q&A' },
                    ].map(s => (
                      <div key={s.name} className="bg-white p-3 rounded-lg">
                        <p className="font-semibold text-blue-900 text-sm">{s.name}</p>
                        <p className="text-xs text-blue-700 mt-1">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-2">Step 1: Enqueue Content for Optimization</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Scan all products, suppliers, and categories and add them to the optimization queue.
                    This is idempotent - already enqueued items won't be duplicated.
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={runEnqueue}
                      disabled={enqueuing}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {enqueuing ? 'Enqueuing...' : 'Enqueue All Content (products/suppliers/categories)'}
                    </button>
                    {stats?.contentStats && (
                      <span className="text-sm text-gray-600">
                        Queue: <span className="font-semibold">{stats.contentStats.pending || 0}</span> pending,
                        <span className="font-semibold"> {stats.contentStats.optimized || 0}</span> optimized
                      </span>
                    )}
                  </div>
                  {enqueueResult && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${enqueueResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {enqueueResult.success
                        ? `✅ ${enqueueResult.message} (scanned: ${JSON.stringify(enqueueResult.scanned)})`
                        : `❌ Error: ${enqueueResult.error}`}
                    </div>
                  )}
                </div>

                <div className="border rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Step 2: Run Optimization Batch</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Process 5 pending items from the queue using DeepSeek API. Each batch takes ~30 seconds.
                    Requires <code className="bg-gray-100 px-1 rounded">DEEPSEEK_API_KEY</code> in .env.local
                  </p>
                  <button
                    onClick={runOptimize}
                    disabled={optimizing}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {optimizing ? 'Optimizing...' : 'Process 5 Items from Queue'}
                  </button>
                  {optimizeResult && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${optimizeResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {optimizeResult.success
                        ? `✅ Processed ${optimizeResult.processed}: ${optimizeResult.success} succeeded, ${optimizeResult.failed} failed`
                        : `❌ Error: ${optimizeResult.error}`}
                    </div>
                  )}
                </div>

                <div className="border rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4">GEO Scoring Heuristic</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="font-medium">+15 pts</span> Clear heading structure
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="font-medium">+15 pts</span> Numbers with units
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="font-medium">+15 pts</span> Certifications mentioned
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="font-medium">+15 pts</span> FAQ section
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="font-medium">+15 pts</span> B2B keywords (MOQ, OEM)
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="font-medium">+15 pts</span> Use cases mentioned
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="font-medium">+10 pts</span> Bullet lists
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="font-medium">+15 pts</span> Optimal length (300-3000)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                  <h3 className="font-bold text-purple-900 mb-2">AI Mention Monitoring</h3>
                  <p className="text-purple-800 text-sm">
                    We track 20 core B2B buyer questions across Perplexity AI to measure how often
                    Aegisky is cited as a trusted source vs competitors.
                  </p>
                </div>

                <div className="border rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Run Monitoring Check</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Query Perplexity for all 20 tracked questions and record mention positions.
                    Takes ~1 minute. Requires PERPLEXITY_API_KEY in .env.local
                  </p>
                  <button
                    onClick={runMonitoring}
                    disabled={monitoring}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                  >
                    {monitoring ? 'Checking mentions...' : 'Run Full Mention Check'}
                  </button>
                </div>

                <div className="border rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Tracked Query Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { name: 'Sourcing', queries: 4, desc: '"Where to buy industrial drones" type questions' },
                      { name: 'Comparison', queries: 4, desc: '"Best drone for X use case" comparisons' },
                      { name: 'Specifications', queries: 3, desc: 'Technical parameter questions' },
                      { name: 'Use Cases', queries: 3, desc: 'Industry application questions' },
                      { name: 'Compliance', queries: 3, desc: 'Export control and certification' },
                      { name: 'Solutions', queries: 3, desc: 'Complete solution recommendations' },
                    ].map(cat => (
                      <div key={cat.name} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-gray-900">{cat.name}</p>
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                            {cat.queries} queries
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{cat.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

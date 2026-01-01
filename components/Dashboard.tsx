import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  ExternalLink, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign,
  Info,
  Gavel,
  ThumbsDown,
  Lightbulb,
  Signal,
  Link
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { AnalysisResult, Status } from '../types';

interface DashboardProps {
  data: AnalysisResult;
}

const statusColors = {
  Trusted: 'text-[#00D26A] bg-emerald-50 border-emerald-200',
  Mixed: 'text-[#FBBF24] bg-amber-50 border-amber-200',
  Suspicious: 'text-rose-600 bg-rose-50 border-rose-200',
};

const statusIcon = {
  Trusted: <ShieldCheck className="w-8 h-8 text-[#00D26A]" />,
  Mixed: <AlertTriangle className="w-8 h-8 text-[#FBBF24]" />,
  Suspicious: <ShieldAlert className="w-8 h-8 text-rose-600" />,
};

const METRIC_TOOLTIPS: Record<string, string> = {
  "External Sentiment Mismatch": "Checks if official ratings match real social media sentiment.",
  "Sponsored/Affiliate Language Frequency": "Detects if discussions are dominated by paid or affiliate content.",
  "Review Timing Anomalies": "Identifies suspicious spikes in positive reviews over short periods.",
  "External Complaints": "Counts negative reports found outside the official store page.",
  "Reviewer Diversity": "Ensures reviews come from varied users, not bots or duplicates."
};

const MetricIcon = ({ name }: { name: string }) => {
    if (name.includes('Sentiment')) return <TrendingUp className="w-4 h-4" />;
    if (name.includes('Sponsored')) return <DollarSign className="w-4 h-4" />;
    if (name.includes('Timing')) return <Clock className="w-4 h-4" />;
    if (name.includes('Diversity')) return <Users className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
};

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const chartData = [
    { name: 'Score', value: data.trust_score },
    { name: 'Remaining', value: 100 - data.trust_score },
  ];

  const chartColor = 
    data.trust_score >= 70 ? '#00D26A' : 
    data.trust_score >= 40 ? '#FBBF24' : 
    '#e11d48';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-grow">
          <div className="flex items-center space-x-3 mb-2">
             <h2 className="text-2xl font-bold text-slate-900">{data.product_name}</h2>
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[data.status]}`}>
               {data.status}
             </span>
          </div>
          <p className="text-slate-500 text-sm flex items-center gap-2">
             {data.brand_name && <span className="font-semibold">{data.brand_name}</span>}
             {data.brand_name && <span>•</span>}
             <a href={data.product_url} target="_blank" rel="noreferrer" className="text-[#00D26A] hover:underline flex items-center gap-1">
                View Product <ExternalLink className="w-3 h-3" />
             </a>
          </p>
          <p className="mt-2 text-slate-600 max-w-xl">{data.badge_text}</p>
          
          {/* AI Verdict */}
          {data.verdict && (
            <div className={`mt-4 p-4 rounded-xl border-l-4 ${
                data.status === 'Trusted' ? 'bg-emerald-50 border-emerald-500' :
                data.status === 'Mixed' ? 'bg-amber-50 border-amber-500' :
                'bg-rose-50 border-rose-500'
            }`}>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2 mb-1">
                    <Gavel className="w-4 h-4" />
                    Verdict
                </h3>
                <p className="text-slate-800 font-medium text-lg leading-snug">
                    {data.verdict.replace(/^Verdict:\s*/i, '')}
                </p>
            </div>
          )}
        </div>
        
        {/* Trust Score Gauge */}
        <div className="flex items-center gap-6 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex-shrink-0">
           <div className="relative w-24 h-24 flex-shrink-0">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={chartData}
                   cx="50%"
                   cy="50%"
                   innerRadius={32}
                   outerRadius={42}
                   startAngle={90}
                   endAngle={-270}
                   dataKey="value"
                   stroke="none"
                 >
                   <Cell key="score" fill={chartColor} />
                   <Cell key="bg" fill="#e2e8f0" />
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center flex-col">
               <span className="text-2xl font-bold text-slate-800">{data.trust_score}</span>
             </div>
           </div>
           <div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Trust Score</div>
              <div className="flex items-center gap-2">
                {statusIcon[data.status]}
                <span className={`font-bold text-lg ${
                    data.status === 'Trusted' ? 'text-[#00D26A]' : 
                    data.status === 'Mixed' ? 'text-[#FBBF24]' : 'text-rose-700'
                }`}>
                    {data.status_text}
                </span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Breakdown & Flags */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Trust Breakdown */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00D26A]" />
                Score Breakdown (Penalties)
            </h3>
            <div className="space-y-4">
                {data.breakdown.map((item, idx) => (
                    <div key={idx} className="group">
                        <div className="flex justify-between text-sm mb-1">
                            <div className="relative group/tooltip flex items-center gap-2 text-slate-600 font-medium cursor-help">
                                <MetricIcon name={item.metric} />
                                <span>{item.metric.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <Info className="w-3.5 h-3.5 text-slate-400 opacity-50 group-hover/tooltip:opacity-100 transition-opacity" />
                                
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all w-56 z-50 shadow-xl pointer-events-none leading-relaxed">
                                    {METRIC_TOOLTIPS[item.metric] || "Factor influencing the overall Trust Score."}
                                    <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-800"></div>
                                </div>
                            </div>
                            <span className={`font-mono font-bold ${item.penalty > 0.3 ? 'text-rose-500' : 'text-[#00D26A]'}`}>
                                {Math.round(item.penalty * 100)}% penalty
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className={`h-2.5 rounded-full transition-all duration-1000 ${
                                    item.penalty > 0.5 ? 'bg-rose-500' : 
                                    item.penalty > 0.2 ? 'bg-[#FBBF24]' : 'bg-[#00D26A]'
                                }`}
                                style={{ width: `${Math.max(item.penalty * 100, 5)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 pl-6">
                            Weight: {item.weight_pct}% of total score
                        </p>
                    </div>
                ))}
            </div>
          </div>

          {/* Red Flags */}
          {data.red_flags.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                 <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    Detected Red Flags
                </h3>
                <div className="grid gap-3">
                    {data.red_flags.map((flag, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${
                            flag.severity === 'high' ? 'bg-rose-50 border-rose-100' :
                            flag.severity === 'medium' ? 'bg-amber-50 border-amber-100' :
                            'bg-slate-50 border-slate-100'
                        }`}>
                             <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                 flag.severity === 'high' ? 'bg-rose-500' : 
                                 flag.severity === 'medium' ? 'bg-[#FBBF24]' : 'bg-slate-400'
                             }`} />
                             <div className="flex-1">
                                 <h4 className={`text-sm font-bold ${
                                     flag.severity === 'high' ? 'text-rose-800' : 
                                     flag.severity === 'medium' ? 'text-amber-800' : 'text-slate-800'
                                 }`}>{flag.flag}</h4>
                                 <p className="text-sm text-slate-600 mt-1">{flag.detail}</p>
                                 {flag.explanation && (
                                     <p className="text-xs text-slate-500 mt-2 bg-white/50 p-2 rounded border border-slate-200/50">
                                         <span className="font-semibold text-slate-600">Why this matters:</span> {flag.explanation}
                                     </p>
                                 )}
                             </div>
                             <span className="ml-auto text-xs uppercase font-bold tracking-wider text-slate-400">
                                 {flag.severity}
                             </span>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>

        {/* Right Column: Quotes & Info */}
        <div className="space-y-6">
            
            {/* Quick Summary (Score Explanation) - Keep it for context if needed, or remove if redundant */}
            {data.score_explanation && (
              <div className="bg-[#1E1E1E] text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D26A] opacity-10 blur-2xl rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
                  <h3 className="font-bold text-[#00D26A] mb-4 uppercase tracking-wider text-xs relative z-10">Analysis Summary</h3>
                  <div className="text-sm text-slate-200 whitespace-pre-line leading-relaxed relative z-10">
                      {data.score_explanation}
                  </div>
              </div>
            )}

            {/* Top Quotes / Voice of Customer */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#00D26A]" />
                    Voice of Customer
                </h3>

                {/* Structured Insights */}
                <div className="space-y-3 mb-6">
                  {data.dominant_complaint && (
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <ThumbsDown className="w-4 h-4 text-rose-600" />
                        <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wide">Most Mentioned Issue</h4>
                      </div>
                      <p className="text-sm text-slate-700 font-medium">{data.dominant_complaint}</p>
                    </div>
                  )}

                  {data.key_insight && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide">Most Trusted Insight</h4>
                      </div>
                      <p className="text-sm text-slate-700 font-medium">{data.key_insight}</p>
                    </div>
                  )}
                </div>
                
                {/* Labeled Quotes */}
                <div className="space-y-4">
                    {data.quote_snippets.map((quote, idx) => (
                        <div key={idx} className="relative pl-4 border-l-2 border-slate-200">
                            {quote.sentiment && (
                                <span className={`absolute -left-[11px] -top-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                                    quote.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    quote.sentiment === 'negative' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {quote.sentiment}
                                </span>
                            )}
                            <p className="text-sm text-slate-600 italic mt-3">"{quote.text}"</p>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase">{quote.source}</span>
                            </div>
                        </div>
                    ))}
                    {data.quote_snippets.length === 0 && (
                        <div className="text-center py-4 text-slate-400 text-sm">
                            No direct quotes available.
                        </div>
                    )}
                </div>
            </div>

            {/* External Signals Status */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Signal Source</h3>
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                    data.external_data_status === 'ok' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
                }`}>
                    {data.external_data_status === 'ok' ? (
                        <div className="w-2 h-2 rounded-full bg-[#00D26A] animate-pulse" />
                    ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                    )}
                    <span className="text-sm font-medium text-slate-700">
                        {data.external_data_status === 'ok' ? 'Live Community Data' : 'Simulated / Historic Data'}
                    </span>
                </div>
                {data.items.length > 0 ? (
                    <div className="mt-4 flex gap-2">
                        {['reddit', 'x', 'youtube'].map(source => {
                             const count = data.items.filter(i => i.source === source).length;
                             if (count === 0) return null;
                             return (
                                 <span key={source} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 capitalize">
                                     {source} ({count})
                                 </span>
                             )
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 mt-2 italic">
                        No individual live posts could be fetched for display, but analysis was performed based on aggregated knowledge.
                    </p>
                )}
                
                {data.grounding_urls && data.grounding_urls.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Link className="w-4 h-4 text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Grounding Sources</h4>
                      </div>
                      <div className="space-y-1">
                        {data.grounding_urls.slice(0, 3).map((url, idx) => (
                           <a key={idx} href={url} target="_blank" rel="noreferrer" className="block text-xs text-[#00D26A] truncate hover:underline">
                              {url}
                           </a>
                        ))}
                      </div>
                   </div>
                )}
                
                {data.confidence_level && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Signal className="w-4 h-4 text-slate-400" />
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Confidence Level</h4>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border ${
                        data.confidence_level === 'High Confidence' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        data.confidence_level === 'Medium Confidence' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {data.confidence_level}
                      </span>
                    </div>
                    {data.confidence_explanation && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {data.confidence_explanation}
                      </p>
                    )}
                  </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
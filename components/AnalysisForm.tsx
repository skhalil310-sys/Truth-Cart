import React, { useState } from 'react';
import { Search, Loader2, Sparkles, Zap, BrainCircuit } from 'lucide-react';
import { ProductInput, AnalysisMode } from '../types';

interface AnalysisFormProps {
  onAnalyze: (input: ProductInput) => void;
  isLoading: boolean;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onAnalyze, isLoading }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<AnalysisMode>('fast');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url) {
      onAnalyze({ name, brand, url, mode });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
      <div className="bg-[#1E1E1E] p-8 text-white text-center relative overflow-hidden">
        {/* Decorative background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D26A] opacity-10 blur-3xl rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="flex justify-center mb-4 relative z-10">
          <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm border border-white/10">
            <Sparkles className="w-8 h-8 text-[#FBBF24]" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight relative z-10">TruthCart AI</h1>
        <p className="text-slate-200 text-lg font-medium relative z-10">Separate paid hype from real user experiences.</p>
        <p className="text-slate-400 text-sm mt-3 relative z-10 font-medium">
            Analyzing live discussions from Reddit, X, and YouTube to uncover the truth.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="productName" className="text-sm font-semibold text-slate-700">
              Product Name <span className="text-[#00D26A]">*</span>
            </label>
            <input
              id="productName"
              type="text"
              required
              placeholder="e.g. SonicTooth Pro 5000"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00D26A] focus:border-[#00D26A] outline-none transition-all bg-slate-50 focus:bg-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="brandName" className="text-sm font-semibold text-slate-700">
              Brand (Optional)
            </label>
            <input
              id="brandName"
              type="text"
              placeholder="e.g. OralTech"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00D26A] focus:border-[#00D26A] outline-none transition-all bg-slate-50 focus:bg-white"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="productUrl" className="text-sm font-semibold text-slate-700">
            Product URL <span className="text-[#00D26A]">*</span>
          </label>
          <div className="relative">
            <input
              id="productUrl"
              type="url"
              required
              placeholder="https://amazon.com/..."
              className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00D26A] focus:border-[#00D26A] outline-none transition-all bg-slate-50 focus:bg-white"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Analysis Mode
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMode('fast')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                mode === 'fast' 
                  ? 'border-[#00D26A] bg-emerald-50/50 text-[#00D26A] ring-1 ring-[#00D26A]' 
                  : 'border-slate-200 hover:border-[#00D26A]/50 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Zap className={`w-6 h-6 ${mode === 'fast' ? 'fill-[#00D26A] text-[#00D26A]' : 'text-slate-400'}`} />
              <div className="text-center">
                <span className="block font-semibold text-sm">Fast Scan</span>
                <span className="block text-xs opacity-75 mt-0.5">Instant red flag detector</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode('deep')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                mode === 'deep' 
                  ? 'border-[#00D26A] bg-emerald-50/50 text-[#00D26A] ring-1 ring-[#00D26A]' 
                  : 'border-slate-200 hover:border-[#00D26A]/50 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BrainCircuit className={`w-6 h-6 ${mode === 'deep' ? 'text-[#00D26A]' : 'text-slate-400'}`} />
               <div className="text-center">
                <span className="block font-semibold text-sm">Deep Research</span>
                <span className="block text-xs opacity-75 mt-0.5">Deep cross-platform analysis</span>
              </div>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !name || !url}
          className={`w-full py-4 rounded-xl font-bold text-lg text-[#1E1E1E] shadow-lg transition-all flex items-center justify-center space-x-2
            ${isLoading || !name || !url 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-[#00D26A] hover:bg-[#00b359] hover:shadow-[#00D26A]/30 hover:-translate-y-0.5'}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Reveal Product Truth</span>
            </>
          )}
        </button>
      </form>
      
      <div className="bg-slate-50 px-8 py-4 text-center text-xs text-slate-500 border-t border-slate-100 flex items-center justify-center gap-2">
        <span>Powered by Gemini 2.5 Flash Lite & Gemini 3 Pro</span>
      </div>
    </div>
  );
};

export default AnalysisForm;
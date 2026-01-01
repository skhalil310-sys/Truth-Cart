import React, { useState, useEffect } from 'react';
import AnalysisForm from './components/AnalysisForm';
import Dashboard from './components/Dashboard';
import { Logo } from './components/Logo';
import { analyzeProduct } from './services/geminiService';
import { AnalysisResult, ProductInput } from './types';
import { AlertCircle } from 'lucide-react';

const LOADING_STEPS = [
  "Scanning Reddit & YouTube for user discussions...",
  "Filtering out bot spam and promo content...",
  "Detecting hidden affiliate language...",
  "Analyzing sentiment across communities...",
  "Finalizing your Trust Score..."
];

const App: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async (input: ProductInput) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeProduct(input);
      setResult(data);
    } catch (err) {
      setError("Failed to analyze product. Please verify your API Key and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <Logo className="w-12 h-12" />
             <span className="font-bold text-2xl tracking-tight text-slate-800">TruthCart</span>
           </div>
           <div className="text-sm text-slate-500 hidden sm:block">AI-Powered Product Verification</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        {!result && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
            <AnalysisForm onAnalyze={handleAnalyze} isLoading={loading} />
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl text-center">
               <div className="p-4">
                 <h3 className="font-bold text-slate-800 mb-2">Community Consensus</h3>
                 <p className="text-sm text-slate-600">We scan Reddit, X, and YouTube for real user discussions, ignoring bot spam.</p>
               </div>
               <div className="p-4">
                 <h3 className="font-bold text-slate-800 mb-2">Hidden Affiliate Detection</h3>
                 <p className="text-sm text-slate-600">Our AI identifies sponsored language and biased reviews that skew ratings.</p>
               </div>
               <div className="p-4">
                 <h3 className="font-bold text-slate-800 mb-2">Transparent Scoring</h3>
                 <p className="text-sm text-slate-600">See exactly why a product is trusted or suspicious with our detailed breakdown.</p>
               </div>
            </div>
          </div>
        )}

        {loading && !result && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-fade-in">
             <div className="relative mb-8">
               <div className="w-24 h-24 border-4 border-slate-100 border-t-[#00D26A] rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 bg-[#00D26A]/10 rounded-full flex items-center justify-center animate-pulse">
                    <Logo className="w-8 h-8 opacity-50" />
                 </div>
               </div>
             </div>
             
             <h3 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Product Authenticity</h3>
             
             <div className="h-8 flex items-center justify-center min-w-[300px]">
               <p key={loadingStep} className="text-lg text-[#00D26A] font-medium animate-fade-in-up">
                 {LOADING_STEPS[loadingStep]}
               </p>
             </div>
             
             <p className="text-sm text-slate-400 mt-8">This usually takes about 10-15 seconds.</p>
             <p className="text-xs text-slate-300 mt-2 italic">"Digging deep so you don't have to."</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-8">
            <button 
              onClick={() => setResult(null)}
              className="text-[#00D26A] hover:text-[#00b359] text-sm font-medium flex items-center gap-1 mb-4 transition-colors"
            >
              ← Analyze another product
            </button>
            <Dashboard data={result} />
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full text-center border-t border-slate-100">
        <a href="privacy.html" className="text-slate-400 hover:text-[#00D26A] text-sm transition-colors">Privacy Policy</a>
      </footer>

      {/* Tailwind Animation Utilities */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
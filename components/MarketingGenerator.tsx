import React, { useState } from 'react';
import { ImageIcon, Loader2, Download, RefreshCw } from 'lucide-react';
import { generateMarketingImage } from '../services/geminiService';

const SCENARIOS = [
  {
    id: 'badge',
    title: 'Badge & Panel UI',
    description: 'Floating badge with open widget showing score and flags',
    prompt: 'Chrome browser displaying an Amazon product page. The "TruthCart" floating badge is visible on the right side of the screen. The widget panel is open, showing: - Trust Score: 44 - Status: Mixed - 2–3 quote snippets from Reddit, X, or YouTube (e.g., "Broke in 2 weeks — reddit") - Red flags bullets with emojis (🚩 Sudden 5-star spike, 🚩 Affiliate language detected) Style: clean SaaS panel, semi-transparent shadow, visually clear, realistic Amazon page behind.'
  },
  {
    id: 'modal',
    title: 'Full Analysis Modal',
    description: 'Detailed view with breakdown and explanation',
    prompt: 'TruthCart extension full panel modal open. Displays: - Product name & brand - Trust Score breakdown (numerical + colored bar) - Top 3 quotes (text + source) - Red flags list (with emojis) - Friendly explanation text, e.g., "Trust Score = 44 because of external sentiment mismatch and affiliate-heavy reviews." Style: professional SaaS look, modern fonts, light background, clearly legible text, realistic browser environment.'
  },
  {
    id: 'loading',
    title: 'Loading State',
    description: 'Widget in loading or fallback state',
    prompt: 'TruthCart widget panel open on a product page. Loading spinner visible. Text: "Crunching the truth..." or fallback: "Not enough community discussion to judge this product." Visual style: same as main panel, clean and readable.'
  }
];

const MarketingGenerator: React.FC = () => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (id: string, prompt: string) => {
    setLoadingState(prev => ({ ...prev, [id]: true }));
    setError(null);
    try {
      const imageUrl = await generateMarketingImage(prompt);
      setImages(prev => ({ ...prev, [id]: imageUrl }));
    } catch (err) {
      setError("Failed to generate image. Please try again.");
    } finally {
      setLoadingState(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mt-12">
      <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg backdrop-blur-sm">
                <ImageIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold">Marketing Mockup Generator</h2>
                <p className="text-slate-400 text-sm">Generate promotional assets using Gemini 2.5 Flash Image</p>
            </div>
        </div>
      </div>

      <div className="p-8">
        {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SCENARIOS.map((scenario) => (
            <div key={scenario.id} className="flex flex-col">
              <div className="mb-4">
                <h3 className="font-bold text-slate-800">{scenario.title}</h3>
                <p className="text-sm text-slate-500">{scenario.description}</p>
              </div>
              
              <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 mb-4 group">
                {loadingState[scenario.id] ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-xs">Generating...</span>
                  </div>
                ) : images[scenario.id] ? (
                  <>
                    <img 
                        src={images[scenario.id]} 
                        alt={scenario.title} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    />
                    <a 
                        href={images[scenario.id]} 
                        download={`truthcart-${scenario.id}.png`}
                        className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Download"
                    >
                        <Download className="w-4 h-4" />
                    </a>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-50/50">
                    <ImageIcon className="w-12 h-12 opacity-20" />
                  </div>
                )}
              </div>

              <button
                onClick={() => handleGenerate(scenario.id, scenario.prompt)}
                disabled={loadingState[scenario.id]}
                className="mt-auto w-full py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loadingState[scenario.id] ? (
                    'Processing...'
                ) : (
                    <>
                        <RefreshCw className="w-4 h-4" />
                        {images[scenario.id] ? 'Regenerate' : 'Generate Mockup'}
                    </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketingGenerator;
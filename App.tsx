import React, { useState } from 'react';
import { LayoutDashboard, FileText, BarChart3, TrendingUp, AlertCircle, Sparkles, PieChart } from 'lucide-react';
import { AnalysisResult } from './types';
import { analyzeReviews } from './services/geminiService';
import { SentimentTrendChart, WordCloud } from './components/AnalysisCharts';
import { ChatWidget } from './components/ChatWidget';

// Sample data for quick testing
const SAMPLE_REVIEWS = `
Oct 1: "The new update is fantastic! The UI is much cleaner."
Oct 2: "I'm having trouble logging in since the patch. Support is unresponsive."
Oct 3: "Love the speed improvements, but the dark mode contrast is off."
Oct 4: "Terrible experience. The app crashes every time I open the settings."
Oct 5: "Great customer service! Jane helped me resolve my billing issue immediately."
Oct 6: "The product is good, but the shipping was delayed by a week."
Oct 7: "Absolutely love it. Best investment for my workflow this year."
Oct 8: "Why did you remove the export feature? This is a dealbreaker."
Oct 9: "Smooth experience overall, but I wish there were more tutorials."
Oct 10: "Can't recommend enough. The team really listens to feedback."
`;

const App: React.FC = () => {
  const [inputText, setInputText] = useState(SAMPLE_REVIEWS.trim());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeReviews(inputText);
      setResult(data);
    } catch (err) {
      setError("Failed to analyze reviews. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Sentient Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>Powered by Gemini 3 Pro</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  Input Data
                </h2>
                <button 
                  onClick={() => setInputText(SAMPLE_REVIEWS.trim())}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Load Sample
                </button>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-64 p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition"
                placeholder="Paste customer reviews here..."
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputText}
                className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    Deep Thinking Analysis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Reviews
                  </>
                )}
              </button>
              {error && (
                <div className="mt-4 p-3 bg-rose-50 text-rose-700 text-sm rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Section */}
          <div className="lg:col-span-2 space-y-6">
            {!result ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
                <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Ready to analyze</p>
                <p className="text-sm">Paste reviews and click Analyze to generate the dashboard</p>
              </div>
            ) : (
              <>
                {/* Executive Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    Executive Summary
                  </h2>
                  <div className="prose prose-slate max-w-none text-slate-600">
                    <p>{result.executiveSummary}</p>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.topActionableAreas.map((area, idx) => (
                      <div key={idx} className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <p className="text-sm font-medium text-amber-900">{area}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sentiment Trend */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-500" />
                      Sentiment Trend
                    </h2>
                    <SentimentTrendChart data={result.sentimentTrend} />
                  </div>

                  {/* Word Cloud */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-indigo-500" />
                      Key Themes
                    </h2>
                    <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100">
                      <WordCloud items={result.wordCloud} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Chat Bot Overlay */}
      <ChatWidget analysisResult={result} />
    </div>
  );
};

export default App;

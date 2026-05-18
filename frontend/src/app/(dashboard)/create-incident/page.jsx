"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Save, XCircle, SearchCode, CheckCircle2 } from 'lucide-react';

export default function CreateIncident() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    service: 'payment-gateway',
    priority: 'high',
    environment: 'production',
    tags: ''
  });

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!formData.description) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        summary: "The payment API is failing with a 502 Bad Gateway specifically after the recent deployment, indicating a potential configuration or environment variable mismatch preventing the service from starting correctly.",
        rootCause: "Environment mismatch or missing deployment variables.",
        suggestedFix: "Update deployment variables to match the new schema required by v2.4.1 and restart the service.",
        similarity: 94,
        difficulty: 8.5,
        confidence: 92
      });
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Create New Incident</h1>
          <p className="text-gray-400 text-sm">Report a new issue and leverage AI to find similar past resolutions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl"
        >
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors" 
                placeholder="e.g., Payment API returns 502 after deployment" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Service</label>
                <select 
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors appearance-none"
                >
                  <option value="payment-gateway">Payment Gateway</option>
                  <option value="auth-service">Auth Service</option>
                  <option value="core-db">Core DB</option>
                  <option value="frontend-web">Frontend Web</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Environment</label>
                <select 
                  value={formData.environment}
                  onChange={(e) => setFormData({...formData, environment: e.target.value})}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors appearance-none"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
              <div className="flex gap-4">
                {['Critical', 'High', 'Medium', 'Low'].map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="priority" 
                      value={level.toLowerCase()}
                      checked={formData.priority === level.toLowerCase()}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="text-neon-blue bg-dark-bg border-dark-border focus:ring-neon-blue" 
                    />
                    <span className="text-sm text-gray-300">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description / Logs</label>
              <textarea 
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors font-mono text-sm resize-none" 
                placeholder="Paste error logs or describe the issue in detail..." 
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Tags (Comma separated)</label>
              <input 
                type="text" 
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors" 
                placeholder="deploy, 502, api" 
              />
            </div>

            <div className="pt-4 border-t border-dark-border flex gap-4">
              <button 
                type="button" 
                className="flex-1 bg-dark-bg border border-dark-border text-white font-medium rounded-lg px-4 py-2.5 hover:bg-dark-border/50 transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Cancel
              </button>
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !formData.description}
                className="flex-1 bg-neon-blue/10 border border-neon-blue text-neon-blue font-semibold rounded-lg px-4 py-2.5 hover:bg-neon-blue/20 transition-all flex items-center justify-center gap-2 border-neon disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Analyze with AI
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* AI Analysis Preview Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <AnimatePresence mode="wait">
            {!analysisResult && !isAnalyzing && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 border border-dashed border-dark-border rounded-xl flex flex-col items-center justify-center p-8 text-center bg-dark-card/30"
              >
                <div className="w-16 h-16 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center mb-4">
                  <SearchCode className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Awaiting Analysis</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  Enter incident details and run AI analysis to instantly search past incidents, codebase embeddings, and generate a resolution plan.
                </p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 border border-neon-blue/30 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-dark-card relative overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.1)]"
              >
                <motion.div 
                  className="absolute top-0 left-0 right-0 h-1 bg-neon-blue shadow-[0_0_20px_#00f3ff]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <div className="w-20 h-20 relative mb-6">
                  <div className="absolute inset-0 border-4 border-dark-border rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                  <Sparkles className="w-8 h-8 text-neon-blue absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 text-neon">Analyzing Incident</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Generating embeddings...</p>
                  <p className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Searching FAISS vector database...</p>
                  <p className="flex items-center justify-center gap-2 animate-pulse">
                    <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block"></span> Querying Gemini API for insights...
                  </p>
                </div>
              </motion.div>
            )}

            {analysisResult && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 bg-dark-card border border-neon-purple/50 rounded-xl p-6 shadow-[0_0_30px_rgba(176,38,255,0.1)] flex flex-col"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-border">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5 text-neon-purple" />
                    AI Intelligence Report
                  </h3>
                  <div className="flex gap-3">
                    <div className="text-center">
                      <div className="text-xl font-bold text-emerald-400">{analysisResult.similarity}%</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">Similarity</div>
                    </div>
                    <div className="w-px h-8 bg-dark-border"></div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-amber-400">{analysisResult.difficulty}/10</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">Complexity</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 flex-1 overflow-auto pr-2">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Incident Summary</h4>
                    <p className="text-sm text-gray-200 leading-relaxed bg-dark-bg p-3 rounded-lg border border-dark-border">
                      {analysisResult.summary}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Probable Root Cause</h4>
                    <p className="text-sm text-white leading-relaxed bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      {analysisResult.rootCause}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Suggested Resolution</h4>
                    <p className="text-sm text-white leading-relaxed bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                      {analysisResult.suggestedFix}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-dark-border">
                  <button className="w-full bg-neon-purple/20 text-neon-purple font-semibold rounded-lg px-4 py-3 hover:bg-neon-purple/30 transition-colors border border-neon-purple/50 flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> Save Incident & Escalate
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

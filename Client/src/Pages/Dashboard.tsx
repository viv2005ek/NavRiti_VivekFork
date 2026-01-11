/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, RefreshCw, Zap, Calendar, Target, 
  TrendingUp, PieChart, ShieldCheck,
  Sparkles, Brain, X,
} from "lucide-react";
import AppNavbar from "../components/AppNavbar.tsx";
import Background from "../components/Background.tsx";

const SERVER_BASE = "http://localhost:8005";

// --- Interfaces ---
interface MarketResponse {
  status: string;
  employability_baseline: number;
  analysis_report: string;
  top_careers: any[];
  conclusion?: string;
  metadata: { market_cycle: string };
}

// --- Helper Components ---

const DashboardCard: React.FC<{ title: string; value: string | number; icon: any; color: string }> = ({ title, value, icon: Icon, color }) => {
  const colorMap: Record<string, string> = {
    indigo: "border-indigo-500/20 from-indigo-500/20 to-indigo-900/20 text-indigo-300",
    purple: "border-purple-500/20 from-purple-500/20 to-purple-900/20 text-purple-300",
    emerald: "border-emerald-500/20 from-emerald-500/20 to-emerald-900/20 text-emerald-300",
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`relative backdrop-blur-xl bg-gray-900/40 border rounded-2xl p-6 shadow-xl ${colorMap[color].split(' ')[0]}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br border ${colorMap[color].split(' ').slice(1, 4).join(' ')}`}>
          <Icon className={colorMap[color].split(' ').pop()} />
        </div>
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

const CareerPodiumCard = ({ career, rank, highlight, isLarge, onClick, isActive }: any) => {
  const isEmerald = highlight === 'emerald';
  const isIndigo = highlight === 'indigo';
  
  return (
    <motion.div
      whileHover={{ y: -10 }}
      onClick={onClick}
      className={`cursor-pointer p-6 rounded-3xl border transition-all duration-500 relative ${
        isActive ? 'ring-2 ring-white/50' : ''
      } ${
        isLarge ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/40 shadow-2xl shadow-emerald-500/20 scale-110 z-10' :
        isIndigo ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/40 shadow-xl shadow-indigo-500/20 z-5' :
        'bg-gray-900/40 border-gray-700 hover:border-gray-500'
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-4 font-bold text-xs ${
          isEmerald ? 'bg-emerald-500 text-white' : 
          isIndigo ? 'bg-indigo-500 text-white' : 
          'bg-gray-800 text-gray-400'
        }`}>
          #{rank}
        </div>
        
        <h3 className="text-sm font-bold text-white mb-2 leading-tight h-10 flex items-center justify-center">
          {career.career_name || career.role}
        </h3>
        
        <div className={`text-2xl font-black mb-1 ${
          isEmerald ? 'bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent' :
          isIndigo ? 'bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent' :
          'text-gray-400'
        }`}>
          {((career.market_score || 0) * 100).toFixed(0)}%
        </div>
        
        <div className={`text-[9px] uppercase tracking-widest font-bold ${
          isEmerald ? 'text-emerald-400' : isIndigo ? 'text-indigo-400' : 'text-gray-500'
        }`}>
          Market Match
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Dashboard Component ---

const Dashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const runSynthesis = async () => {
    setLoading(true);
    try {
      const celestialRaw = JSON.parse(localStorage.getItem('celestial') || "{}");
      const parentalRaw = JSON.parse(localStorage.getItem('parentalOutput') || "{}");
      const societalRaw = JSON.parse(localStorage.getItem('societal_result') || "{}");
      const studentRaw = JSON.parse(localStorage.getItem('StudentInput') || "{}");
  
      const stage2 = studentRaw.result?.stage2_result;
      const predictions = stage2?.ai_predictions;
  
      const payload = {
        celestial_recommendations: celestialRaw.output?.detailed_analysis || [],
        parental_scores: parentalRaw.output?.top_5_parent_scores || [],
        societal_insights: societalRaw.result || {},
        student_stage2: {
          top_career_recommendations: stage2?.top_career_recommendations || [],
          employability_score: predictions?.employability_score || 0,
          score_breakdown: predictions?.score_breakdown || {},
          skill_gap_analysis: predictions?.skill_gap_analysis || {}
        }
      };
  
      const res = await fetch(`${SERVER_BASE}/final-market-ranking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      if (!res.ok) throw new Error("Synthesis Failed");
  
      const data = await res.json();
      setMarketData(data);
    } catch (err) {
      console.error("Synthesis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      <AppNavbar showAuthLinks={false} />
      <Background intensity="medium" showConstellations={true} />
  
      <div className="relative max-w-6xl mx-auto px-4 pt-28 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center px-4 py-2 rounded-full backdrop-blur-sm bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-300 mr-2" />
              <span className="text-sm font-medium text-indigo-300">Strategic Career Synthesis</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-2">
              Professional <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-lg">Market Reality Analysis • 2026 Q1</p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runSynthesis}
            disabled={loading}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold flex items-center gap-3 shadow-2xl shadow-indigo-500/20 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Activity />}
            {loading ? "Synthesizing..." : "Analyze Market Reality"}
          </motion.button>
        </div>
  
        {marketData ? (
          <div className="space-y-10">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DashboardCard 
                title="Readiness" 
                value={`${marketData.employability_baseline || 0}%`} 
                icon={Zap} 
                color="indigo" 
              />
              <DashboardCard 
                title="Cycle" 
                value={marketData.metadata?.market_cycle || "2026-Q1"} 
                icon={Calendar} 
                color="purple" 
              />
              <DashboardCard 
                title="Status" 
                value="Strategic" 
                icon={ShieldCheck} 
                color="emerald" 
              />
            </div>

            {/* Main Highlight Card - Replicating the "Doctor" Card UI */}
            {marketData.top_careers && marketData.top_careers.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative backdrop-blur-xl bg-gray-900/60 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-emerald-400" />
                      <span className="text-emerald-400 font-bold tracking-widest text-[10px] uppercase">RECOMMENDED</span>
                    </div>
                    <h2 className="text-5xl font-black text-white">
                      {marketData.top_careers[0].career_name}
                    </h2>
                    <p className="text-emerald-300/80 text-lg mt-2">
                      Here's why {marketData.top_careers[0].career_name} is a strategic powerhouse for 2026:
                    </p>
                  </div>
                  <div className="relative w-32 h-32 flex flex-col items-center justify-center rounded-full border-4 border-emerald-500/30 bg-emerald-500/5">
                    <span className="text-3xl font-black text-emerald-400">
                      {((marketData.top_careers[0].market_score || 0) * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold uppercase">Market Match</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Market Fit Card */}
                  <div className="flex gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-900/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {marketData.top_careers[0].market_explanation}
                    </p>
                  </div>

                  {/* Focus Area Card */}
                  <div className="flex gap-3 p-4 rounded-xl border border-indigo-500/20 bg-indigo-900/10">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <p className="text-gray-300 text-sm leading-relaxed">
                      <span className="text-indigo-300 font-bold">Focus Area:</span> {marketData.top_careers[0].focus_area}
                    </p>
                  </div>

                  {/* Steps Mapped to Grid */}
                  {marketData.top_careers[0].achieving_steps && marketData.top_careers[0].achieving_steps.map((step: string, idx: number) => (
                    <div key={idx} className="flex gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <p className="text-gray-300 text-sm leading-relaxed">
                        <span className="text-indigo-400 font-bold">Phase 0{idx + 1}:</span> {step}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
  
            {/* Expert Analysis Summary Report */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-gray-900/60 border border-indigo-500/30 rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Brain className="text-emerald-400" />
                Market Outlook Analysis
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-line text-lg bg-white/5 p-6 rounded-2xl border border-white/5">
                  {marketData.analysis_report || "The analysis report is being generated..."}
                </p>
                {marketData.conclusion && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <span className="text-indigo-300 font-bold block mb-2 text-xs uppercase tracking-widest">Final Verdict</span>
                    <p className="text-gray-300 italic">{marketData.conclusion}</p>
                  </div>
                )}
              </div>
            </motion.div>
  
            {/* Career Podium Layout */}
            {marketData.top_careers && marketData.top_careers.length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Target className="text-indigo-400 w-8 h-8" />
                  <h2 className="text-2xl font-bold text-white">Top 5 Market Alignments</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end pt-10">
                  <CareerPodiumCard 
                    career={marketData.top_careers[3]} rank={4} 
                    onClick={() => setExpandedIdx(expandedIdx === 3 ? null : 3)}
                    isActive={expandedIdx === 3}
                  />
                  <CareerPodiumCard 
                    career={marketData.top_careers[1]} rank={2} highlight="indigo"
                    onClick={() => setExpandedIdx(expandedIdx === 1 ? null : 1)}
                    isActive={expandedIdx === 1}
                  />
                  <CareerPodiumCard 
                    career={marketData.top_careers[0]} rank={1} highlight="emerald" isLarge={true}
                    onClick={() => setExpandedIdx(expandedIdx === 0 ? null : 0)}
                    isActive={expandedIdx === 0}
                  />
                  <CareerPodiumCard 
                    career={marketData.top_careers[2]} rank={3} highlight="indigo"
                    onClick={() => setExpandedIdx(expandedIdx === 2 ? null : 2)}
                    isActive={expandedIdx === 2}
                  />
                  <CareerPodiumCard 
                    career={marketData.top_careers[4]} rank={5} 
                    onClick={() => setExpandedIdx(expandedIdx === 4 ? null : 4)}
                    isActive={expandedIdx === 4}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {expandedIdx !== null && expandedIdx !== 0 && marketData.top_careers[expandedIdx] && (
                    <motion.div
                      key={expandedIdx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="backdrop-blur-xl bg-indigo-900/30 border border-indigo-500/30 rounded-3xl p-8 mt-6 shadow-inner"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/30">
                            #{expandedIdx + 1}
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold text-white">
                              {marketData.top_careers[expandedIdx].career_name}
                            </h3>
                            <p className="text-indigo-300 flex items-center gap-2">
                               <TrendingUp size={14}/> Strategic Execution Roadmap
                            </p>
                          </div>
                        </div>
                        <button onClick={() => setExpandedIdx(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                          <X className="text-gray-400" />
                        </button>
                      </div>
                      
                      <p className="text-gray-200 text-lg leading-relaxed mb-8 border-l-4 border-indigo-500/40 pl-6">
                        {marketData.top_careers[expandedIdx].market_explanation}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {marketData.top_careers[expandedIdx].achieving_steps && marketData.top_careers[expandedIdx].achieving_steps.map((step: string, sIdx: number) => (
                          <div key={sIdx} className="bg-gray-900/50 p-5 rounded-2xl border border-indigo-500/20 group hover:border-indigo-500/50 transition-all">
                            <span className="text-indigo-400 font-bold block mb-2 text-xs uppercase tracking-widest">Phase 0{sIdx + 1}</span>
                            <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-40 border border-dashed border-indigo-500/20 rounded-3xl bg-gray-900/20 backdrop-blur-md"
          >
             <PieChart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
             <h3 className="text-xl font-semibold text-gray-400">Awaiting Market Data</h3>
             <p className="text-gray-500 mt-2">Click "Analyze Market Reality" to process your results.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
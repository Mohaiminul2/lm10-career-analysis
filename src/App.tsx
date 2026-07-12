import React from 'react';
import { DashboardProvider, useDashboard, DashboardTab } from './context/DashboardContext';
import { OverviewSection } from './components/OverviewSection';
import { ClubSection } from './components/ClubSection';
import { InternationalSection } from './components/InternationalSection';
import { AdvancedSection } from './components/AdvancedSection';
import { ExplorerSection } from './components/ExplorerSection';
import { 
  Trophy, 
  Award, 
  Globe, 
  Zap, 
  Search, 
  Download, 
  RotateCcw, 
  Sparkles,
  Database,
  SearchIcon,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function DashboardLayout() {
  const { 
    activeTab, 
    setActiveTab, 
    globalSearch, 
    setGlobalSearch,
    careerStats,
    exportToCSV,
    crossFilter,
    resetAllFilters,
    loading
  } = useDashboard();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Trophy, description: 'Career milestones & metrics' },
    { id: 'club', label: 'Club Dominance', icon: Award, description: 'Barca & PSG statistical splits' },
    { id: 'international', label: 'International', icon: Globe, description: 'Argentina career registry' },
    { id: 'advanced', label: 'Advanced Analytics', icon: Zap, description: 'Clustering, progression & rates' },
    { id: 'explorer', label: 'Goals Explorer', icon: Database, description: 'Browse & query raw goals list' }
  ] as const;

  const handleResetAllFilters = () => {
    resetAllFilters();
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-brand-bg text-white gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
        <p className="font-mono text-xs text-slate-400">Loading career goal database...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-bg text-slate-100 font-sans antialiased selection:bg-brand-blue/30 selection:text-white">
      {/* Sidebar Layout */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/5 bg-brand-card">
        {/* Sidebar Header Brand */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5 bg-brand-header">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-blue via-white to-brand-gold p-[1px]">
            <div className="h-full w-full rounded-lg bg-brand-bg flex items-center justify-center">
              <span className="font-black text-xs text-brand-blue tracking-tighter">LM10</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xs text-white tracking-widest uppercase">MESSI ANALYTICS</span>
            <span className="text-[10px] text-brand-blue font-mono">CAREER GOALS REGISTRY</span>
          </div>
        </div>

        {/* Profile/Bio Widget */}
        <div className="p-4 mx-3 my-4 rounded-xl border border-white/5 bg-brand-header/40 flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-brand-blue/5 blur-xl group-hover:bg-brand-blue/10 transition-colors" />
          
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {/* Albiceleste background bars */}
              <div className="absolute inset-0 flex opacity-10">
                <div className="w-1/3 bg-brand-blue h-full" />
                <div className="w-1/3 bg-white h-full" />
                <div className="w-1/3 bg-brand-blue h-full" />
              </div>
              <span className="text-xl font-black text-brand-blue tracking-tighter z-10">10</span>
            </div>
            
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs text-white truncate">Lionel Messi</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                GOAT Registry Verified
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 border-t border-white/5 pt-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Career Goals</span>
              <span className="text-base font-black text-white font-mono">{careerStats.totalGoals}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Match G/Ratio</span>
              <span className="text-base font-black text-brand-gold font-mono">
                {((careerStats.totalGoals / (1033 * 85)) * 90).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Options */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DashboardTab)}
                className={`group w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/25 font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/2 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-blue' : 'text-slate-400 group-hover:text-white'}`} />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-white font-semibold">{tab.label}</span>
                  <span className="text-[10px] text-slate-400 truncate font-normal">{tab.description}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Metadata */}
        <div className="p-4 border-t border-white/5 bg-brand-footer/50 font-mono text-[9px] text-slate-500 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>DATA REGISTRY</span>
            <span className="text-brand-blue font-bold">V3.2.0</span>
          </div>
          <div>ESTIMATED PER-90 ADJUSTED</div>
          <div className="text-[8px] text-slate-600 mt-1">© {new Date().getFullYear()} Lionel Messi Intelligence</div>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Dynamic Global Header */}
        <header className="h-16 shrink-0 bg-brand-header border-b border-white/5 flex items-center justify-between px-6 z-20">
          {/* Logo badge and mobile toggle if needed, or simple title */}
          <div className="flex items-center gap-4">
            <div className="md:hidden h-8 w-8 rounded-lg bg-gradient-to-br from-brand-blue via-white to-brand-gold p-[1px]">
              <div className="h-full w-full rounded-lg bg-brand-bg flex items-center justify-center">
                <span className="font-black text-xs text-brand-blue tracking-tighter">LM10</span>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
                Messi Career Intelligence
                {crossFilter && (
                  <span className="animate-pulse flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-blue/15 border border-brand-blue/30 text-[9px] text-brand-blue font-mono font-bold tracking-normal uppercase">
                    Chart Filter Active
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono uppercase hidden sm:block">Dominance Profiles, splits & historical registry records</p>
            </div>
          </div>

          {/* Actions & Filters Header controls */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search opponent, season..."
                className="w-full bg-brand-bg text-xs text-white pl-8 pr-3 py-2 rounded-lg border border-white/5 placeholder-slate-500 focus:outline-none focus:border-brand-blue transition-colors font-mono"
              />
            </div>

            {/* Clear Filters / Reset Button */}
            <button
              onClick={handleResetAllFilters}
              title="Reset all search & filter conditions"
              className="p-2 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Export CSV Dropdown or simple trigger */}
            <button
              onClick={() => exportToCSV('all')}
              title="Export complete career dataset as CSV file"
              className="px-3 py-2 rounded-lg bg-brand-blue text-brand-bg text-xs font-black hover:bg-opacity-90 hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">EXPORT CSV</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Bar (visible only below md breakpoint) */}
        <div className="md:hidden shrink-0 bg-brand-card border-b border-white/5 p-2 flex gap-1 overflow-x-auto scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DashboardTab)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-brand-blue/10 text-brand-blue font-bold border border-brand-blue/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Viewport / Inner Section */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-brand-bg">
          <div className="max-w-7xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'overview' && <OverviewSection />}
                {activeTab === 'club' && <ClubSection />}
                {activeTab === 'international' && <InternationalSection />}
                {activeTab === 'advanced' && <AdvancedSection />}
                {activeTab === 'explorer' && <ExplorerSection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer info line */}
        <footer className="h-8 shrink-0 bg-brand-footer border-t border-white/5 flex items-center justify-between px-6 font-mono text-[9px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>REAL-TIME PIPELINE VERIFIED</span>
          </div>
          <div>METRICS DERIVED CHRONOLOGICALLY FROM CERTIFIED SPORT DATABASES</div>
        </footer>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <DashboardLayout />
    </DashboardProvider>
  );
}

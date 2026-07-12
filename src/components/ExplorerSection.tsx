import React, { useMemo, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Goal } from '../types';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Award, 
  User, 
  MapPin, 
  Tag, 
  Activity,
  Maximize2
} from 'lucide-react';
import { motion } from 'motion/react';

export const ExplorerSection: React.FC = () => {
  const { goals, globalSearch, setGlobalSearch, setExplorerFilteredGoals, resetSignal } = useDashboard();
  
  // Local Filter States
  const [contextFilter, setContextFilter] = useState<'All' | 'Club' | 'International'>('All');
  const [footFilter, setFootFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [venueFilter, setVenueFilter] = useState<string>('All');
  
  // Sorting States
  const [sortBy, setSortBy] = useState<'number' | 'date' | 'minute'>('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  // Extract filter options
  const filterOptions = useMemo(() => {
    const feet = new Set<string>();
    const types = new Set<string>();
    
    goals.forEach(g => {
      if (g.foot) feet.add(g.foot);
      if (g.goalType) types.add(g.goalType);
    });
    
    return {
      feet: ['All', ...Array.from(feet).sort()],
      types: ['All', ...Array.from(types).sort()]
    };
  }, [goals]);

  // Handle Filtering & Searching
  const filteredGoals = useMemo(() => {
    let result = goals;

    // 1. Context Filter
    if (contextFilter !== 'All') {
      result = result.filter(g => g.context === contextFilter);
    }

    // 2. Foot Filter
    if (footFilter !== 'All') {
      result = result.filter(g => g.foot === footFilter);
    }

    // 3. Goal Type Filter
    if (typeFilter !== 'All') {
      result = result.filter(g => g.goalType === typeFilter);
    }

    // 4. Venue Filter
    if (venueFilter !== 'All') {
      result = result.filter(g => g.homeAway === venueFilter);
    }

    // 5. Global Search Filter
    if (globalSearch) {
      const query = globalSearch.toLowerCase();
      result = result.filter(g => 
        g.opponent.toLowerCase().includes(query) ||
        g.competition.toLowerCase().includes(query) ||
        g.season.toLowerCase().includes(query) ||
        g.clubOrCountry.toLowerCase().includes(query) ||
        g.assistedBy.toLowerCase().includes(query)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'number') {
        comparison = a.careerGoalNumber - b.careerGoalNumber;
      } else if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'minute') {
        comparison = a.minuteVal - b.minuteVal;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [goals, contextFilter, footFilter, typeFilter, venueFilter, globalSearch, sortBy, sortOrder]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [contextFilter, footFilter, typeFilter, venueFilter, globalSearch, sortBy, sortOrder]);

  // Publish the locally-filtered set so the global CSV export can use it
  React.useEffect(() => {
    setExplorerFilteredGoals(filteredGoals);
  }, [filteredGoals, setExplorerFilteredGoals]);

  // Respond to the global "Reset Filters" action
  React.useEffect(() => {
    setContextFilter('All');
    setFootFilter('All');
    setTypeFilter('All');
    setVenueFilter('All');
    setSortBy('number');
    setSortOrder('desc');
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  // Paginated Data
  const paginatedGoals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredGoals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGoals, currentPage]);

  const totalPages = Math.ceil(filteredGoals.length / itemsPerPage) || 1;

  const toggleSort = (field: 'number' | 'date' | 'minute') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Dynamic Filters Row */}
      <div className="grid gap-3 md:grid-cols-12 bg-brand-card border border-white/5 p-4 rounded-xl">
        {/* Context Selector */}
        <div className="md:col-span-3 flex flex-col gap-1">
          <label className="text-2xs font-bold tracking-wider text-slate-400 uppercase">Context</label>
          <div className="flex gap-1 bg-brand-bg p-1 rounded-lg border border-white/5">
            {(['All', 'Club', 'International'] as const).map(c => (
              <button
                key={c}
                onClick={() => setContextFilter(c)}
                className={`flex-1 text-center py-1 text-xs rounded font-medium transition-colors ${
                  contextFilter === c
                    ? 'bg-brand-blue text-brand-bg font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Foot Filter */}
        <div className="md:col-span-3 flex flex-col gap-1">
          <label className="text-2xs font-bold tracking-wider text-slate-400 uppercase">Finishing Foot</label>
          <select
            value={footFilter}
            onChange={(e) => setFootFilter(e.target.value)}
            className="w-full bg-brand-bg border border-white/5 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-brand-blue transition-colors"
          >
            {filterOptions.feet.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Goal Type Filter */}
        <div className="md:col-span-3 flex flex-col gap-1">
          <label className="text-2xs font-bold tracking-wider text-slate-400 uppercase">Goal Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-brand-bg border border-white/5 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-brand-blue transition-colors"
          >
            {filterOptions.types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Venue Filter */}
        <div className="md:col-span-3 flex flex-col gap-1">
          <label className="text-2xs font-bold tracking-wider text-slate-400 uppercase">Venue</label>
          <select
            value={venueFilter}
            onChange={(e) => setVenueFilter(e.target.value)}
            className="w-full bg-brand-bg border border-white/5 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-brand-blue transition-colors"
          >
            <option value="All">All Venues</option>
            <option value="Home">Home</option>
            <option value="Away">Away</option>
            <option value="Neutral">Neutral</option>
          </select>
        </div>
      </div>

      {/* Goal Log High Density Table */}
      <div className="bg-brand-card border border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-brand-header">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Goal Registry Log</h3>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">Showing {filteredGoals.length} indexed career goals</p>
          </div>
          <div className="flex gap-4 text-2xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-blue" />
              Left Foot
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-gold" />
              Direct Free Kick
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/5 bg-brand-bg/50 text-slate-400 text-2xs font-mono uppercase tracking-wider">
                <th 
                  onClick={() => toggleSort('number')}
                  className="p-3 pl-4 cursor-pointer hover:text-white transition-colors"
                >
                  Goal # {sortBy === 'number' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => toggleSort('date')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  Date {sortBy === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="p-3">Team</th>
                <th className="p-3">Opponent</th>
                <th className="p-3">Competition</th>
                <th 
                  onClick={() => toggleSort('minute')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  Min {sortBy === 'minute' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="p-3">Type</th>
                <th className="p-3">Method</th>
                <th className="p-3">Assisted By</th>
                <th className="p-3 text-right pr-4">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {paginatedGoals.map((g) => {
                const isFreeKick = g.goalType.toLowerCase().includes('free');
                const isPenalty = g.goalType.toLowerCase().includes('penalty');
                
                return (
                  <tr 
                    key={g.goalId} 
                    className="hover:bg-white/2 transition-colors font-sans"
                  >
                    {/* Goal Number */}
                    <td className="p-3 pl-4 font-mono font-bold text-slate-100">
                      #{g.careerGoalNumber}
                    </td>
                    
                    {/* Date */}
                    <td className="p-3 text-slate-300 font-mono whitespace-nowrap text-2xs">
                      {g.date}
                    </td>

                    {/* Team */}
                    <td className="p-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-semibold ${
                        g.isInternational 
                          ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20' 
                          : 'bg-white/5 text-slate-200 border border-white/10'
                      }`}>
                        {g.clubOrCountry === 'FC Barcelona' ? 'Barcelona' : g.clubOrCountry}
                      </span>
                    </td>

                    {/* Opponent */}
                    <td className="p-3 font-semibold text-white whitespace-nowrap">
                      {g.opponent}
                    </td>

                    {/* Competition */}
                    <td className="p-3 text-slate-300 text-2xs max-w-[150px] truncate" title={g.competition}>
                      {g.competition}
                    </td>

                    {/* Minute */}
                    <td className="p-3">
                      <span className={`inline-block font-mono font-bold px-1 py-0.5 rounded text-2xs ${
                        g.minuteVal > 89 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'bg-slate-800/40 text-slate-300'
                      }`}>
                        {g.minute}'
                      </span>
                    </td>

                    {/* Goal Type */}
                    <td className="p-3 whitespace-nowrap">
                      <span className={`text-2xs font-medium ${
                        isFreeKick 
                          ? 'text-brand-gold' 
                          : isPenalty 
                          ? 'text-amber-500' 
                          : 'text-slate-300'
                      }`}>
                        {g.goalType}
                      </span>
                    </td>

                    {/* Method (Foot/Header) */}
                    <td className="p-3 whitespace-nowrap">
                      <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded ${
                        g.foot === 'Left' 
                          ? 'bg-brand-blue/10 text-brand-blue' 
                          : g.foot === 'Right'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-400/10 text-amber-400'
                      }`}>
                        {g.foot}
                      </span>
                    </td>

                    {/* Assisted By */}
                    <td className="p-3 text-slate-300 text-2xs italic max-w-[120px] truncate" title={g.assistedBy}>
                      {g.assistedBy === 'Unassisted' ? '—' : g.assistedBy}
                    </td>

                    {/* Score */}
                    <td className="p-3 text-right pr-4 font-mono font-bold text-slate-200 text-2xs whitespace-nowrap">
                      {g.scoreAtGoal}
                    </td>
                  </tr>
                );
              })}

              {paginatedGoals.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400 italic">
                    No goal registry entries match current filters and search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dense Pagination Control */}
        <div className="p-3 border-t border-white/5 bg-brand-header flex items-center justify-between font-mono text-2xs text-slate-400">
          <div>
            Showing <span className="text-white font-bold">{Math.min(filteredGoals.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredGoals.length, currentPage * itemsPerPage)}</span> of <span className="text-white font-bold">{filteredGoals.length}</span> goal entries
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-brand-bg hover:bg-white/5 border border-white/5 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 text-slate-300">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-brand-bg hover:bg-white/5 border border-white/5 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

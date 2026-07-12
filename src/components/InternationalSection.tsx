import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { internationalAppearances, calculateScoringRate } from '../data/appearances';
import { KPICard } from './KPICard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  Filter,
  RefreshCw,
  Trophy,
  Activity,
  Globe,
  Flame,
  Calendar,
  EyeOff,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';

const COLORS = {
  sky: '#75AADB',
  gold: '#D4AF37',
  white: '#f1f5f9',
  slate: '#64748b',
  crimson: '#f43f5e',
  emerald: '#10b981',
  purple: '#a855f7'
};

const PIE_COLORS = [COLORS.sky, COLORS.gold, COLORS.white, COLORS.emerald, COLORS.purple];

export const InternationalSection: React.FC = () => {
  const {
    allIntGoals,
    filteredIntGoals,
    intFilters,
    setIntFilter,
    resetIntFilters,
    crossFilter,
    setCrossFilter,
    clearCrossFilter
  } = useDashboard();

  // Extract unique options dynamically
  const filterOptions = useMemo(() => {
    const opponents = new Set<string>();
    const compTypes = new Set<string>();

    allIntGoals.forEach(g => {
      if (g.opponent) opponents.add(g.opponent);
      if (g.competitionType) compTypes.add(g.competitionType);
    });

    return {
      opponents: ['All', ...Array.from(opponents).sort()],
      competitionTypes: ['All', ...Array.from(compTypes).sort()]
    };
  }, [allIntGoals]);

  // Calculate matching appearances/matches for active filters
  const estimatedMatches = useMemo(() => {
    // Collect active calendar years present in the filtered set
    const activeYears = new Set<number>(filteredIntGoals.map(g => g.year as number));
    let total = 0;
    activeYears.forEach(y => {
      total += internationalAppearances[y] || 0;
    });
    // Fallback if no goals found
    return total || Object.values(internationalAppearances).reduce((a, b) => a + b, 0);
  }, [filteredIntGoals]);

  const scoringRates = useMemo(() => {
    return calculateScoringRate(filteredIntGoals.length, estimatedMatches);
  }, [filteredIntGoals.length, estimatedMatches]);

  // Chart 1: Goals by Opponent (Top 10)
  const opponentChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredIntGoals.forEach(g => {
      counts[g.opponent] = (counts[g.opponent] || 0) + 1;
    });

    return Object.keys(counts)
      .map(opp => ({ name: opp, goals: counts[opp] }))
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10);
  }, [filteredIntGoals]);

  // Chart 2: Goals by Competition Type
  const compTypeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredIntGoals.forEach(g => {
      counts[g.competitionType] = (counts[g.competitionType] || 0) + 1;
    });

    return Object.keys(counts)
      .map(name => ({ name, value: counts[name] }))
      .sort((a, b) => b.value - a.value);
  }, [filteredIntGoals]);

  // Chart 3: Minute-by-Minute distribution
  const minuteChartData = useMemo(() => {
    const buckets = ['0-15', '16-30', '31-45', '46-60', '61-75', '76-90', '90+'];
    const counts: Record<string, number> = {};
    buckets.forEach(b => { counts[b] = 0; });

    filteredIntGoals.forEach(g => {
      if (counts[g.minuteBucket] !== undefined) {
        counts[g.minuteBucket]++;
      }
    });

    return buckets.map(bucket => ({
      bucket,
      goals: counts[bucket]
    }));
  }, [filteredIntGoals]);

  // Chart 4: Age-at-Goal distribution (shows longevity)
  const ageChartData = useMemo(() => {
    const counts: Record<number, number> = {};
    // Seed possible ages: 18 to 38
    for (let age = 18; age <= 38; age++) {
      counts[age] = 0;
    }

    filteredIntGoals.forEach(g => {
      const roundedAge = Math.floor(g.ageAtGoal);
      if (counts[roundedAge] !== undefined) {
        counts[roundedAge]++;
      }
    });

    return Object.keys(counts)
      .map(ageStr => {
        const age = parseInt(ageStr, 10);
        return {
          age,
          goals: counts[age]
        };
      })
      .sort((a, b) => a.age - b.age);
  }, [filteredIntGoals]);

  // Splits: Open Play vs Penalties vs Free Kicks
  const typeStats = useMemo(() => {
    let openPlay = 0;
    let penalty = 0;
    let freeKick = 0;

    filteredIntGoals.forEach(g => {
      const typeLower = g.goalType.toLowerCase();
      if (typeLower.includes('penalty')) penalty++;
      else if (typeLower.includes('free')) freeKick++;
      else openPlay++;
    });

    const total = openPlay + penalty + freeKick || 1;

    return {
      openPlay,
      penalty,
      freeKick,
      openPlayPct: Math.round((openPlay / total) * 100),
      penaltyPct: Math.round((penalty / total) * 100),
      freeKickPct: Math.round((freeKick / total) * 100)
    };
  }, [filteredIntGoals]);

  // Interactive cross filtering (global cross-filter)
  const handleCompPieClick = (data: any) => {
    if (data && data.name) {
      setCrossFilter({ field: 'competitionType', value: data.name });
    }
  };

  const handleOpponentClick = (data: any) => {
    if (data && data.name) {
      setCrossFilter({ field: 'opponent', value: data.name });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Controller Board */}
      <div className="rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-brand-blue/10 p-1.5 text-brand-blue border border-brand-blue/20">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">International Database Filters</h3>
              <p className="text-2xs text-slate-400 font-mono mt-0.5">Manage Argentina Albiceleste matches and tournaments</p>
            </div>
          </div>
          
          <button
            onClick={resetIntFilters}
            className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-brand-bg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer font-mono"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {/* Opponent Filter */}
          <div className="space-y-1.5">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono">Opponent</label>
            <select
              value={intFilters.opponent}
              onChange={(e) => setIntFilter('opponent', e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-brand-bg px-3 py-2 text-xs font-medium text-slate-100 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              {filterOptions.opponents.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Competition Type Filter */}
          <div className="space-y-1.5">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono">Competition Type</label>
            <select
              value={intFilters.competitionType}
              onChange={(e) => setIntFilter('competitionType', e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-brand-bg px-3 py-2 text-xs font-medium text-slate-100 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              {filterOptions.competitionTypes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Foot Filter */}
          <div className="space-y-1.5">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono">Finishing Body Part</label>
            <select
              value={intFilters.foot}
              onChange={(e) => setIntFilter('foot', e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-brand-bg px-3 py-2 text-xs font-medium text-slate-100 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="All">All Parts</option>
              <option value="Left">Left Foot</option>
              <option value="Right">Right Foot</option>
              <option value="Header">Header</option>
            </select>
          </div>

          {/* Goal Type Filter */}
          <div className="space-y-1.5">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono">Goal Type</label>
            <select
              value={intFilters.goalType}
              onChange={(e) => setIntFilter('goalType', e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-brand-bg px-3 py-2 text-xs font-medium text-slate-100 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="All">All Types</option>
              <option value="Open Play">Open Play</option>
              <option value="Penalty">Penalty</option>
              <option value="Direct Free Kick">Direct Free Kick</option>
            </select>
          </div>
        </div>

        {/* Active Cross-filter badge */}
        {crossFilter && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-gold/10 border border-brand-gold/20 px-3 py-1.5 text-xs text-brand-gold font-mono">
            <HelpCircle className="h-4 w-4" />
            <span>
              Active Interactive Chart Filter: <strong>{crossFilter.field} = {crossFilter.value}</strong>
            </span>
            <button
              onClick={clearCrossFilter}
              className="ml-auto flex items-center gap-1 rounded bg-brand-gold/20 hover:bg-brand-gold/30 px-2 py-0.5 font-bold transition cursor-pointer text-2xs"
            >
              <EyeOff className="h-3 w-3" /> Clear Chart Filter
            </button>
          </div>
        )}
      </div>

      {/* Performance Intelligence Bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard
          id="intl-filtered-total"
          title="Filtered Albiceleste Goals"
          value={filteredIntGoals.length}
          subValue={`/ ${allIntGoals.length}`}
          subLabel="Total Argentina Registry"
          icon={Globe}
          accentColor="sky"
        />
        <KPICard
          id="intl-active-matches"
          title="Active Match Registry"
          value={estimatedMatches}
          subLabel="Calendar year appearances"
          icon={Calendar}
          accentColor="white"
        />
        <KPICard
          id="intl-estimated-g90"
          title="Active Goals/90 Rate"
          value={scoringRates.per90}
          subValue={`${scoringRates.perGame} GPG`}
          subLabel="Scoring rate equivalent"
          icon={Activity}
          accentColor="gold"
          tooltipText="Estimated G/90 matches the active filter set. Calculated as (Filtered Goals / (Estimated Appearances * 85 minutes)) * 90."
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Goals by Opponent (Bar Chart) */}
        <div className="lg:col-span-8 rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Flame className="h-4 w-4 text-brand-blue" />
              Goals by International Opponent (Top 10)
            </h4>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">Bolivia, Brazil, Ecuador, etc. Click to filter goals</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={opponentChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }} onClick={handleOpponentClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} interval={0} tickFormatter={(v) => v.split(' ')[0]} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1A1D23', borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#75AADB', fontWeight: 'bold' }}
                />
                <Bar dataKey="goals" fill="#75AADB" radius={[4, 4, 0, 0]} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals by Competition Type (Pie Chart) */}
        <div className="lg:col-span-4 rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="mb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Trophy className="h-4 w-4 text-brand-gold" />
              Tournament Profile
            </h4>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">Click slice to filter competition types</p>
          </div>

          <div className="h-[180px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={compTypeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={handleCompPieClick}
                  className="cursor-pointer focus:outline-none"
                >
                  {compTypeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1A1D23', borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend list */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 max-h-[85px] overflow-y-auto">
            {compTypeChartData.map((item, index) => (
              <button
                key={item.name}
                onClick={() => setIntFilter('competitionType', item.name)}
                className="hover:bg-white/2 p-1.5 rounded transition text-left cursor-pointer flex items-center justify-between"
              >
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[100px] font-mono">{item.name}</span>
                <span className="text-xs font-extrabold text-white" style={{ color: PIE_COLORS[index % PIE_COLORS.length] }}>
                  {item.value}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Goals by Minute Bucket (Line Chart) */}
        <div className="rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Activity className="h-4 w-4 text-brand-blue" />
              Minute Distribution (Argentina)
            </h4>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">Goal frequency across 15-minute intervals</p>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={minuteChartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
                <XAxis dataKey="bucket" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1A1D23', borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Line type="monotone" dataKey="goals" stroke="#75AADB" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age-at-Goal Distribution (Area Chart - Longevity analysis) */}
        <div className="rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="h-4 w-4 text-brand-gold" />
              Age-at-Goal Profile (Longevity Curve)
            </h4>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">Goals scored by age group (18 – 38 years old)</p>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ageChartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAgeGoals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
                <XAxis dataKey="age" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1A1D23', borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="goals" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorAgeGoals)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Goal Architecture (Open Play vs Set Pieces Progress Block) */}
      <div className="rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
        <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-mono">Argentina Goal Architecture (Open Play vs Set Pieces)</h4>
        <div className="space-y-4">
          <div className="flex h-5 overflow-hidden rounded-lg bg-brand-bg border border-white/5 text-[9px] font-mono font-bold text-slate-950">
            <div style={{ width: `${typeStats.openPlayPct}%` }} className="bg-brand-blue text-brand-bg text-center flex items-center justify-center font-black">
              {typeStats.openPlay > 0 && `${typeStats.openPlayPct}%`}
            </div>
            <div style={{ width: `${typeStats.penaltyPct}%` }} className="bg-brand-gold text-brand-bg text-center flex items-center justify-center font-black">
              {typeStats.penalty > 0 && `${typeStats.penaltyPct}%`}
            </div>
            <div style={{ width: `${typeStats.freeKickPct}%` }} className="bg-white text-brand-bg text-center flex items-center justify-center font-black">
              {typeStats.freeKick > 0 && `${typeStats.freeKickPct}%`}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono">
            <div>
              <span className="inline-block h-2 w-2 rounded-full bg-brand-blue mr-1.5" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Open Play:</span>
              <span className="block text-xs font-black text-white mt-0.5">{typeStats.openPlay} Goals</span>
            </div>
            <div>
              <span className="inline-block h-2 w-2 rounded-full bg-brand-gold mr-1.5" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Penalties:</span>
              <span className="block text-xs font-black text-white mt-0.5">{typeStats.penalty} Goals</span>
            </div>
            <div>
              <span className="inline-block h-2 w-2 rounded-full bg-white mr-1.5" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Free Kicks:</span>
              <span className="block text-xs font-black text-white mt-0.5">{typeStats.freeKick} Goals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { clubAppearances, calculateScoringRate } from '../data/appearances';
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
  Line
} from 'recharts';
import {
  Filter,
  RefreshCw,
  Trophy,
  Activity,
  Flame,
  Users,
  PieChart as PieIcon,
  HelpCircle,
  EyeOff
} from 'lucide-react';
import { motion } from 'motion/react';

const COLORS = {
  sky: '#75AADB',
  gold: '#D4AF37',
  white: '#f1f5f9',
  darkBlue: '#151921',
  slate: '#64748b',
  crimson: '#f43f5e',
  emerald: '#10b981',
  purple: '#a855f7'
};

const PIE_COLORS = [COLORS.sky, COLORS.gold, COLORS.white, COLORS.emerald, COLORS.purple];

export const ClubSection: React.FC = () => {
  const {
    allClubGoals,
    filteredClubGoals,
    clubFilters,
    setClubFilter,
    resetClubFilters,
    crossFilter,
    setCrossFilter,
    clearCrossFilter
  } = useDashboard();

  // Extract unique options for filter dropdowns dynamically
  const filterOptions = useMemo(() => {
    const seasons = new Set<string>();
    const competitions = new Set<string>();
    const opponents = new Set<string>();

    allClubGoals.forEach(g => {
      if (g.season) seasons.add(g.season);
      if (g.competition) competitions.add(g.competition);
      if (g.opponent) opponents.add(g.opponent);
    });

    return {
      seasons: ['All', ...Array.from(seasons).sort().reverse()],
      competitions: ['All', ...Array.from(competitions).sort()],
      opponents: ['All', ...Array.from(opponents).sort()]
    };
  }, [allClubGoals]);

  // Calculate matching appearances/matches for active filters
  const estimatedMatches = useMemo(() => {
    if (clubFilters.season !== 'All') {
      return clubAppearances[clubFilters.season] || 45;
    }
    // If season filter is All, let's sum appearances up to seasons present in the filtered set
    const activeSeasons = new Set<string>(filteredClubGoals.map(g => g.season as string));
    let total = 0;
    activeSeasons.forEach(s => {
      total += clubAppearances[s] || 0;
    });
    // Fallback if no goals found
    return total || Object.values(clubAppearances).reduce((a, b) => a + b, 0);
  }, [filteredClubGoals, clubFilters.season]);

  const scoringRates = useMemo(() => {
    return calculateScoringRate(filteredClubGoals.length, estimatedMatches);
  }, [filteredClubGoals.length, estimatedMatches]);

  // Chart 1: Seasonal Goals Totals
  const seasonalChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    // Seed all seasons for consistency
    filterOptions.seasons.forEach(s => {
      if (s !== 'All') counts[s] = 0;
    });

    filteredClubGoals.forEach(g => {
      if (counts[g.season] !== undefined) counts[g.season]++;
    });

    return Object.keys(counts)
      .sort()
      .map(season => ({
        season,
        goals: counts[season]
      }));
  }, [filteredClubGoals, filterOptions.seasons]);

  // Chart 2: Goals by Competition
  const compChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClubGoals.forEach(g => {
      counts[g.competition] = (counts[g.competition] || 0) + 1;
    });

    return Object.keys(counts).map(comp => ({
      name: comp,
      value: counts[comp]
    })).sort((a, b) => b.value - a.value);
  }, [filteredClubGoals]);

  // Chart 3: Goals by Minute Bucket
  const minuteChartData = useMemo(() => {
    const buckets = ['0-15', '16-30', '31-45', '46-60', '61-75', '76-90', '90+'];
    const counts: Record<string, number> = {};
    buckets.forEach(b => { counts[b] = 0; });

    filteredClubGoals.forEach(g => {
      if (counts[g.minuteBucket] !== undefined) {
        counts[g.minuteBucket]++;
      }
    });

    return buckets.map(bucket => ({
      bucket,
      goals: counts[bucket]
    }));
  }, [filteredClubGoals]);

  // Chart 4: Goals by Foot
  const footChartData = useMemo(() => {
    const counts: Record<'Left' | 'Right' | 'Header', number> = { Left: 0, Right: 0, Header: 0 };
    filteredClubGoals.forEach(g => {
      counts[g.foot]++;
    });

    return (Object.keys(counts) as Array<'Left' | 'Right' | 'Header'>)
      .map(f => ({ name: f, value: counts[f] }))
      .filter(item => item.value > 0);
  }, [filteredClubGoals]);

  // Chart 5: Top Assist Providers (excluding Unassisted)
  const assistChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClubGoals.forEach(g => {
      if (g.isAssisted && g.assistedBy !== 'Unassisted') {
        counts[g.assistedBy] = (counts[g.assistedBy] || 0) + 1;
      }
    });

    return Object.keys(counts)
      .map(name => ({ name, assists: counts[name] }))
      .sort((a, b) => b.assists - a.assists)
      .slice(0, 7); // Show top 7 partners
  }, [filteredClubGoals]);

  // Splits: Home/Away
  const venueStats = useMemo(() => {
    let home = 0;
    let away = 0;
    let neutral = 0;

    filteredClubGoals.forEach(g => {
      if (g.homeAway === 'Home') home++;
      else if (g.homeAway === 'Away') away++;
      else neutral++;
    });

    const total = home + away + neutral || 1;

    return {
      home,
      away,
      neutral,
      homePct: Math.round((home / total) * 100),
      awayPct: Math.round((away / total) * 100),
      neutralPct: Math.round((neutral / total) * 100)
    };
  }, [filteredClubGoals]);

  // Splits: Open Play vs Rest
  const typeStats = useMemo(() => {
    let openPlay = 0;
    let penalty = 0;
    let freeKick = 0;

    filteredClubGoals.forEach(g => {
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
  }, [filteredClubGoals]);

  // Interactive Chart clicking filters (global cross-filter)
  const handleFootPieClick = (data: any) => {
    if (data && data.name) {
      setCrossFilter({ field: 'foot', value: data.name });
    }
  };

  const handleCompBarClick = (data: any) => {
    if (data && data.name) {
      setCrossFilter({ field: 'competition', value: data.name });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Controller Board */}
      <div className="rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-brand-blue/10 p-1.5 text-brand-blue border border-brand-blue/20">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Club Database Filters</h3>
              <p className="text-2xs text-slate-400 font-mono mt-0.5">Apply granular filters or click graph elements to cross-filter</p>
            </div>
          </div>
          
          <button
            onClick={resetClubFilters}
            className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-brand-bg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer font-mono"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
          {/* Season Filter */}
          <div className="space-y-1.5">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono">Season</label>
            <select
              value={clubFilters.season}
              onChange={(e) => setClubFilter('season', e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-brand-bg px-3 py-2 text-xs font-medium text-slate-100 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              {filterOptions.seasons.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Competition Filter */}
          <div className="space-y-1.5">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono">Competition</label>
            <select
              value={clubFilters.competition}
              onChange={(e) => setClubFilter('competition', e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-brand-bg px-3 py-2 text-xs font-medium text-slate-100 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              {filterOptions.competitions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Opponent Filter */}
          <div className="space-y-1.5">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono">Opponent</label>
            <select
              value={clubFilters.opponent}
              onChange={(e) => setClubFilter('opponent', e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-brand-bg px-3 py-2 text-xs font-medium text-slate-100 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              {filterOptions.opponents.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Foot Filter */}
          <div className="space-y-1.5">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono">Finishing Body Part</label>
            <select
              value={clubFilters.foot}
              onChange={(e) => setClubFilter('foot', e.target.value)}
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
              value={clubFilters.goalType}
              onChange={(e) => setClubFilter('goalType', e.target.value)}
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
            <HelpCircle className="h-4 w-4 text-brand-gold" />
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
          id="club-filtered-total"
          title="Filtered Goals"
          value={filteredClubGoals.length}
          subValue={`/ ${allClubGoals.length}`}
          subLabel="Total Club Registry"
          icon={Trophy}
          accentColor="sky"
        />
        <KPICard
          id="club-active-matches"
          title="Active Season Matches"
          value={estimatedMatches}
          subLabel="Aggregated appearances"
          icon={Users}
          accentColor="white"
        />
        <KPICard
          id="club-estimated-g90"
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
        {/* Seasonal Goal Totals (Bar Chart) */}
        <div className="lg:col-span-8 rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Flame className="h-4 w-4 text-brand-blue" />
              Seasonal Goal Progression
            </h4>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">Totals per competitive club campaign</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} />
                <XAxis dataKey="season" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1A1D23', borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#75AADB', fontWeight: 'bold' }}
                />
                <Bar dataKey="goals" fill="#75AADB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals by Foot & Finish Splits */}
        <div className="lg:col-span-4 rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="mb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <PieIcon className="h-4 w-4 text-brand-gold" />
              Finishing Body Part
            </h4>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">Click slice to filter dashboard views</p>
          </div>

          <div className="h-[180px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={footChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={handleFootPieClick}
                  className="cursor-pointer focus:outline-none"
                >
                  {footChartData.map((entry, index) => (
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
          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/5">
            {footChartData.map((item, index) => (
              <button
                key={item.name}
                onClick={() => setClubFilter('foot', item.name)}
                className="hover:bg-white/2 p-1.5 rounded transition text-left cursor-pointer"
              >
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">{item.name}</span>
                <span className="text-sm font-extrabold text-white" style={{ color: PIE_COLORS[index % PIE_COLORS.length] }}>
                  {item.value}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Goals by Competition (Horizontal Bar Chart) */}
        <div className="md:col-span-4 rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Trophy className="h-4 w-4 text-brand-gold" />
              Goals by Competition
            </h4>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">Click bar to filter competition goals</p>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={compChartData.slice(0, 5)}
                margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} width={80} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1A1D23', borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="value" fill="#D4AF37" radius={[0, 4, 4, 0]} onClick={handleCompBarClick} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals by Minute Bucket (Line Chart) */}
        <div className="md:col-span-4 rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Activity className="h-4 w-4 text-brand-blue" />
              Minute-by-Minute Distribution
            </h4>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">Goal counts in 15-minute intervals</p>
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

        {/* Top Assist Providers (Horizontal Bar) */}
        <div className="md:col-span-4 rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="h-4 w-4 text-brand-blue" />
              Top Assist Providers
            </h4>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">His primary partners on the pitch</p>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={assistChartData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} width={80} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1A1D23', borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="assists" fill="#D4AF37" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced Split Visualizers (Glass Progress Cards) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Home vs Away split progress block */}
        <div className="rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
          <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-mono">Venue Splits (Home vs Away vs Neutral)</h4>
          <div className="space-y-4 font-sans">
            {/* Progress line */}
            <div className="flex h-5 overflow-hidden rounded-lg bg-brand-bg border border-white/5 text-[9px] font-mono font-bold text-slate-950">
              <div style={{ width: `${venueStats.homePct}%` }} className="bg-brand-blue text-brand-bg text-center flex items-center justify-center font-black">
                {venueStats.home > 0 && `${venueStats.homePct}%`}
              </div>
              <div style={{ width: `${venueStats.awayPct}%` }} className="bg-brand-gold text-brand-bg text-center flex items-center justify-center font-black">
                {venueStats.away > 0 && `${venueStats.awayPct}%`}
              </div>
              <div style={{ width: `${venueStats.neutralPct}%` }} className="bg-white text-brand-bg text-center flex items-center justify-center font-black">
                {venueStats.neutral > 0 && `${venueStats.neutralPct}%`}
              </div>
            </div>

            {/* Labels and values */}
            <div className="grid grid-cols-3 gap-2 font-mono">
              <div>
                <span className="inline-block h-2 w-2 rounded-full bg-brand-blue mr-1.5" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Home:</span>
                <span className="block text-xs font-black text-white mt-0.5">{venueStats.home} Goals</span>
              </div>
              <div>
                <span className="inline-block h-2 w-2 rounded-full bg-brand-gold mr-1.5" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Away:</span>
                <span className="block text-xs font-black text-white mt-0.5">{venueStats.away} Goals</span>
              </div>
              <div>
                <span className="inline-block h-2 w-2 rounded-full bg-white mr-1.5" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Neutral:</span>
                <span className="block text-xs font-black text-white mt-0.5">{venueStats.neutral} Goals</span>
              </div>
            </div>
          </div>
        </div>

        {/* Open Play vs Penalty Split progress block */}
        <div className="rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
          <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-mono">Goal Architecture (Open Play vs Set Pieces)</h4>
          <div className="space-y-4 font-sans">
            {/* Progress line */}
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

            {/* Labels and values */}
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
    </div>
  );
};

import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { KPICard } from './KPICard';
import {
  Trophy,
  Activity,
  Globe,
  Award,
  Calendar,
  Zap,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';
import messiImage from '../assets/Messi.jpg';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const OverviewSection: React.FC = () => {
  const { goals, careerStats } = useDashboard();

  // Milestones to highlight
  const milestones = useMemo(() => {
    if (goals.length === 0) return [];
    const sorted = [...goals].sort((a, b) => a.goalId - b.goalId);
    
    const targets = [1, 100, 300, 500, 700, 800];
    const found: typeof sorted = [];
    
    targets.forEach(t => {
      const match = sorted.find(g => g.careerGoalNumber === t);
      if (match) found.push(match);
    });

    // Also find last goal
    if (sorted.length > 0 && !targets.includes(sorted[sorted.length - 1].careerGoalNumber)) {
      found.push(sorted[sorted.length - 1]);
    }

    return found;
  }, [goals]);

  // Aggregate cumulative curve for Recharts
  // To avoid chart lag with many points, we downsample or aggregate by year/month
  const chartData = useMemo(() => {
    if (goals.length === 0) return [];
    
    const sorted = [...goals].sort((a, b) => a.goalId - b.goalId);
    let cumulative = 0;
    
    // Group goals by year and month to get milestone values
    const grouped: Record<string, { dateLabel: string; cumulative: number; year: number }> = {};
    
    sorted.forEach((g) => {
      cumulative++;
      // Create a key by year and month
      const key = `${g.year}-${String(g.month).padStart(2, '0')}`;
      grouped[key] = {
        dateLabel: `${g.monthName} ${g.year}`,
        cumulative,
        year: g.year
      };
    });
    
    // Convert back to sorted array
    return Object.keys(grouped)
      .sort()
      .map(key => grouped[key]);
  }, [goals]);

  // Combined career appearances
  // Total club: 853 appearances (Barcelona, PSG, Inter Miami)
  // Total international: 180 appearances (Argentina)
  // Total: 1033 appearances
  const totalAppearances = 853 + 180;
  const combinedPer90 = ((careerStats.totalGoals / (totalAppearances * 85)) * 90).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Premium Graphic Banner & Bio Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-white/5 bg-brand-card p-6 md:p-8 shadow-2xl backdrop-blur-md"
      >
        {/* Subtle geometric neon background accents */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-brand-blue/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-brand-gold/5 blur-3xl" />
        
        <div className="grid gap-6 md:grid-cols-12 items-center relative z-10">
          {/* Biography & App Description */}
          <div className="md:col-span-9 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-brand-gold" />
                GOAT Career Registry
              </span>
              <span className="rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1 text-xs font-semibold text-brand-gold flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5" />
                {careerStats.totalGoals} Certified Goals
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
              Lionel Messi <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-slate-100 to-brand-gold font-medium">Career Intelligence</span>
            </h1>

            <p className="text-sm leading-relaxed text-slate-300 max-w-3xl font-sans">
              Explore the exhaustive goals repository of association football’s ultimate playmaker. 
              This premium sports analytics platform isolates club-level dominance at FC Barcelona and Paris Saint-Germain 
              from his legendary international exploits with Argentina. Click any chart segment or use global parameters to 
              cross-filter his performance data.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="h-4 w-4 text-brand-blue" />
                <span className="text-xs">2005 – 2025</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Globe className="h-4 w-4 text-brand-blue" />
                <span className="text-xs">1033 Match Registry</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="h-4 w-4 text-brand-blue" />
                <span className="text-xs">Global Venues</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Zap className="h-4 w-4 text-brand-blue" />
                <span className="text-xs">Active Filter Sync</span>
              </div>
            </div>
          </div>

          {/* Profile Picture */}
          <div className="md:col-span-3 flex justify-center md:justify-end">
            <div className="relative w-[375px] aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-brand-bg shadow-xl ring-2 ring-brand-blue/30">
              <img
                src={messiImage}
                alt="Lionel Messi Profile"
                width={375}
                height={500}
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main KPI Card Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          id="kpi-career-total"
          title="Career Goals"
          value={careerStats.totalGoals}
          subValue="100%"
          subLabel="Club & International"
          icon={Trophy}
          accentColor="gold"
        />
        <KPICard
          id="kpi-club-total"
          title="Club Goals"
          value={careerStats.clubGoals}
          subValue={`${Math.round((careerStats.clubGoals / careerStats.totalGoals) * 100)}%`}
          subLabel="FC Barcelona & PSG"
          icon={Award}
          accentColor="sky"
        />
        <KPICard
          id="kpi-intl-total"
          title="International"
          value={careerStats.internationalGoals}
          subValue={`${Math.round((careerStats.internationalGoals / careerStats.totalGoals) * 100)}%`}
          subLabel="Argentina Albiceleste"
          icon={Globe}
          accentColor="white"
        />
        <KPICard
          id="kpi-estimated-per90"
          title="Estimated Per-90 Rate"
          value={combinedPer90}
          subValue={`${combinedPer90}G`}
          subLabel="Per game equivalent"
          icon={Activity}
          accentColor="sky"
          tooltipText="Calculated as (Total Goals / Total Estimated Minutes) * 90. Assumes an average of 85 minutes across 1033 total appearances."
        />
      </div>

      {/* Career Progression Curve */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 overflow-hidden rounded-xl border border-white/5 bg-brand-card p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <TrendingUp className="h-4 w-4 text-brand-blue" />
                Cumulative Goal Progression
              </h3>
              <p className="text-2xs text-slate-400 font-mono mt-0.5">Chronological build-up to {careerStats.totalGoals} career goals</p>
            </div>
            <div className="text-right">
              <span className="text-2xs font-bold text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-full border border-brand-blue/20 font-mono uppercase">
                Timeline Velocity
              </span>
            </div>
          </div>

          {/* Recharts Cumulative Progression Area Chart */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#75AADB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#75AADB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis
                  dataKey="year"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  type="number"
                  domain={['auto', 'auto']}
                  tickFormatter={(tick) => String(tick)}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, Math.ceil(careerStats.totalGoals / 50) * 50]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1D23',
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  labelStyle={{ color: '#75AADB', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Career Goals"
                  stroke="#75AADB"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGoals)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Career Milestones Milestones Timeline */}
        <div className="lg:col-span-4 rounded-xl border border-white/5 bg-brand-card p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2 uppercase tracking-wider">
              <Trophy className="h-4 w-4 text-brand-gold" />
              Legendary Milestones
            </h3>
            <p className="text-2xs text-slate-400 font-mono mb-5">Key career benchmark goals</p>
          </div>

          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
            {milestones.map((m, idx) => (
              <div key={m.goalId} className="flex gap-3 relative group">
                {idx !== milestones.length - 1 && (
                  <div className="absolute left-2.5 top-6 bottom-0 w-[1px] bg-white/5" />
                )}
                
                <div className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-bg border border-white/10 text-[9px] font-bold text-brand-blue group-hover:border-brand-gold transition-colors font-mono">
                  {idx + 1}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100 font-mono">
                      Goal #{m.careerGoalNumber}
                    </span>
                    <span className="text-[9px] text-brand-gold bg-brand-gold/10 px-1.5 py-0.2 rounded border border-brand-gold/20 font-bold font-mono uppercase">
                      {m.context}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    vs <span className="font-semibold">{m.opponent}</span> ({m.result})
                  </p>
                  <p className="text-2xs text-slate-500 font-mono">
                    {m.date} • {m.competition}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

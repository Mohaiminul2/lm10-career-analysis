import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  Activity,
  Flame,
  Award,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';

const COLORS = {
  sky: '#75AADB',
  gold: '#D4AF37',
  white: '#f1f5f9',
  slate: '#64748b',
  crimson: '#f43f5e',
  emerald: '#10b981'
};

export const AdvancedSection: React.FC = () => {
  const { goals, allClubGoals, allIntGoals } = useDashboard();

  // 1. Club vs International Analytical Profiles
  const profileStats = useMemo(() => {
    const calcStatsForSubset = (subset: typeof goals) => {
      if (subset.length === 0) return { avgAge: 0, assistedPct: 0, leftPct: 0, rightPct: 0, headerPct: 0 };
      
      let sumAge = 0;
      let assisted = 0;
      let left = 0;
      let right = 0;
      let header = 0;

      subset.forEach(g => {
        sumAge += g.ageAtGoal;
        if (g.isAssisted) assisted++;
        if (g.foot === 'Left') left++;
        else if (g.foot === 'Right') right++;
        else if (g.foot === 'Header') header++;
      });

      const total = subset.length;
      return {
        avgAge: (sumAge / total).toFixed(1),
        assistedPct: Math.round((assisted / total) * 100),
        leftPct: Math.round((left / total) * 100),
        rightPct: Math.round((right / total) * 100),
        headerPct: Math.round((header / total) * 100)
      };
    };

    return {
      club: calcStatsForSubset(allClubGoals),
      intl: calcStatsForSubset(allIntGoals)
    };
  }, [allClubGoals, allIntGoals, goals]);

  // 2. Goal Clustering by 5-minute increments
  const clusteringData = useMemo(() => {
    const intervals = Array.from({ length: 18 }, (_, i) => {
      const start = i * 5 + 1;
      const end = (i + 1) * 5;
      return {
        label: `${start}-${end}`,
        start,
        end,
        clubGoals: 0,
        intlGoals: 0,
        total: 0
      };
    });

    // Plus 90+ injury time bucket
    const injuryTime = {
      label: '90+',
      clubGoals: 0,
      intlGoals: 0,
      total: 0
    };

    goals.forEach(g => {
      const { minute, minuteVal, isClub } = g;
      // 45+ injury time is conceptually still first-half: keep it in the 41-45 window
      // so it matches getMinuteBucket('31-45') used by the other tabs.
      if (minute.startsWith('45+')) {
        intervals[8].clubGoals += isClub ? 1 : 0;
        intervals[8].intlGoals += isClub ? 0 : 1;
        intervals[8].total += 1;
      } else if (minute.startsWith('90+') || minuteVal > 90) {
        if (isClub) injuryTime.clubGoals++;
        else injuryTime.intlGoals++;
        injuryTime.total++;
      } else {
        const idx = Math.min(Math.floor((minuteVal - 1) / 5), 17);
        if (idx >= 0 && idx < 18) {
          if (isClub) intervals[idx].clubGoals++;
          else intervals[idx].intlGoals++;
          intervals[idx].total++;
        }
      }
    });

    return [...intervals, injuryTime];
  }, [goals]);

  // 3. Season-over-Season Growth Totals
  const sosData = useMemo(() => {
    const campaignMap: Record<string, { club: number; intl: number; total: number }> = {};
    
    goals.forEach(g => {
      const camp = g.season;
      if (!camp) return;
      if (!campaignMap[camp]) {
        campaignMap[camp] = { club: 0, intl: 0, total: 0 };
      }
      if (g.isClub) campaignMap[camp].club++;
      else campaignMap[camp].intl++;
      campaignMap[camp].total++;
    });

    const sortedCampaigns = Object.keys(campaignMap).sort();
    
    return sortedCampaigns.map((camp, idx) => {
      const current = campaignMap[camp];
      let diff = 0;
      let pctChange = 0;

      if (idx > 0) {
        const prevCamp = sortedCampaigns[idx - 1];
        const prev = campaignMap[prevCamp];
        diff = current.total - prev.total;
        pctChange = prev.total > 0 ? Math.round((diff / prev.total) * 100) : 0;
      }

      return {
        campaign: camp,
        Club: current.club,
        International: current.intl,
        Total: current.total,
        yoyDelta: diff,
        yoyPct: pctChange
      };
    });
  }, [goals]);

  // 4. Top Campaigns and Most Productive Competitions
  const productivityStats = useMemo(() => {
    // Top seasons
    const seasonsMap: Record<string, number> = {};
    // Top comps
    const compsMap: Record<string, number> = {};

    goals.forEach(g => {
      seasonsMap[g.season] = (seasonsMap[g.season] || 0) + 1;
      compsMap[g.competition] = (compsMap[g.competition] || 0) + 1;
    });

    const topSeasons = Object.keys(seasonsMap)
      .map(s => ({ name: s, goals: seasonsMap[s] }))
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 3);

    const topComps = Object.keys(compsMap)
      .map(c => ({ name: c, goals: compsMap[c] }))
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 3);

    return { topSeasons, topComps };
  }, [goals]);

  return (
    <div className="space-y-6">
      {/* Side-by-Side Analytical profiles */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Club Profile */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-white/5 bg-brand-card p-6 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-brand-blue/5 blur-2xl" />
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-brand-blue animate-pulse" />
            Club Career Profile
          </h3>
          <div className="grid grid-cols-2 gap-4 font-mono">
            <div className="bg-brand-bg rounded-lg p-3 border border-white/5">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Average Goal Age</span>
              <span className="text-xl font-extrabold text-white">{profileStats.club.avgAge} years</span>
            </div>
            <div className="bg-brand-bg rounded-lg p-3 border border-white/5">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Assisted Ratio</span>
              <span className="text-xl font-extrabold text-white">{profileStats.club.assistedPct}%</span>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <h4 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Goal Finishing Profiles</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>Left Foot Goals</span>
                <span className="font-bold text-brand-blue">{profileStats.club.leftPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-brand-bg overflow-hidden">
                <div style={{ width: `${profileStats.club.leftPct}%` }} className="h-full bg-brand-blue rounded-full" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>Right Foot Goals</span>
                <span className="font-bold text-brand-gold">{profileStats.club.rightPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-brand-bg overflow-hidden">
                <div style={{ width: `${profileStats.club.rightPct}%` }} className="h-full bg-brand-gold rounded-full" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>Headers</span>
                <span className="font-bold text-white">{profileStats.club.headerPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-brand-bg overflow-hidden">
                <div style={{ width: `${profileStats.club.headerPct}%` }} className="h-full bg-white rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* International Profile */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-white/5 bg-brand-card p-6 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-brand-gold/5 blur-2xl" />
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
            International Career Profile
          </h3>
          <div className="grid grid-cols-2 gap-4 font-mono">
            <div className="bg-brand-bg rounded-lg p-3 border border-white/5">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Average Goal Age</span>
              <span className="text-xl font-extrabold text-white">{profileStats.intl.avgAge} years</span>
            </div>
            <div className="bg-brand-bg rounded-lg p-3 border border-white/5">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Assisted Ratio</span>
              <span className="text-xl font-extrabold text-white">{profileStats.intl.assistedPct}%</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Goal Finishing Profiles</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>Left Foot Goals</span>
                <span className="font-bold text-brand-blue">{profileStats.intl.leftPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-brand-bg overflow-hidden">
                <div style={{ width: `${profileStats.intl.leftPct}%` }} className="h-full bg-brand-blue rounded-full" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>Right Foot Goals</span>
                <span className="font-bold text-brand-gold">{profileStats.intl.rightPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-brand-bg overflow-hidden">
                <div style={{ width: `${profileStats.intl.rightPct}%` }} className="h-full bg-brand-gold rounded-full" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>Headers</span>
                <span className="font-bold text-white">{profileStats.intl.headerPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-brand-bg overflow-hidden">
                <div style={{ width: `${profileStats.intl.headerPct}%` }} className="h-full bg-white rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Goal Clustering (5-minute Increments Heat Bar) */}
      <div className="rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Activity className="h-4 w-4 text-brand-blue" />
            High-Density Goal Clustering (5-Minute Windows)
          </h3>
          <p className="text-2xs text-slate-400 font-mono mt-0.5">Isolating Messi’s career-wide peak goal-scoring periods across 90+ minutes of a football match</p>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clusteringData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
              <XAxis dataKey="label" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1D23', borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                labelStyle={{ color: '#75AADB', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }} />
              <Bar dataKey="clubGoals" name="Club Goals" fill="#75AADB" stackId="a" />
              <Bar dataKey="intlGoals" name="International Goals" fill="#D4AF37" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Season-over-Season Performance & YoY growth delta */}
      <div className="rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingUp className="h-4 w-4 text-brand-gold" />
              Season-over-Season Delta Analysis
            </h3>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">Visualizing yearly aggregate fluctuations and growth deltas</p>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sosData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
              <XAxis dataKey="campaign" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1D23', borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Line type="monotone" dataKey="Club" stroke="#75AADB" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="International" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Total" stroke="#D4AF37" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Productivity Spotlights Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Top campaigns */}
        <div className="rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
          <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 font-mono">
            <Flame className="h-4 w-4 text-brand-gold" />
            Peak Campaigns
          </h4>
          <div className="space-y-3 font-mono">
            {productivityStats.topSeasons.map((s, idx) => (
              <div key={s.name} className="flex items-center justify-between rounded-lg bg-brand-bg p-3 border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold/10 border border-brand-gold/20 text-xs font-bold text-brand-gold">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-white">{s.name} Season</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-extrabold text-brand-gold">{s.goals}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">goals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top competitions */}
        <div className="rounded-xl border border-white/5 bg-brand-card p-5 backdrop-blur-md">
          <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 font-mono">
            <Award className="h-4 w-4 text-brand-blue" />
            Most Productive Arenas
          </h4>
          <div className="space-y-3 font-mono">
            {productivityStats.topComps.map((c, idx) => (
              <div key={c.name} className="flex items-center justify-between rounded-lg bg-brand-bg p-3 border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue/10 border border-brand-blue/20 text-xs font-bold text-brand-blue">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-[180px]">{c.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-extrabold text-brand-blue">{c.goals}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">goals</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

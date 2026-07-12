import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Goal, CareerStats } from '../types';
import { parseGoalsDataset, getCareerMetrics } from '../data/goalsData';

export type DashboardTab = 'overview' | 'club' | 'international' | 'advanced' | 'explorer';

export interface ClubFilters {
  season: string;
  competition: string;
  opponent: string;
  foot: string;
  goalType: string;
}

export interface IntFilters {
  opponent: string;
  competitionType: string;
  foot: string;
  goalType: string;
}

interface DashboardContextType {
  goals: Goal[];
  loading: boolean;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  
  // Global search
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  
  // Cross filters (from clicking charts)
  crossFilter: { field: string; value: string } | null;
  setCrossFilter: (cf: { field: string; value: string } | null) => void;
  clearCrossFilter: () => void;

  // Club Filter State
  clubFilters: ClubFilters;
  setClubFilter: (key: keyof ClubFilters, value: string) => void;
  resetClubFilters: () => void;
  filteredClubGoals: Goal[];
  allClubGoals: Goal[];
  
  // International Filter State
  intFilters: IntFilters;
  setIntFilter: (key: keyof IntFilters, value: string) => void;
  resetIntFilters: () => void;
  filteredIntGoals: Goal[];
  allIntGoals: Goal[];

  // General summaries
  careerStats: CareerStats;
  
  // Export helper
  exportToCSV: (subset: 'all' | 'club' | 'international' | 'filtered') => void;

  // Reset orchestration (clears filters across all tabs)
  resetAllFilters: () => void;
  resetSignal: number;

  // Explorer tab local-filtered goals (lifted so export respects them)
  explorerFilteredGoals: Goal[];
  setExplorerFilteredGoals: (goals: Goal[]) => void;
}

const defaultClubFilters: ClubFilters = {
  season: 'All',
  competition: 'All',
  opponent: 'All',
  foot: 'All',
  goalType: 'All',
};

const defaultIntFilters: IntFilters = {
  opponent: 'All',
  competitionType: 'All',
  foot: 'All',
  goalType: 'All',
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [crossFilter, setCrossFilterState] = useState<{ field: string; value: string } | null>(null);

  // Filter States
  const [clubFilters, setClubFilters] = useState<ClubFilters>(defaultClubFilters);
  const [intFilters, setIntFilters] = useState<IntFilters>(defaultIntFilters);

  // Explorer local-filtered goals, lifted so CSV export can use them
  const [explorerFilteredGoals, setExplorerFilteredGoals] = useState<Goal[]>([]);

  // Signal bumped whenever a global reset is requested (lets local-tab state reset too)
  const [resetSignal, setResetSignal] = useState<number>(0);

  // Load and parse goals on mount
  useEffect(() => {
    try {
      const parsedGoals = parseGoalsDataset();
      setGoals(parsedGoals);
    } catch (err) {
      console.error('Error loading goals dataset:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Base subdivisions
  const allClubGoals = useMemo(() => goals.filter(g => g.isClub), [goals]);
  const allIntGoals = useMemo(() => goals.filter(g => g.isInternational), [goals]);

  // General career metrics on full dataset
  const careerStats = useMemo(() => getCareerMetrics(goals), [goals]);

  // Wrapper for setting cross-filters
  const setCrossFilter = (cf: { field: string; value: string } | null) => {
    setCrossFilterState(cf);
  };

  const clearCrossFilter = () => {
    setCrossFilterState(null);
  };

  // Helper filter function for search
  const matchesSearch = (g: Goal, search: string) => {
    if (!search) return true;
    const lower = search.toLowerCase();
    return (
      g.opponent.toLowerCase().includes(lower) ||
      g.competition.toLowerCase().includes(lower) ||
      g.season.toLowerCase().includes(lower) ||
      g.assistedBy.toLowerCase().includes(lower) ||
      g.clubOrCountry.toLowerCase().includes(lower)
    );
  };

  // Helper filter function for cross filtering
  const matchesCrossFilter = (g: Goal, cf: { field: string; value: string } | null) => {
    if (!cf) return true;
    const { field, value } = cf;
    if (field === 'foot') return g.foot === value;
    if (field === 'goalType') {
      if (value === 'Penalty') return g.goalType.toLowerCase().includes('penalty');
      if (value === 'Direct Free Kick') return g.goalType.toLowerCase().includes('free');
      return !g.goalType.toLowerCase().includes('penalty') && !g.goalType.toLowerCase().includes('free');
    }
    if (field === 'homeAway') return g.homeAway === value;
    if (field === 'season') return g.season === value;
    if (field === 'venue') return g.venue === value;
    if (field === 'competition') return g.competition === value;
    if (field === 'competitionType') return g.competitionType === value;
    if (field === 'opponent') return g.opponent === value;
    return true;
  };

  // Compute filtered Club goals
  const filteredClubGoals = useMemo(() => {
    return allClubGoals.filter(g => {
      // 1. Text filter
      if (!matchesSearch(g, globalSearch)) return false;
      
      // 2. Tab-specific dropdown filters
      if (clubFilters.season !== 'All' && g.season !== clubFilters.season) return false;
      if (clubFilters.competition !== 'All' && g.competition !== clubFilters.competition) return false;
      if (clubFilters.opponent !== 'All' && g.opponent !== clubFilters.opponent) return false;
      if (clubFilters.foot !== 'All' && g.foot !== clubFilters.foot) return false;
      if (clubFilters.goalType !== 'All') {
        const typeLower = g.goalType.toLowerCase();
        if (clubFilters.goalType === 'Penalty' && !typeLower.includes('penalty')) return false;
        if (clubFilters.goalType === 'Direct Free Kick' && !typeLower.includes('free')) return false;
        if (clubFilters.goalType === 'Open Play' && (typeLower.includes('penalty') || typeLower.includes('free'))) return false;
      }

      // 3. Global cross-filter clicked from chart
      if (!matchesCrossFilter(g, crossFilter)) return false;

      return true;
    });
  }, [allClubGoals, clubFilters, globalSearch, crossFilter]);

  // Compute filtered International goals
  const filteredIntGoals = useMemo(() => {
    return allIntGoals.filter(g => {
      // 1. Text filter
      if (!matchesSearch(g, globalSearch)) return false;

      // 2. Tab-specific dropdown filters
      if (intFilters.opponent !== 'All' && g.opponent !== intFilters.opponent) return false;
      if (intFilters.competitionType !== 'All' && g.competitionType !== intFilters.competitionType) return false;
      if (intFilters.foot !== 'All' && g.foot !== intFilters.foot) return false;
      if (intFilters.goalType !== 'All') {
        const typeLower = g.goalType.toLowerCase();
        if (intFilters.goalType === 'Penalty' && !typeLower.includes('penalty')) return false;
        if (intFilters.goalType === 'Direct Free Kick' && !typeLower.includes('free')) return false;
        if (intFilters.goalType === 'Open Play' && (typeLower.includes('penalty') || typeLower.includes('free'))) return false;
      }

      // 3. Global cross-filter clicked from chart
      if (!matchesCrossFilter(g, crossFilter)) return false;

      return true;
    });
  }, [allIntGoals, intFilters, globalSearch, crossFilter]);

  // Set individual filters
  const setClubFilter = (key: keyof ClubFilters, value: string) => {
    setClubFilters(prev => ({ ...prev, [key]: value }));
  };

  const setIntFilter = (key: keyof IntFilters, value: string) => {
    setIntFilters(prev => ({ ...prev, [key]: value }));
  };

  // Reset filters
  const resetClubFilters = () => setClubFilters(defaultClubFilters);
  const resetIntFilters = () => setIntFilters(defaultIntFilters);

  // Orchestrated reset: clears filters across every tab and bumps the reset signal
  const resetAllFilters = () => {
    setClubFilters(defaultClubFilters);
    setIntFilters(defaultIntFilters);
    setGlobalSearch('');
    clearCrossFilter();
    setResetSignal(prev => prev + 1);
  };

  // CSV Exporter for parsed/filtered data subset
  const exportToCSV = (subset: 'all' | 'club' | 'international' | 'filtered') => {
    let dataToExport: Goal[] = [];
    if (subset === 'all') dataToExport = goals;
    else if (subset === 'club') dataToExport = allClubGoals;
    else if (subset === 'international') dataToExport = allIntGoals;
    else {
      // Filtered based on current active tab (respects Explorer-local filters)
      dataToExport = activeTab === 'club'
        ? filteredClubGoals
        : activeTab === 'international'
          ? filteredIntGoals
          : explorerFilteredGoals;
    }

    if (dataToExport.length === 0) return;

    // Build CSV content
    const headers = [
      'Goal Number',
      'Date',
      'Season',
      'Year',
      'Age',
      'Context',
      'Team',
      'Competition',
      'Competition Type',
      'Opponent',
      'Venue',
      'Home/Away',
      'Result',
      'Minute',
      'Goal Type',
      'Foot',
      'Assisted By',
      'Score After Goal'
    ];

    const rows = dataToExport.map(g => [
      g.careerGoalNumber,
      g.date,
      g.season,
      g.year,
      g.ageAtGoal,
      g.context,
      g.clubOrCountry,
      g.competition,
      g.competitionType,
      g.opponent,
      g.venue,
      g.homeAway,
      g.result,
      g.minute,
      g.goalType,
      g.foot,
      g.assistedBy,
      g.scoreAtGoal
    ]);

    const csvContent =
      [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `messi_goals_${subset}_export.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardContext.Provider
      value={{
        goals,
        loading,
        activeTab,
        setActiveTab,
        globalSearch,
        setGlobalSearch,
        crossFilter,
        setCrossFilter,
        clearCrossFilter,
        clubFilters,
        setClubFilter,
        resetClubFilters,
        filteredClubGoals,
        allClubGoals,
        intFilters,
        setIntFilter,
        resetIntFilters,
        filteredIntGoals,
        allIntGoals,
        careerStats,
        exportToCSV,
        resetAllFilters,
        resetSignal,
        explorerFilteredGoals,
        setExplorerFilteredGoals,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

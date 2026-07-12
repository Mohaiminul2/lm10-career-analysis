/**
 * Lionel Messi Career Goals - Types & Interfaces
 */

export interface RawGoalRow {
  goal_id: string;
  career_goal_number: string;
  date: string;
  season: string;
  year: string;
  month: string;
  month_name: string;
  day_of_week: string;
  age_at_goal: string;
  context: string;
  club_or_country: string;
  competition: string;
  competition_type: string;
  competition_group: string;
  era: string;
  opponent: string;
  venue: string;
  home_away: string;
  result: string;
  minute: string;
  minute_bucket: string;
  goal_type: string;
  foot: string;
  assisted_by: string;
  score_at_goal: string;
}

export interface Goal {
  goalId: number;
  careerGoalNumber: number;
  date: string; // YYYY-MM-DD
  season: string; // e.g. "2004/05"
  year: number;
  month: number;
  monthName: string;
  dayOfWeek: string;
  ageAtGoal: number;
  context: 'Club' | 'International';
  clubOrCountry: string; // e.g. "FC Barcelona", "Paris Saint-Germain", "Argentina"
  competition: string;
  competitionType: string;
  competitionGroup: string;
  era: string;
  opponent: string;
  venue: 'H' | 'A' | 'N';
  homeAway: 'Home' | 'Away' | 'Neutral';
  result: string; // Format e.g. "2-0" rather than "2:00"
  minute: string; // e.g. "90+1", "34"
  minuteVal: number; // e.g. 91, 34
  minuteBucket: string; // "0-15", "16-30", "31-45", "46-60", "61-75", "76-90", "90+"
  goalType: string; // "Open Play", "Penalty", "Direct Free Kick", etc.
  foot: 'Left' | 'Right' | 'Header';
  assistedBy: string; // Name of player or "Unassisted"
  isAssisted: boolean;
  scoreAtGoal: string; // Score after the goal e.g. "1-0"
  isClub: boolean;
  isInternational: boolean;
}

// Interfaces for structured dashboard analytical summaries
export interface CareerStats {
  totalGoals: number;
  clubGoals: number;
  internationalGoals: number;
  unassistedGoals: number;
  assistedGoals: number;
  leftFootGoals: number;
  rightFootGoals: number;
  headerGoals: number;
  penaltyGoals: number;
  freeKickGoals: number;
  openPlayGoals: number;
  homeGoals: number;
  awayGoals: number;
  neutralGoals: number;
}

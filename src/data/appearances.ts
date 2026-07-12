/**
 * Lionel Messi Historical Appearances (for calculating accurate Goals-per-90 Rates)
 */

export interface AppearanceData {
  seasonOrYear: string;
  appearances: number;
}

// Club appearances by season (including Barcelona, PSG, and Inter Miami periods)
export const clubAppearances: Record<string, number> = {
  '2004/05': 9,
  '2005/06': 25,
  '2006/07': 36,
  '2007/08': 40,
  '2008/09': 51,
  '2009/10': 53,
  '2010/11': 55,
  '2011/12': 60,
  '2012/13': 50,
  '2013/14': 46,
  '2014/15': 57,
  '2015/16': 49,
  '2016/17': 52,
  '2017/18': 54,
  '2018/19': 50,
  '2019/20': 44,
  '2020/21': 47,
  '2021/22': 34,
  '2022/23': 41,
  '2023/24': 35,
  '2024/25': 28,
  '2025/26': 12,
};

// International appearances by calendar year for Argentina
export const internationalAppearances: Record<number, number> = {
  2005: 5,
  2006: 7,
  2007: 14,
  2008: 8,
  2009: 10,
  2010: 10,
  2011: 13,
  2012: 9,
  2013: 7,
  2014: 14,
  2015: 8,
  2016: 11,
  2017: 7,
  2018: 5,
  2019: 10,
  2020: 4,
  2021: 16,
  2022: 14,
  2023: 8,
  2024: 11,
  2025: 10,
};

/**
 * Calculates the goals-per-90 rates given goals count and appearance data
 */
export function calculateScoringRate(goals: number, appearances: number): {
  perGame: number;
  per90: number;
} {
  if (!appearances || appearances === 0) {
    return { perGame: 0, per90: 0 };
  }
  const perGame = goals / appearances;
  // Estimate average minutes per match is 85 minutes (since Messi was occasionally substituted or subbed on early career)
  const estimatedMinutes = appearances * 85;
  const per90 = (goals / estimatedMinutes) * 90;
  return {
    perGame: Math.round(perGame * 100) / 100,
    per90: Math.round(per90 * 100) / 100,
  };
}

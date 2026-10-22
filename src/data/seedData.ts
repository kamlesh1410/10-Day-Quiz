import { IndividualLeaderboardEntry, GroupLeaderboardEntry } from '../types';

export const TEAMS: string[] = [
  'Railway Champions',
  'Metro Riders',
  'Track Masters',
  'Express Line',
  'High-Speed Flyers',
  'Signal Pioneers',
  'Velocity Transit',
  'Depot Dynamos',
  'Rail Pilots',
  'Rapid Transit Titans',
];

// Start with empty registered staff roster - real staff will populate upon registration
export const INITIAL_DRIVERS: IndividualLeaderboardEntry[] = [];

/**
 * Sorts individuals with Tie-Breaker Rule:
 * 1. totalPoints DESCENDING
 * 2. totalTimeSeconds ASCENDING (faster time wins the tie!)
 */
export function sortIndividualsWithTieBreaker(list: IndividualLeaderboardEntry[]): IndividualLeaderboardEntry[] {
  const sorted = [...list].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    // Tie-breaker: less time ranks higher!
    return a.totalTimeSeconds - b.totalTimeSeconds;
  });

  sorted.forEach((item, index) => {
    item.rank = index + 1;
  });

  return sorted;
}

export function computeGroupLeaderboard(individuals: IndividualLeaderboardEntry[]): GroupLeaderboardEntry[] {
  const map: Record<string, GroupLeaderboardEntry> = {};

  TEAMS.forEach((team) => {
    map[team] = {
      rank: 0,
      teamName: team,
      aggregatePoints: 0,
      aggregateTimeSeconds: 0,
      memberCount: 0,
      members: [],
    };
  });

  individuals.forEach((ind) => {
    if (!map[ind.groupName]) {
      map[ind.groupName] = {
        rank: 0,
        teamName: ind.groupName,
        aggregatePoints: 0,
        aggregateTimeSeconds: 0,
        memberCount: 0,
        members: [],
      };
    }
    map[ind.groupName].aggregatePoints += ind.totalPoints;
    map[ind.groupName].aggregateTimeSeconds += ind.totalTimeSeconds;
    map[ind.groupName].memberCount += 1;
    map[ind.groupName].members.push({
      name: ind.staffName,
      points: ind.totalPoints,
      timeSeconds: ind.totalTimeSeconds,
    });
  });

  // Sort groups: primary aggregatePoints DESC, tie-breaker aggregateTimeSeconds ASC
  const sorted = Object.values(map).sort((a, b) => {
    if (b.aggregatePoints !== a.aggregatePoints) {
      return b.aggregatePoints - a.aggregatePoints;
    }
    return a.aggregateTimeSeconds - b.aggregateTimeSeconds;
  });

  sorted.forEach((grp, idx) => {
    grp.rank = idx + 1;
    grp.members.sort((a, b) => b.points - a.points);
  });

  return sorted;
}

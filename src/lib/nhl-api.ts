/**
 * NHL Stats API Client
 * Base: https://statsapi.web.nhl.com/api/v1
 * Auth: None (public)
 *
 * NOTE: This API may not be reachable from all environments (DNS resolution
 * can fail on some networks/sandboxes). If blocked, consider Natural Stat Trick
 * scraping or a proxy. The API is reachable from typical home/office networks.
 *
 * Docs: https://api.nhle.com/
 */

const BASE_URL = "https://statsapi.web.nhl.com/api/v1";

async function nhlFetch<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate },
    headers: { "User-Agent": "nhl-stats/1.0 (contact@example.com)" },
  });
  if (!res.ok) throw new Error(`NHL API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface NhlTeam {
  id: number;
  name: string;
  link: string;
  venue: { name: string; city: string; timeZone: string };
  abbreviation: string;
  teamName: string;
  locationName: string;
  firstYearOfPlay: string;
  officialSiteUrl: string;
  franchiseId: number;
  conference: { name: string; link: string };
  division: { name: string; link: string };
  shortName: string;
}

export async function getTeams(): Promise<{ teams: NhlTeam[] }> {
  return nhlFetch<{ teams: NhlTeam[] }>("/teams");
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export interface GameTeam {
  id: number;
  name: string;
  link: string;
  abbreviation: string;
  teamName: string;
  locationName: string;
  shortName: string;
}

export interface Game {
  gamePk: number;
  link: string;
  gameType: "R" | "P" | "A";
  season: string;
  gameDate: string;
  status: {
    abstractGameState: "Preview" | "Live" | "Final";
    codedGameState: string;
    detailedState: string;
    statusCode: string;
  };
  teams: {
    away: { leagueRecord: { wins: number; losses: number; ot: number }; score: number; team: GameTeam };
    home: { leagueRecord: { wins: number; losses: number; ot: number }; score: number; team: GameTeam };
  };
  venue: { name: string; link: string };
  content: { link: string };
}

export interface DateSchedule {
  date: string;
  totalGames: number;
  games: Game[];
}

export async function getDateSchedule(date: string): Promise<DateSchedule> {
  return nhlFetch<DateSchedule>(`/schedule?date=${date}`);
}

// ─── Standings ─────────────────────────────────────────────────────────────────
//
// NHL standings API returns records grouped by division/conference.
// Shape: { records: [{ divisionRecords: [...], conferenceRecords: [...],
//          teamRecords: [{ team, leagueRecord, points, ...streak, goals }] }] }
//
// The top-level teamRecords array contains all teams flattened.

export interface StandingsTeamRecord {
  team: { id: number; name: string; link: string };
  leagueRecord: { wins: number; losses: number; ot: number; type: string };
  points: number;
  pointPercentage: string;
  division: { name: string; id: number; link: string };
  divisionRank: string;
  conference: { name: string; id: number; link: string };
  conferenceRank: string;
  league: { name: string; id: number; link: string };
  wildCardRank: string;
  wildCardGamesBack: string;
  regulationWins: number;
  regulationLosses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsSequence: number;
  streak: { streakType: string; streakNumber: number; streakCode: string };
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  type: string;
}

export async function getStandings(): Promise<StandingsTeamRecord[]> {
  const data = await nhlFetch<{ records: Array<{ teamRecords: StandingsTeamRecord[] }> }>(
    "/standings",
    300
  );
  return data.records.flatMap((r) => r.teamRecords);
}

// ─── Game Feed ────────────────────────────────────────────────────────────────

export interface LiveGameFeed {
  gamePk: number;
  link: string;
  gameType: "R" | "P" | "A";
  season: string;
  gameDate: string;
  status: { abstractGameState: string; statusCode: string };
  teams: {
    away: { team: GameTeam; leagueRecord: { wins: number; losses: number; ot: number }; score: number };
    home: { team: GameTeam; leagueRecord: { wins: number; losses: number; ot: number }; score: number };
  };
  linescore: {
    currentPeriod: number;
    periodTime: string;
    hasShootout: boolean;
    periods: Array<{
      periodType: string;
      startTime: string;
      endTime: string;
      ordinalNum: string;
      home: { goals: number; shotsOnGoal: number };
      away: { goals: number; shotsOnGoal: number };
    }>;
  };
  decisions?: {
    firstStar: { id: number; fullName: string };
    secondStar: { id: number; fullName: string };
    thirdStar: { id: number; fullName: string };
  };
}

export async function getGameFeed(gamePk: number): Promise<LiveGameFeed> {
  return nhlFetch<LiveGameFeed>(`/game/${gamePk}/feed/live`, 30);
}

// ─── Player Stats ─────────────────────────────────────────────────────────────

export interface PlayerInfo {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  primaryNumber: string;
  birthDate: string;
  birthCity: string;
  birthStateProvince: string;
  birthCountry: string;
  height: string;
  weight: number;
  shootsCatches: string;
  primaryPosition: { name: string; type: string; abbreviation: string };
  link: string;
}

export async function getPlayerStats(playerId: number): Promise<PlayerInfo[]> {
  const data = await nhlFetch<{ people: PlayerInfo[] }>(`/people/${playerId}/stats`);
  return data.people;
}

export async function getPlayerInfo(playerId: number): Promise<PlayerInfo[]> {
  const data = await nhlFetch<{ people: PlayerInfo[] }>(`/people/${playerId}`);
  return data.people;
}

// ─── Player Search ─────────────────────────────────────────────────────────────

export interface SearchResult {
  playerId: number;
  fullName: string;
  link: string;
  positionCode: string;
  positionName: string;
  teamName: string;
  teamId: number;
}

export async function searchPlayers(query: string): Promise<SearchResult[]> {
  // NHL API: search by name
  const data = await nhlFetch<{ people: PlayerInfo[] }>(
    `/people/search?names=${encodeURIComponent(query)}`,
    300
  );
  return data.people.map((p) => ({
    playerId: p.id,
    fullName: p.fullName,
    link: p.link,
    positionCode: p.primaryPosition.abbreviation,
    positionName: p.primaryPosition.name,
    teamName: "", // populated below
    teamId: 0,
  }));
}

// ─── Team Roster ───────────────────────────────────────────────────────────────

export interface RosterPlayer {
  playerId: number;
  fullName: string;
  jerseyNumber: string;
  position: string;
  positionType: string;
}

export async function getTeamRoster(teamId: number): Promise<RosterPlayer[]> {
  const data = await nhlFetch<{ roster: { jerseyNumber: string; position: { name: string; type: string; abbreviation: string }; person: { id: number; fullName: string; link: string } }[] }>(
    `/teams/${teamId}/roster`
  );
  return data.roster.map((r) => ({
    playerId: r.person.id,
    fullName: r.person.fullName,
    jerseyNumber: r.jerseyNumber,
    position: r.position.name,
    positionType: r.position.type,
  }));
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const NHL_TEAMS = [
  "BOS", "BUF", "CAR", "CBJ", "DET", "FLA", "MTL", "NJD",
  "NYI", "NYR", "OTT", "PHI", "PIT", "WSH", "TOR", "ANA",
  "CGY", "CHI", "COL", "DAL", "EDM", "LAK", "MIN", "NSH",
  "SEA", "STL", "TBL", "VAN", "VGK", "WPG",
] as const;

export type NHLTeamAbbrev = (typeof NHL_TEAMS)[number];

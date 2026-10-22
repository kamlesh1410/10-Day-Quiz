import { UserProfile, Question, LeaderboardData, IndividualLeaderboardEntry } from '../types';
import { TEAMS, computeGroupLeaderboard, sortIndividualsWithTieBreaker } from '../data/seedData';
import { getRandomDailyQuestions } from '../data/questionBank';
import { CentralTimeService } from './centralTimeService';

// Hardcoded Google Sheet IDs specified by the user
export const HARDCODED_SHEET_IDS = {
  USER_SCORES_DB: '1Wa7g6PVvPrUgHFZSLEOm3ChVEKnKDF9Qqc8V4Nrm5V4',
  GEN_QUIZ: '1H6K9jTBY6pSBt9EBjUVaTIjGifQMmqxlA9GWpCXtWqA',
};

const STORAGE_KEYS = {
  CURRENT_USER: 'quiz_challenge_current_user',
  ALL_DRIVERS: 'quiz_challenge_all_staff',
  GAS_WEB_APP_URL: 'quiz_challenge_gas_web_app_url',
  USER_PROFILES_MAP: 'quiz_challenge_user_profiles_map',
};

// Hardcoded default Apps Script Web App URL (if deployed by user for Vercel/global builds)
export const DEFAULT_GAS_WEB_APP_URL = '';

export class ApiService {
  public static getHardcodedSheetIds() {
    return HARDCODED_SHEET_IDS;
  }

  /**
   * Retrieves active Google Apps Script Web App URL.
   * Priority:
   * 1. localStorage (if admin configured it in the UI)
   * 2. VITE_GAS_URL environment variable (from Vercel build settings)
   * 3. DEFAULT_GAS_WEB_APP_URL constant (bundled in source)
   */
  public static getGasUrl(): string {
    const envUrl = (import.meta as any).env?.VITE_GAS_URL || '';
    const stored = localStorage.getItem(STORAGE_KEYS.GAS_WEB_APP_URL) || '';
    return (stored || envUrl || DEFAULT_GAS_WEB_APP_URL).trim();
  }

  public static isCloudConnected(): boolean {
    return Boolean(this.getGasUrl());
  }

  public static setGasUrl(url: string): void {
    if (url) {
      localStorage.setItem(STORAGE_KEYS.GAS_WEB_APP_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.GAS_WEB_APP_URL);
    }
  }

  public static getStoredGasUrl(): string {
    return this.getGasUrl();
  }

  /**
   * Universal CORS-safe HTTP POST helper for Google Apps Script Web App.
   * Google Apps Script rejects OPTIONS preflight requests.
   * Using text/plain prevents the preflight, and redirect: 'follow' allows
   * following Google's mandatory 302 redirect to script.googleusercontent.com.
   */
  public static async sendGasRequest(action: string, payload: Record<string, any>): Promise<any> {
    const gasUrl = this.getGasUrl();
    if (!gasUrl) {
      throw new Error('NO_GAS_URL_CONFIGURED');
    }

    const response = await fetch(gasUrl, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action,
        ...payload,
        sheetId: HARDCODED_SHEET_IDS.USER_SCORES_DB,
      }),
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return { status: 'success', raw: text };
    }
  }

  public static async pingGasBackend(customUrl?: string): Promise<{ success: boolean; message: string; timestamp?: string }> {
    const url = customUrl || this.getGasUrl();
    if (!url) {
      return {
        success: false,
        message: 'No Google Apps Script Web App URL provided. App is running in Local Storage mode.',
      };
    }

    try {
      const pingUrl = `${url}${url.includes('?') ? '&' : '?'}action=ping`;
      const response = await fetch(pingUrl, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { status: 'success', message: text };
      }

      return {
        success: data.status === 'success' || response.ok,
        message: data.message || 'Connected successfully to Google Apps Script & Google Sheets!',
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Connection failed: ${err.message || 'Network error or CORS issue.'}`,
      };
    }
  }

  // Retrieve current user from localStorage
  public static getCurrentUser(): UserProfile | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      const u = JSON.parse(raw);
      if (u) {
        const staffId = String(u.staffId ?? '');
        const savedDate = localStorage.getItem(`quiz_completed_date_${staffId.toUpperCase()}`) || u.lastCompletedDate;
        return {
          ...u,
          staffId,
          staffName: String(u.staffName ?? ''),
          avatarId: String(u.avatarId || 'kahoot_1'),
          groupName: String(u.groupName || 'Railway Champions'),
          scores: u.scores || {},
          dayTimes: u.dayTimes || {},
          totalPoints: Number(u.totalPoints || 0),
          totalTimeSeconds: Number(u.totalTimeSeconds || 0),
          lastCompletedDay: Number(u.lastCompletedDay || 0),
          lastCompletedDate: savedDate,
        } as UserProfile;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  public static saveCurrentUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    if (user.staffId && user.lastCompletedDate) {
      localStorage.setItem(`quiz_completed_date_${user.staffId.toUpperCase()}`, user.lastCompletedDate);
    }
    this.saveUserProfileToMap(user);
  }

  public static clearCurrentUser(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // Profile map for preserving scores across sessions
  public static getUserProfilesMap(): Record<string, UserProfile> {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILES_MAP);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }

  public static saveUserProfileToMap(profile: UserProfile): void {
    const map = this.getUserProfilesMap();
    map[String(profile.staffId).toUpperCase()] = profile;
    localStorage.setItem(STORAGE_KEYS.USER_PROFILES_MAP, JSON.stringify(map));
  }

  // Get all local staff roster cache
  public static getLocalDrivers(): IndividualLeaderboardEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_DRIVERS);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const hasOldMock = parsed.some((d: any) => d.staffName === 'Alex Mercer' || String(d.staffId) === 'DRV-1001');
          if (hasOldMock) {
            localStorage.removeItem(STORAGE_KEYS.ALL_DRIVERS);
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            return [];
          }
          const sanitized = parsed.map((d: any) => ({
            ...d,
            staffId: String(d?.staffId ?? ''),
            staffName: String(d?.staffName ?? ''),
            avatarId: String(d?.avatarId || 'kahoot_1'),
            groupName: String(d?.groupName || 'Railway Champions'),
            totalPoints: Number(d?.totalPoints || 0),
            totalTimeSeconds: Number(d?.totalTimeSeconds || 0),
            lastCompletedDay: Number(d?.lastCompletedDay || 0),
          }));
          return sortIndividualsWithTieBreaker(sanitized);
        }
      } catch (e) {
        // fallback
      }
    }
    return [];
  }

  public static saveLocalDrivers(drivers: IndividualLeaderboardEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.ALL_DRIVERS, JSON.stringify(drivers));
  }

  // 1-Click Initialize / Clear Sheet (User_Scores_DB) for Admin
  public static async initializeDatabaseSheet(): Promise<{ success: boolean; message: string }> {
    // 1. Wipe local cache
    localStorage.removeItem(STORAGE_KEYS.ALL_DRIVERS);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILES_MAP);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);

    // Clean any completed date keys
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('quiz_completed_date_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      // ignore
    }

    // 2. Call Google Apps Script if URL is configured
    if (this.isCloudConnected()) {
      try {
        const resJson = await this.sendGasRequest('initializeSheet', {});
        return {
          success: true,
          message: resJson.message || 'Google Sheet User_Scores_DB & local storage initialized successfully with clean headers!',
        };
      } catch (e: any) {
        return {
          success: true,
          message: `Local database initialized (0 staff). Note: Google Sheet call returned: ${e.message}. Ensure Apps Script Web App is deployed with Access: Anyone.`,
        };
      }
    }

    return {
      success: true,
      message: 'Local database initialized with 0 staff. To also wipe Google Sheet, connect your Google Apps Script Web App URL in Admin Tab.',
    };
  }

  // Delete a specific staff member
  public static async deleteStaffMember(staffId: string): Promise<LeaderboardData> {
    const normalizedStaffId = staffId.trim().toUpperCase();

    // 1. Remove from local drivers
    const drivers = this.getLocalDrivers().filter((d) => d.staffId.toUpperCase() !== normalizedStaffId);
    const sorted = sortIndividualsWithTieBreaker(drivers);
    this.saveLocalDrivers(sorted);

    // 2. Remove from user profiles map
    const profiles = this.getUserProfilesMap();
    delete profiles[normalizedStaffId];
    localStorage.setItem(STORAGE_KEYS.USER_PROFILES_MAP, JSON.stringify(profiles));

    // 3. If current user is this staff, clear current user
    const current = this.getCurrentUser();
    if (current && current.staffId.toUpperCase() === normalizedStaffId) {
      this.clearCurrentUser();
    }
    localStorage.removeItem(`quiz_completed_date_${normalizedStaffId}`);

    // 4. If GAS is connected, call deleteUser
    if (this.isCloudConnected()) {
      try {
        await this.sendGasRequest('deleteUser', { staffId: normalizedStaffId });
      } catch (e) {
        // ignore
      }
    }

    return await this.getLeaderboardData();
  }

  // Register staff member
  public static async registerUser(staffId: string, staffName: string, avatarId: string): Promise<UserProfile> {
    const trimmedId = staffId.trim().toUpperCase();
    const trimmedName = staffName.trim();

    // 1. Try Google Apps Script if URL is configured
    if (this.isCloudConnected()) {
      try {
        const json = await this.sendGasRequest('registerUser', {
          staffId: trimmedId,
          staffName: trimmedName,
          avatarId,
        });

        if (json.status === 'success' && json.user) {
          const userProfile: UserProfile = {
            staffId: String(json.user.staffId ?? trimmedId),
            staffName: String(json.user.staffName ?? trimmedName),
            avatarId: String(json.user.avatarId || avatarId),
            groupName: String(json.user.groupName || 'Railway Champions'),
            scores: json.user.scores || {},
            dayTimes: json.user.dayTimes || {},
            totalPoints: Number(json.user.totalPoints || 0),
            totalTimeSeconds: Number(json.user.totalTimeSeconds || 0),
            lastCompletedDay: Number(json.user.lastCompletedDay || 0),
            lastCompletedDate: localStorage.getItem(`quiz_completed_date_${trimmedId}`) || undefined,
          };
          this.saveCurrentUser(userProfile);
          this.syncLocalDriver(userProfile);
          return userProfile;
        }
      } catch (e) {
        console.warn('GAS registration failed, falling back to local storage engine:', e);
      }
    }

    // 2. Local balanced registration
    const drivers = this.getLocalDrivers();
    const existingIndex = drivers.findIndex((d) => String(d.staffId).toUpperCase() === trimmedId);

    if (existingIndex >= 0) {
      const existing = drivers[existingIndex];
      const profilesMap = this.getUserProfilesMap();
      const cached = profilesMap[trimmedId];
      const savedDate = localStorage.getItem(`quiz_completed_date_${trimmedId}`) || cached?.lastCompletedDate || existing.lastCompletedDate;
      const userProfile: UserProfile = {
        staffId: String(existing.staffId),
        staffName: trimmedName || existing.staffName,
        avatarId: avatarId || existing.avatarId,
        groupName: existing.groupName,
        scores: cached?.scores || {},
        dayTimes: cached?.dayTimes || {},
        totalPoints: existing.totalPoints,
        totalTimeSeconds: existing.totalTimeSeconds || 0,
        lastCompletedDay: existing.lastCompletedDay,
        lastCompletedDate: savedDate,
      };
      this.saveCurrentUser(userProfile);
      return userProfile;
    }

    // Balance across 10 railway teams (5 staff per team)
    const counts: Record<string, number> = {};
    TEAMS.forEach((t) => (counts[t] = 0));
    drivers.forEach((d) => {
      if (counts[d.groupName] !== undefined) counts[d.groupName]++;
    });

    let minCount = Infinity;
    let candidateTeams: string[] = [];
    TEAMS.forEach((t) => {
      if (counts[t] < minCount) {
        minCount = counts[t];
        candidateTeams = [t];
      } else if (counts[t] === minCount) {
        candidateTeams.push(t);
      }
    });

    const assignedGroup = candidateTeams[Math.floor(Math.random() * candidateTeams.length)] || 'Railway Champions';

    const newUserEntry: IndividualLeaderboardEntry = {
      rank: drivers.length + 1,
      staffId: trimmedId,
      staffName: trimmedName,
      avatarId,
      groupName: assignedGroup,
      totalPoints: 0,
      totalTimeSeconds: 0,
      lastCompletedDay: 0,
    };

    drivers.push(newUserEntry);
    const sorted = sortIndividualsWithTieBreaker(drivers);
    this.saveLocalDrivers(sorted);

    const userProfile: UserProfile = {
      staffId: trimmedId,
      staffName: trimmedName,
      avatarId,
      groupName: assignedGroup,
      scores: {},
      dayTimes: {},
      totalPoints: 0,
      totalTimeSeconds: 0,
      lastCompletedDay: 0,
    };

    this.saveCurrentUser(userProfile);
    return userProfile;
  }

  // Sign in existing registered staff member
  public static async loginUser(staffId: string): Promise<UserProfile> {
    const trimmedId = staffId.trim().toUpperCase();
    if (!trimmedId) {
      throw new Error('Please enter your Staff ID to sign in.');
    }

    // First, sync live leaderboard from sheet if available
    await this.getLeaderboardData();

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      try {
        const response = await fetch(
          `${gasUrl}${gasUrl.includes('?') ? '&' : '?'}action=getUser&staffId=${encodeURIComponent(trimmedId)}&sheetId=${HARDCODED_SHEET_IDS.USER_SCORES_DB}`,
          { mode: 'cors', redirect: 'follow' }
        );
        const json = await response.json();
        if (json.status === 'success' && json.user) {
          const savedDate = localStorage.getItem(`quiz_completed_date_${trimmedId}`) || undefined;
          const userProfile: UserProfile = {
            staffId: String(json.user.staffId ?? trimmedId),
            staffName: String(json.user.staffName ?? ''),
            avatarId: String(json.user.avatarId || 'kahoot_1'),
            groupName: String(json.user.groupName || 'Railway Champions'),
            scores: json.user.scores || {},
            dayTimes: json.user.dayTimes || {},
            totalPoints: Number(json.user.totalPoints || 0),
            totalTimeSeconds: Number(json.user.totalTimeSeconds || 0),
            lastCompletedDay: Number(json.user.lastCompletedDay || 0),
            lastCompletedDate: savedDate,
          };
          this.saveCurrentUser(userProfile);
          this.syncLocalDriver(userProfile);
          return userProfile;
        }
      } catch (e) {
        console.warn('GAS user lookup failed, falling back to local roster:', e);
      }
    }

    // Local roster / cached map lookup
    const profilesMap = this.getUserProfilesMap();
    const cachedProfile = profilesMap[trimmedId];
    const drivers = this.getLocalDrivers();
    const existing = drivers.find((d) => String(d.staffId).toUpperCase() === trimmedId);

    if (existing || cachedProfile) {
      const savedDate = localStorage.getItem(`quiz_completed_date_${trimmedId}`) || cachedProfile?.lastCompletedDate || existing?.lastCompletedDate;
      const userProfile: UserProfile = {
        staffId: trimmedId,
        staffName: cachedProfile?.staffName || existing?.staffName || 'Staff Member',
        avatarId: cachedProfile?.avatarId || existing?.avatarId || 'kahoot_1',
        groupName: cachedProfile?.groupName || existing?.groupName || 'Railway Champions',
        scores: cachedProfile?.scores || {},
        dayTimes: cachedProfile?.dayTimes || {},
        totalPoints: existing ? existing.totalPoints : (cachedProfile?.totalPoints || 0),
        totalTimeSeconds: existing ? existing.totalTimeSeconds : (cachedProfile?.totalTimeSeconds || 0),
        lastCompletedDay: existing ? existing.lastCompletedDay : (cachedProfile?.lastCompletedDay || 0),
        lastCompletedDate: savedDate,
      };
      this.saveCurrentUser(userProfile);
      return userProfile;
    }

    throw new Error(
      `Staff ID "${trimmedId}" was not found in the registered roster. Please check your ID or click "New Registration" to register.`
    );
  }

  // Fetch questions for active day directly from Google Sheets GEN_QUIZ or fallback
  public static async getDailyQuestions(day: number): Promise<Question[]> {
    const gasUrl = this.getGasUrl();

    // 1. Try Google Apps Script if URL provided
    if (gasUrl) {
      try {
        const url = `${gasUrl}${gasUrl.includes('?') ? '&' : '?'}action=getDailyQuestions&day=${day}&sheetId=${HARDCODED_SHEET_IDS.GEN_QUIZ}`;
        const res = await fetch(url, { mode: 'cors', redirect: 'follow' });
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.questions) && data.questions.length >= 5) {
          return data.questions.slice(0, 5);
        }
      } catch (e) {
        console.warn('Failed to fetch questions from GAS:', e);
      }
    }

    // 2. Direct Google Visualization API (GViz) from public GEN_QUIZ spreadsheet
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${HARDCODED_SHEET_IDS.GEN_QUIZ}/gviz/tq?tqx=out:json&sheet=Day${day}`;
      const res = await fetch(gvizUrl);
      if (res.ok) {
        const text = await res.text();
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
        if (jsonMatch && jsonMatch[1]) {
          const gvizData = JSON.parse(jsonMatch[1]);
          const rows = gvizData.table?.rows;
          if (rows && rows.length >= 1) {
            const parsedQuestions: Question[] = [];
            rows.forEach((r: any, idx: number) => {
              const c = r.c;
              if (c && c[0] && c[0].v) {
                const questionText = String(c[0].v).trim();
                const optA = c[1] && c[1].v !== null ? String(c[1].v).trim() : '';
                const optB = c[2] && c[2].v !== null ? String(c[2].v).trim() : '';
                const optC = c[3] && c[3].v !== null ? String(c[3].v).trim() : '';
                const optD = c[4] && c[4].v !== null ? String(c[4].v).trim() : '';
                const correct = c[5] && c[5].v !== null ? String(c[5].v).trim() : optA;
                if (questionText && optA && optB && !questionText.includes('What is the capital of France? 2.')) {
                  parsedQuestions.push({
                    id: `sheet_d${day}_q${idx}`,
                    question: questionText,
                    options: [optA, optB, optC, optD],
                    correctAnswer: correct,
                  });
                }
              }
            });
            if (parsedQuestions.length >= 5) {
              const shuffled = [...parsedQuestions].sort(() => Math.random() - 0.5);
              return shuffled.slice(0, 5);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed direct Google Sheets question fetch, using local question bank:', e);
    }

    // 3. Fallback to comprehensive built-in Question Bank
    return getRandomDailyQuestions(day);
  }

  // Submit quiz score with speed timer and strict 1-day lock anchored to Central Time
  public static async submitDailyScore(
    staffId: string,
    day: number,
    score: number,
    correctCount: number,
    timeTakenSeconds: number
  ): Promise<{ totalPoints: number; totalTimeSeconds: number; leaderboard: LeaderboardData }> {
    const normalizedStaffId = String(staffId).toUpperCase();
    const centralTodayStr = CentralTimeService.getCentralDateString();

    // Store today's central date so user cannot retake another quiz today
    localStorage.setItem(`quiz_completed_date_${normalizedStaffId}`, centralTodayStr);

    // Update local driver entry
    const drivers = this.getLocalDrivers();
    const driverIdx = drivers.findIndex((d) => String(d.staffId).toUpperCase() === normalizedStaffId);
    let updatedTotal = score;
    let updatedTime = timeTakenSeconds;

    if (driverIdx >= 0) {
      drivers[driverIdx].totalPoints += score;
      drivers[driverIdx].totalTimeSeconds = (drivers[driverIdx].totalTimeSeconds || 0) + timeTakenSeconds;
      if (day > drivers[driverIdx].lastCompletedDay) {
        drivers[driverIdx].lastCompletedDay = day;
      }
      drivers[driverIdx].lastCompletedDate = centralTodayStr;
      updatedTotal = drivers[driverIdx].totalPoints;
      updatedTime = drivers[driverIdx].totalTimeSeconds;
      const sorted = sortIndividualsWithTieBreaker(drivers);
      this.saveLocalDrivers(sorted);
    }

    // Update current user
    const currentUser = this.getCurrentUser();
    if (currentUser && String(currentUser.staffId).toUpperCase() === normalizedStaffId) {
      currentUser.scores[`Day${day}`] = score;
      if (!currentUser.dayTimes) currentUser.dayTimes = {};
      currentUser.dayTimes[`Day${day}`] = timeTakenSeconds;
      currentUser.totalPoints = updatedTotal;
      currentUser.totalTimeSeconds = updatedTime;
      currentUser.lastCompletedDay = Math.max(currentUser.lastCompletedDay, day);
      currentUser.lastCompletedDate = centralTodayStr;
      this.saveCurrentUser(currentUser);
      this.saveUserProfileToMap(currentUser);
    }

    // Post to Google Apps Script if connected
    if (this.isCloudConnected()) {
      try {
        await this.sendGasRequest('submitQuizScore', {
          staffId: normalizedStaffId,
          day,
          score,
          correctCount,
          timeTakenSeconds,
        });
      } catch (e) {
        console.warn('Failed to submit score to GAS backend (saved locally):', e);
      }
    }

    const leaderboard = await this.getLeaderboardData();
    return { totalPoints: updatedTotal, totalTimeSeconds: updatedTime, leaderboard };
  }

  // Fetch Leaderboard Data with direct Google Sheets sync + Tie-Breaker
  public static async getLeaderboardData(): Promise<LeaderboardData> {
    // 1. Direct Google Sheets GViz query on public User_Scores_DB spreadsheet
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${HARDCODED_SHEET_IDS.USER_SCORES_DB}/gviz/tq?tqx=out:json&sheet=User_Scores_DB`;
      const res = await fetch(gvizUrl);
      if (res.ok) {
        const text = await res.text();
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
        if (jsonMatch && jsonMatch[1]) {
          const gvizData = JSON.parse(jsonMatch[1]);
          const rows = gvizData.table?.rows;
          if (Array.isArray(rows) && rows.length > 0) {
            const list: IndividualLeaderboardEntry[] = [];
            const profilesMap = this.getUserProfilesMap();

            rows.forEach((r: any) => {
              const c = r.c;
              if (!c || !c[0] || c[0].v === null) return;
              const staffId = String(c[0].v).trim();
              if (!staffId || staffId.toLowerCase() === 'staff_id') return;
              const staffName = c[1] && c[1].v !== null ? String(c[1].v).trim() : 'Staff Member';
              const avatarId = c[2] && c[2].v !== null ? String(c[2].v).trim() : 'kahoot_1';
              let groupName = c[3] && c[3].v !== null ? String(c[3].v).trim() : 'Railway Champions';
              if (groupName.startsWith('Group ')) {
                const mapLegacy: Record<string, string> = {
                  'Group Alpha': 'Railway Champions',
                  'Group Bravo': 'Metro Riders',
                  'Group Charlie': 'Track Masters',
                  'Group Delta': 'Express Line',
                  'Group Echo': 'High-Speed Flyers',
                  'Group Foxtrot': 'Signal Pioneers',
                  'Group Golf': 'Velocity Transit',
                  'Group Hotel': 'Depot Dynamos',
                  'Group India': 'Rail Pilots',
                  'Group Juliet': 'Rapid Transit Titans',
                };
                groupName = mapLegacy[groupName] || groupName;
              }

              const totalPoints = Number(c[14]?.v || 0);
              const lastCompletedDay = Number(c[15]?.v || 0);
              const totalTimeSeconds = Number(c[16]?.v || 0);

              // Extract individual day scores
              const scores: Record<string, number> = {};
              for (let d = 1; d <= 10; d++) {
                const scoreVal = Number(c[3 + d]?.v || 0);
                if (scoreVal > 0) scores[`Day${d}`] = scoreVal;
              }

              const existingProfile = profilesMap[staffId.toUpperCase()];
              const savedDate = localStorage.getItem(`quiz_completed_date_${staffId.toUpperCase()}`) || existingProfile?.lastCompletedDate;

              profilesMap[staffId.toUpperCase()] = {
                staffId,
                staffName,
                avatarId,
                groupName,
                scores: { ...(existingProfile?.scores || {}), ...scores },
                totalPoints,
                totalTimeSeconds,
                lastCompletedDay,
                lastCompletedDate: savedDate,
              };

              list.push({
                rank: 0,
                staffId,
                staffName,
                avatarId,
                groupName,
                totalPoints,
                totalTimeSeconds,
                lastCompletedDay,
                lastCompletedDate: savedDate,
              });
            });

            localStorage.setItem(STORAGE_KEYS.USER_PROFILES_MAP, JSON.stringify(profilesMap));

            if (list.length > 0) {
              const sorted = sortIndividualsWithTieBreaker(list);
              this.saveLocalDrivers(sorted);
              const groups = computeGroupLeaderboard(sorted);
              return {
                individuals: sorted,
                allIndividuals: sorted,
                groups,
              };
            }
          }
        }
      }
    } catch (e) {
      console.warn('Direct GViz fetch for User_Scores_DB failed, checking GAS/local:', e);
    }

    // 2. GAS Web App if configured
    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      try {
        const url = `${gasUrl}${gasUrl.includes('?') ? '&' : '?'}action=getLeaderboardData&sheetId=${HARDCODED_SHEET_IDS.USER_SCORES_DB}`;
        const res = await fetch(url, { mode: 'cors', redirect: 'follow' });
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          const raw = data.data;
          const sanitizeItem = (i: any) => ({
            ...i,
            staffId: String(i?.staffId ?? ''),
            staffName: String(i?.staffName ?? ''),
            avatarId: String(i?.avatarId || 'kahoot_1'),
            groupName: String(i?.groupName || 'Railway Champions'),
            totalPoints: Number(i?.totalPoints || 0),
            totalTimeSeconds: Number(i?.totalTimeSeconds || 0),
            lastCompletedDay: Number(i?.lastCompletedDay || 0),
          });
          return {
            individuals: Array.isArray(raw.individuals) ? raw.individuals.map(sanitizeItem) : [],
            allIndividuals: Array.isArray(raw.allIndividuals) ? raw.allIndividuals.map(sanitizeItem) : [],
            groups: Array.isArray(raw.groups) ? raw.groups : [],
          };
        }
      } catch (e) {
        console.warn('Failed to load leaderboard from GAS, using local cache:', e);
      }
    }

    // 3. Local calculation with strict tie-breaker
    const drivers = this.getLocalDrivers();
    const sortedIndividuals = sortIndividualsWithTieBreaker(drivers);
    const groups = computeGroupLeaderboard(sortedIndividuals);

    return {
      individuals: sortedIndividuals,
      allIndividuals: sortedIndividuals,
      groups,
    };
  }

  private static syncLocalDriver(user: UserProfile): void {
    const drivers = this.getLocalDrivers();
    const userStaffId = String(user.staffId).toUpperCase();
    const idx = drivers.findIndex((d) => String(d.staffId).toUpperCase() === userStaffId);
    if (idx >= 0) {
      drivers[idx].totalPoints = user.totalPoints;
      drivers[idx].totalTimeSeconds = user.totalTimeSeconds || 0;
      drivers[idx].lastCompletedDay = user.lastCompletedDay;
      drivers[idx].avatarId = user.avatarId;
      drivers[idx].staffName = user.staffName;
      drivers[idx].lastCompletedDate = user.lastCompletedDate;
    } else {
      drivers.push({
        rank: drivers.length + 1,
        staffId: String(user.staffId),
        staffName: user.staffName,
        avatarId: user.avatarId,
        groupName: user.groupName,
        totalPoints: user.totalPoints,
        totalTimeSeconds: user.totalTimeSeconds || 0,
        lastCompletedDay: user.lastCompletedDay,
        lastCompletedDate: user.lastCompletedDate,
      });
    }
    const sorted = sortIndividualsWithTieBreaker(drivers);
    this.saveLocalDrivers(sorted);
  }
}

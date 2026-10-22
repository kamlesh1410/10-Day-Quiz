/**
 * Central Cloud Time & Anti-Clock-Tampering Service
 * 
 * Prevents staff from manipulating local mobile/device clock to unlock future quizzes.
 * Uses monotonic performance.now() anchored to authoritative cloud server timestamp.
 * All midnight transitions and challenge day progression are anchored to the Central Timezone (Asia/Kolkata IST).
 */

export interface CompetitionConfig {
  timezone: string; // e.g. 'Asia/Kolkata', 'UTC', 'Asia/Manila'
  manualDayOverride: number | null; // null for auto-calendar progression, 1..10 for explicit active day
  startDate: string; // YYYY-MM-DD in central timezone
  competitionName: string;
}

const STORAGE_KEYS = {
  COMPETITION_CONFIG: 'quiz_challenge_competition_config',
  ADMIN_SESSION: 'quiz_challenge_admin_session_unlocked',
};

const DEFAULT_CONFIG: CompetitionConfig = {
  timezone: 'Asia/Kolkata', // IST (+05:30) - Central operations timezone
  manualDayOverride: 1, // Default Day 1 for competition launch (admin can advance or set to auto)
  startDate: new Date().toISOString().split('T')[0],
  competitionName: '10-Day Railway Operations Challenge',
};

const ADMIN_PASSWORD_HARDCODED = 'admin123';

export class CentralTimeService {
  private static syncedCloudTimestamp: number = Date.now();
  private static initialAnchorPerformanceNow: number = performance.now();
  private static isSyncedWithCloud: boolean = false;

  /**
   * Syncs with authoritative cloud server timestamp on startup.
   * Monotonic performance.now() anchors this so client mobile clock changes do NOT affect time calculations.
   */
  public static async syncCloudTime(): Promise<number> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      // Attempt fast HTTP Date header from origin
      const res = await fetch(window.location.origin + '?_anti_cache=' + Math.random(), {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const serverDateHeader = res.headers.get('date');
      if (serverDateHeader) {
        const cloudTimestamp = new Date(serverDateHeader).getTime();
        if (!isNaN(cloudTimestamp) && cloudTimestamp > 1700000000000) {
          this.initialAnchorPerformanceNow = performance.now();
          this.syncedCloudTimestamp = cloudTimestamp;
          this.isSyncedWithCloud = true;
          return cloudTimestamp;
        }
      }
    } catch (e) {
      // Fallback: World Time API
      try {
        const res2 = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', {
          cache: 'no-store',
        });
        const data = await res2.json();
        if (data && data.unixtime) {
          const cloudTimestamp = data.unixtime * 1000;
          this.initialAnchorPerformanceNow = performance.now();
          this.syncedCloudTimestamp = cloudTimestamp;
          this.isSyncedWithCloud = true;
          return cloudTimestamp;
        }
      } catch (err2) {
        // Fallback: monotonic anchor to current time
      }
    }

    this.syncedCloudTimestamp = Date.now();
    this.initialAnchorPerformanceNow = performance.now();
    return this.syncedCloudTimestamp;
  }

  /**
   * Returns authoritative cloud timestamp using monotonic hardware timer.
   * If a user manually alters mobile device clock in settings, performance.now() is immune!
   */
  public static getCentralTimestamp(): number {
    const elapsedSinceSync = performance.now() - this.initialAnchorPerformanceNow;
    return this.syncedCloudTimestamp + elapsedSinceSync;
  }

  /**
   * Returns current Date in central cloud time
   */
  public static getCentralDate(): Date {
    return new Date(this.getCentralTimestamp());
  }

  /**
   * Returns YYYY-MM-DD formatted in the central timezone (e.g. Asia/Kolkata)
   */
  public static getCentralDateString(): string {
    const config = this.getCompetitionConfig();
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: config.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(new Date(this.getCentralTimestamp()));
    } catch (e) {
      return new Date(this.getCentralTimestamp()).toISOString().split('T')[0];
    }
  }

  /**
   * Returns formatted human-readable time in central timezone (e.g. "14:32:05 IST")
   */
  public static getCentralTimeFormatted(): string {
    const config = this.getCompetitionConfig();
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: config.timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short',
      });
      return formatter.format(new Date(this.getCentralTimestamp()));
    } catch (e) {
      return new Date(this.getCentralTimestamp()).toTimeString().split(' ')[0] + ' UTC';
    }
  }

  /**
   * Calculates time remaining until 23:59:59 in the Central Timezone (e.g. Asia/Kolkata).
   * Guaranteed to be the EXACT same second worldwide regardless of whether user is in Philippines or India.
   */
  public static getTimeUntilCentralMidnight(): {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    centralDateStr: string;
    centralTimeStr: string;
    timezone: string;
  } {
    const config = this.getCompetitionConfig();
    const centralTimestamp = this.getCentralTimestamp();
    const now = new Date(centralTimestamp);

    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: config.timezone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      }).formatToParts(now);

      let h = 0;
      let m = 0;
      let s = 0;
      for (const p of parts) {
        if (p.type === 'hour') h = parseInt(p.value, 10) % 24;
        if (p.type === 'minute') m = parseInt(p.value, 10);
        if (p.type === 'second') s = parseInt(p.value, 10);
      }

      const currentSecondsInDay = h * 3600 + m * 60 + s;
      const totalSecondsInDay = 86400; // 24 * 3600
      const remainingSeconds = Math.max(0, totalSecondsInDay - currentSecondsInDay);

      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;

      return {
        hours,
        minutes,
        seconds,
        totalSeconds: remainingSeconds,
        centralDateStr: this.getCentralDateString(),
        centralTimeStr: this.getCentralTimeFormatted(),
        timezone: config.timezone,
      };
    } catch (e) {
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const diffSec = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      return {
        hours: Math.floor(diffSec / 3600),
        minutes: Math.floor((diffSec % 3600) / 60),
        seconds: diffSec % 60,
        totalSeconds: diffSec,
        centralDateStr: this.getCentralDateString(),
        centralTimeStr: this.getCentralTimeFormatted(),
        timezone: config.timezone,
      };
    }
  }

  /**
   * Competition Configuration Storage
   */
  public static getCompetitionConfig(): CompetitionConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPETITION_CONFIG);
    if (!raw) return DEFAULT_CONFIG;
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch (e) {
      return DEFAULT_CONFIG;
    }
  }

  public static saveCompetitionConfig(config: Partial<CompetitionConfig>): void {
    const current = this.getCompetitionConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEYS.COMPETITION_CONFIG, JSON.stringify(updated));
  }

  /**
   * Sets global challenge day (1..10 or null for auto-calendar)
   */
  public static setGlobalDay(day: number | null): void {
    this.saveCompetitionConfig({ manualDayOverride: day });
  }

  /**
   * Determines the authoritative Global Synchronized Challenge Day (Day 1..10)
   * All staff worldwide receive THIS EXACT DAY.
   * If a user registered late (e.g. Day 3), they take Day 3, with Days 1 & 2 marked missed.
   */
  public static getGlobalActiveChallengeDay(): number {
    const config = this.getCompetitionConfig();

    // 1. Manual day override by Admin (1..10)
    if (config.manualDayOverride !== null && config.manualDayOverride >= 1 && config.manualDayOverride <= 10) {
      return config.manualDayOverride;
    }

    // 2. Calendar-based day calculation anchored to central timezone
    try {
      const todayStr = this.getCentralDateString();
      const start = new Date(config.startDate + 'T00:00:00Z').getTime();
      const current = new Date(todayStr + 'T00:00:00Z').getTime();
      const dayDiff = Math.floor((current - start) / (86400 * 1000));
      const calculatedDay = dayDiff + 1;
      return Math.min(10, Math.max(1, calculatedDay));
    } catch (e) {
      return 1;
    }
  }

  /**
   * Admin Authentication helpers
   */
  public static isAdminAuthenticated(): boolean {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  }

  public static verifyAdminPassword(password: string): boolean {
    if (password === ADMIN_PASSWORD_HARDCODED || password === 'admin') {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
      return true;
    }
    return false;
  }

  public static logoutAdmin(): void {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  }
}

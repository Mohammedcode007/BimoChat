import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  LAST_PROMPT_AT: "background_prompt_last_seen_at",
  DISMISS_COUNT: "background_prompt_dismiss_count",
  NEVER_SHOW_AGAIN: "background_prompt_never_show_again",
  OPEN_COUNT: "background_prompt_open_count",
  LAST_SETTINGS_OPEN_AT: "background_prompt_last_settings_open_at",
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export const BACKGROUND_REMINDER_CONFIG = {
  REMIND_AFTER_DAYS: 3,
  REMIND_AFTER_APP_OPENS: 5,
  MAX_DISMISS_BEFORE_SLOWDOWN: 3,
  SLOWDOWN_DAYS_AFTER_MAX_DISMISS: 7,
} as const;

/**
 * مهم:
 * هذه الدالة Placeholder.
 * اربطها لاحقًا مع Native Module أو مكتبة تفحص
 * Battery Optimization / Background Activity على أندرويد.
 */
export async function isBackgroundActivityEnabled(): Promise<boolean> {
  try {
    /**
     * بدل هذا السطر بالفحص الحقيقي.
     * مثال لاحقًا:
     * return await BatteryOptimizationModule.isIgnoringBatteryOptimizations();
     */
    return false;
  } catch (error) {
    console.log("[backgroundReminder] isBackgroundActivityEnabled error:", error);
    return false;
  }
}

async function getNumber(key: string, fallback = 0): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (!value) return fallback;

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch (error) {
    console.log(`[backgroundReminder] getNumber(${key}) error:`, error);
    return fallback;
  }
}

async function setNumber(key: string, value: number): Promise<void> {
  try {
    await AsyncStorage.setItem(key, String(value));
  } catch (error) {
    console.log(`[backgroundReminder] setNumber(${key}) error:`, error);
  }
}

async function getBoolean(key: string, fallback = false): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value == null) return fallback;
    return value === "true";
  } catch (error) {
    console.log(`[backgroundReminder] getBoolean(${key}) error:`, error);
    return fallback;
  }
}

async function setBoolean(key: string, value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value ? "true" : "false");
  } catch (error) {
    console.log(`[backgroundReminder] setBoolean(${key}) error:`, error);
  }
}

export async function incrementBackgroundReminderOpenCount(): Promise<number> {
  const current = await getNumber(STORAGE_KEYS.OPEN_COUNT, 0);
  const next = current + 1;
  await setNumber(STORAGE_KEYS.OPEN_COUNT, next);
  return next;
}

export async function getBackgroundReminderOpenCount(): Promise<number> {
  return getNumber(STORAGE_KEYS.OPEN_COUNT, 0);
}

export async function markBackgroundPromptShown(): Promise<void> {
  await setNumber(STORAGE_KEYS.LAST_PROMPT_AT, Date.now());
}

export async function markBackgroundPromptDismissed(): Promise<void> {
  const count = await getNumber(STORAGE_KEYS.DISMISS_COUNT, 0);
  await setNumber(STORAGE_KEYS.DISMISS_COUNT, count + 1);
  await setNumber(STORAGE_KEYS.LAST_PROMPT_AT, Date.now());
}

export async function markBackgroundSettingsOpened(): Promise<void> {
  await setNumber(STORAGE_KEYS.LAST_SETTINGS_OPEN_AT, Date.now());
  await setNumber(STORAGE_KEYS.LAST_PROMPT_AT, Date.now());
}

export async function setBackgroundNeverShowAgain(value: boolean): Promise<void> {
  await setBoolean(STORAGE_KEYS.NEVER_SHOW_AGAIN, value);
}

export async function getBackgroundNeverShowAgain(): Promise<boolean> {
  return getBoolean(STORAGE_KEYS.NEVER_SHOW_AGAIN, false);
}

export async function resetBackgroundReminderState(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.LAST_PROMPT_AT,
      STORAGE_KEYS.DISMISS_COUNT,
      STORAGE_KEYS.NEVER_SHOW_AGAIN,
      STORAGE_KEYS.OPEN_COUNT,
      STORAGE_KEYS.LAST_SETTINGS_OPEN_AT,
    ]);
  } catch (error) {
    console.log("[backgroundReminder] resetBackgroundReminderState error:", error);
  }
}

export type BackgroundReminderDecision = {
  shouldShow: boolean;
  reason:
    | "enabled"
    | "never_show_again"
    | "first_time"
    | "app_open_threshold"
    | "days_passed"
    | "slowdown_not_passed"
    | "not_due_yet";
  debug: {
    enabled: boolean;
    neverShowAgain: boolean;
    openCount: number;
    dismissCount: number;
    lastPromptAt: number;
    daysSinceLastPrompt: number | null;
  };
};

export async function shouldShowBackgroundReminder(): Promise<BackgroundReminderDecision> {
  const enabled = await isBackgroundActivityEnabled();

  if (enabled) {
    return {
      shouldShow: false,
      reason: "enabled",
      debug: {
        enabled: true,
        neverShowAgain: false,
        openCount: await getBackgroundReminderOpenCount(),
        dismissCount: await getNumber(STORAGE_KEYS.DISMISS_COUNT, 0),
        lastPromptAt: await getNumber(STORAGE_KEYS.LAST_PROMPT_AT, 0),
        daysSinceLastPrompt: null,
      },
    };
  }

  const neverShowAgain = await getBackgroundNeverShowAgain();
  if (neverShowAgain) {
    return {
      shouldShow: false,
      reason: "never_show_again",
      debug: {
        enabled: false,
        neverShowAgain: true,
        openCount: await getBackgroundReminderOpenCount(),
        dismissCount: await getNumber(STORAGE_KEYS.DISMISS_COUNT, 0),
        lastPromptAt: await getNumber(STORAGE_KEYS.LAST_PROMPT_AT, 0),
        daysSinceLastPrompt: null,
      },
    };
  }

  const openCount = await getBackgroundReminderOpenCount();
  const dismissCount = await getNumber(STORAGE_KEYS.DISMISS_COUNT, 0);
  const lastPromptAt = await getNumber(STORAGE_KEYS.LAST_PROMPT_AT, 0);

  if (!lastPromptAt) {
    return {
      shouldShow: true,
      reason: "first_time",
      debug: {
        enabled: false,
        neverShowAgain: false,
        openCount,
        dismissCount,
        lastPromptAt,
        daysSinceLastPrompt: null,
      },
    };
  }

  const now = Date.now();
  const diffMs = now - lastPromptAt;
  const daysSinceLastPrompt = diffMs / DAY_MS;

  if (dismissCount >= BACKGROUND_REMINDER_CONFIG.MAX_DISMISS_BEFORE_SLOWDOWN) {
    if (daysSinceLastPrompt >= BACKGROUND_REMINDER_CONFIG.SLOWDOWN_DAYS_AFTER_MAX_DISMISS) {
      return {
        shouldShow: true,
        reason: "days_passed",
        debug: {
          enabled: false,
          neverShowAgain: false,
          openCount,
          dismissCount,
          lastPromptAt,
          daysSinceLastPrompt,
        },
      };
    }

    return {
      shouldShow: false,
      reason: "slowdown_not_passed",
      debug: {
        enabled: false,
        neverShowAgain: false,
        openCount,
        dismissCount,
        lastPromptAt,
        daysSinceLastPrompt,
      },
    };
  }

  if (openCount >= BACKGROUND_REMINDER_CONFIG.REMIND_AFTER_APP_OPENS) {
    return {
      shouldShow: true,
      reason: "app_open_threshold",
      debug: {
        enabled: false,
        neverShowAgain: false,
        openCount,
        dismissCount,
        lastPromptAt,
        daysSinceLastPrompt,
      },
    };
  }

  if (daysSinceLastPrompt >= BACKGROUND_REMINDER_CONFIG.REMIND_AFTER_DAYS) {
    return {
      shouldShow: true,
      reason: "days_passed",
      debug: {
        enabled: false,
        neverShowAgain: false,
        openCount,
        dismissCount,
        lastPromptAt,
        daysSinceLastPrompt,
      },
    };
  }

  return {
    shouldShow: false,
    reason: "not_due_yet",
    debug: {
      enabled: false,
      neverShowAgain: false,
      openCount,
      dismissCount,
      lastPromptAt,
      daysSinceLastPrompt,
    },
  };
}

export async function consumeBackgroundReminderTrigger(): Promise<void> {
  /**
   * بعد عرض التذكير فعليًا:
   * - نعيد open count للصفر
   * - نسجل وقت آخر ظهور
   */
  await setNumber(STORAGE_KEYS.OPEN_COUNT, 0);
  await markBackgroundPromptShown();
}

export async function handleBackgroundReminderMaybeLater(): Promise<void> {
  await setNumber(STORAGE_KEYS.OPEN_COUNT, 0);
  await markBackgroundPromptDismissed();
}

export async function handleBackgroundReminderOpenedSettings(): Promise<void> {
  await setNumber(STORAGE_KEYS.OPEN_COUNT, 0);
  await markBackgroundSettingsOpened();
}
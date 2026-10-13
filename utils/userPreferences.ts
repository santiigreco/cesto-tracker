export interface UserPreferences {
    manoCalienteThreshold: number;
    isManoCalienteEnabled: boolean;
    manoFriaThreshold: number;
    isManoFriaEnabled: boolean;
    defaultMatchTab: 'tally' | 'statistics';
    enableHaptics: boolean;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
    manoCalienteThreshold: 4,
    isManoCalienteEnabled: true,
    manoFriaThreshold: 4,
    isManoFriaEnabled: true,
    defaultMatchTab: 'tally',
    enableHaptics: true,
};

const PREFERENCES_KEY = 'cesto_user_preferences';

export const getUserPreferences = (): UserPreferences => {
    try {
        const raw = localStorage.getItem(PREFERENCES_KEY);
        if (!raw) return DEFAULT_USER_PREFERENCES;
        return { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_USER_PREFERENCES;
    }
};

export const saveUserPreferences = (prefs: Partial<UserPreferences>): UserPreferences => {
    try {
        const current = getUserPreferences();
        const updated = { ...current, ...prefs };
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
        return updated;
    } catch {
        return DEFAULT_USER_PREFERENCES;
    }
};

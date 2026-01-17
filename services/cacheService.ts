/**
 * Local Storage Service for Caching App Data
 * Prevents unnecessary API calls for app-settings and profile
 */

const STORAGE_KEYS = {
    APP_SETTINGS: 'app_settings',
    USER_PROFILE: 'user_profile',
    PROFILE_VERSION: 'profile_version',
} as const;

export interface CachedAppSettings {
    data: any;
    timestamp: number;
}

export interface CachedProfile {
    data: any;
    version: number;
    timestamp: number;
}

class CacheService {
    /**
     * App Settings - Persist across browser sessions
     * Only clear when browser is closed
     */

    getAppSettings(): any | null {
        try {
            const cached = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
            if (cached) {
                const parsed: CachedAppSettings = JSON.parse(cached);
                return parsed.data;
            }
        } catch (error) {
            console.error('Failed to retrieve cached app settings:', error);
        }
        return null;
    }

    setAppSettings(data: any): void {
        try {
            const cached: CachedAppSettings = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(cached));
        } catch (error) {
            console.error('Failed to cache app settings:', error);
        }
    }

    clearAppSettings(): void {
        try {
            localStorage.removeItem(STORAGE_KEYS.APP_SETTINGS);
        } catch (error) {
            console.error('Failed to clear app settings:', error);
        }
    }

    /**
     * User Profile - Session-based caching
     * Clear when browser is closed using sessionStorage
     * Reload when profile is updated (version tracking)
     */

    getUserProfile(): any | null {
        try {
            const cached = sessionStorage.getItem(STORAGE_KEYS.USER_PROFILE);
            if (cached) {
                const parsed: CachedProfile = JSON.parse(cached);
                return parsed.data;
            }
        } catch (error) {
            console.error('Failed to retrieve cached profile:', error);
        }
        return null;
    }

    setUserProfile(data: any, version?: number): void {
        try {
            const currentVersion = this.getProfileVersion();
            const newVersion = version !== undefined ? version : currentVersion + 1;

            const cached: CachedProfile = {
                data,
                version: newVersion,
                timestamp: Date.now()
            };

            sessionStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(cached));
            this.setProfileVersion(newVersion);
        } catch (error) {
            console.error('Failed to cache profile:', error);
        }
    }

    getProfileVersion(): number {
        try {
            const version = sessionStorage.getItem(STORAGE_KEYS.PROFILE_VERSION);
            return version ? parseInt(version, 10) : 0;
        } catch (error) {
            return 0;
        }
    }

    setProfileVersion(version: number): void {
        try {
            sessionStorage.setItem(STORAGE_KEYS.PROFILE_VERSION, version.toString());
        } catch (error) {
            console.error('Failed to set profile version:', error);
        }
    }

    clearUserProfile(): void {
        try {
            sessionStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
            sessionStorage.removeItem(STORAGE_KEYS.PROFILE_VERSION);
        } catch (error) {
            console.error('Failed to clear profile:', error);
        }
    }

    /**
     * Invalidate profile cache to force reload on next request
     * Call this after profile update operations
     */
    invalidateProfile(): void {
        this.setProfileVersion(this.getProfileVersion() + 1);
        this.clearUserProfile();
    }

    /**
     * Clear all cached data
     */
    clearAll(): void {
        this.clearAppSettings();
        this.clearUserProfile();
    }
}

export const cacheService = new CacheService();

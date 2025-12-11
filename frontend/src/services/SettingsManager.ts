import { UserManager } from "./UserManager";

export interface UserSettings {
    showHomePageCamera: boolean;
    theme: "dark" | "light" | "system";
    fingerOutlines: boolean; // keep existing idea
    handColor: string;
    mornEmail: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
    showHomePageCamera: true,
    theme: "dark",
    fingerOutlines: true,
    handColor: "#45caff",
    mornEmail: true,
};

type SettingsListener = (settings: UserSettings) => void;

export class SettingsManager {
    private static instance: SettingsManager;
    private settings: UserSettings = DEFAULT_SETTINGS;
    private listeners: SettingsListener[] = [];
    private currentUsername: string | null = null;

    private constructor() {
        // Listen for user changes to load their settings
        UserManager.getInstance().subscribe((user) => {
            const newUsername = user?.username || null;
            if (newUsername !== this.currentUsername) {
                this.currentUsername = newUsername;
                this.loadSettings();
            }
        });
    }

    public static getInstance(): SettingsManager {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager();
        }
        return SettingsManager.instance;
    }

    public getSettings(): UserSettings {
        return { ...this.settings };
    }

    public updateSettings(newSettings: Partial<UserSettings>) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.notify();
    }

    public subscribe(listener: SettingsListener): () => void {
        this.listeners.push(listener);
        listener(this.settings);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach((l) => l(this.settings));
    }

    private loadSettings() {
        if (!this.currentUsername) {
            this.settings = DEFAULT_SETTINGS; // Reset to defaults if no user
            this.notify();
            return;
        }

        const key = `user_settings_${this.currentUsername}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            } catch (e) {
                console.error("Failed to parse settings", e);
                this.settings = DEFAULT_SETTINGS;
            }
        } else {
            this.settings = DEFAULT_SETTINGS;
        }
        this.notify();
    }

    private saveSettings() {
        if (!this.currentUsername) return; // Don't save if not logged in (or save to temp?)
        const key = `user_settings_${this.currentUsername}`;
        localStorage.setItem(key, JSON.stringify(this.settings));
    }
}

import type { User } from "../assets/user";

export type UserStats = {
    totalLessons: number;
    completedLessons: number;
    averageScore: number;
    totalAttempts: number;
    totalXP: number;
};

type UserListener = (user: User | null, stats: UserStats | null) => void;

export class UserManager {
    private static instance: UserManager;
    private currentUser: User | null = null;
    private currentStats: UserStats | null = null;
    private listeners: UserListener[] = [];
    private loading: boolean = false;

    private constructor() { }

    public static getInstance(): UserManager {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    public subscribe(listener: UserListener): () => void {
        this.listeners.push(listener);
        // Immediately notify with current state
        listener(this.currentUser, this.currentStats);

        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach((listener) => listener(this.currentUser, this.currentStats));
    }

    public getCurrentUser(): User | null {
        return this.currentUser;
    }

    public getCurrentStats(): UserStats | null {
        return this.currentStats;
    }

    public async fetchCurrentUser(): Promise<User | null> {
        if (this.loading) return this.currentUser;

        try {
            this.loading = true;
            const res = await fetch("http://localhost:8000/api/users/me");

            if (!res.ok) {
                throw new Error(`Failed to fetch user (${res.status})`);
            }

            const data = await res.json();
            this.currentUser = data as User;

            // Also fetch stats
            await this.fetchUserStats();

            this.notify();
            return this.currentUser;
        } catch (error) {
            console.error("UserManager fetch error:", error);
            return null;
        } finally {
            this.loading = false;
        }
    }

    public async fetchUserStats(): Promise<UserStats | null> {
        try {
            const res = await fetch("http://localhost:8000/api/user/stats");

            if (!res.ok) {
                throw new Error(`Failed to fetch user stats (${res.status})`);
            }

            const data = await res.json();
            this.currentStats = data as UserStats;
            this.notify();
            return this.currentStats;
        } catch (error) {
            console.error("UserManager stats fetch error:", error);
            return null;
        }
    }

    // Helper to update user locally (e.g. after profile edit)
    public updateUser(user: User) {
        this.currentUser = user;
        this.notify();
    }
}

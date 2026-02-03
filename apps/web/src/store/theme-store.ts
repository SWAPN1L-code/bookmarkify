import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    initTheme: () => void;
}

const STORAGE_KEY = 'bookmarkify-theme';

const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (theme: Theme): ResolvedTheme => {
    if (theme === 'system') {
        return getSystemTheme();
    }
    return theme;
};

const applyTheme = (resolvedTheme: ResolvedTheme) => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
    theme: 'system',
    resolvedTheme: 'light',

    setTheme: (theme: Theme) => {
        const resolvedTheme = resolveTheme(theme);
        localStorage.setItem(STORAGE_KEY, theme);
        applyTheme(resolvedTheme);
        set({ theme, resolvedTheme });
    },

    toggleTheme: () => {
        const { resolvedTheme } = get();
        const newTheme: Theme = resolvedTheme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
    },

    initTheme: () => {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        const theme: Theme = stored || 'system';
        const resolvedTheme = resolveTheme(theme);
        applyTheme(resolvedTheme);
        set({ theme, resolvedTheme });

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const { theme } = get();
            if (theme === 'system') {
                const resolvedTheme = getSystemTheme();
                applyTheme(resolvedTheme);
                set({ resolvedTheme });
            }
        };
        mediaQuery.addEventListener('change', handleChange);
    },
}));

import { useThemeStore } from '@/store/theme-store';
import { useEffect } from 'react';

export function useTheme() {
    const { theme, resolvedTheme, setTheme, toggleTheme, initTheme } = useThemeStore();

    useEffect(() => {
        initTheme();
    }, [initTheme]);

    return {
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isDark: resolvedTheme === 'dark',
    };
}

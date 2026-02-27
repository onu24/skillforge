'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'skillforge_search_history';
const MAX_HISTORY = 3;

export function useSearchHistory() {
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse search history', e);
            }
        }
    }, []);

    const addToHistory = (query: string) => {
        if (!query.trim()) return;

        setHistory(prev => {
            const filtered = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
            const newHistory = [query.trim(), ...filtered].slice(0, MAX_HISTORY);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return { history, addToHistory, clearHistory };
}

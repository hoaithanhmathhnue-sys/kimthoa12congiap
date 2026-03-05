import { useState, useEffect } from 'react';
import { AppSettings, UserProgress } from '../types';

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  soundEnabled: true,
  musicEnabled: false,
  theme: 'light',
  selectedModel: 'gemini-3-flash-preview'
};

const DEFAULT_PROGRESS: UserProgress = {
  totalScore: 0,
  completedQuestions: 0,
  correctAnswers: 0,
  streak: 0,
  history: []
};

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useAppStore() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('app_settings', DEFAULT_SETTINGS);
  const [progress, setProgress] = useLocalStorage<UserProgress>('user_progress', DEFAULT_PROGRESS);

  return { settings, setSettings, progress, setProgress };
}

import { useState, useEffect } from 'react';

const TV_MODE_STORAGE_KEY = 'dashboard-tv-mode';

export const useTVMode = () => {
  // Inicializar estado lendo do localStorage
  const [isTVMode, setIsTVModeState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(TV_MODE_STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  // Wrapper para setIsTVMode que também salva no localStorage
  const setIsTVMode = (value: boolean | ((prev: boolean) => boolean)) => {
    setIsTVModeState((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem(TV_MODE_STORAGE_KEY, String(newValue));
      } catch (error) {
        console.error('Erro ao salvar modo TV:', error);
      }
      return newValue;
    });
  };

  // Sincronizar entre abas (opcional, mas útil)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TV_MODE_STORAGE_KEY && e.newValue !== null) {
        setIsTVModeState(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { isTVMode, setIsTVMode };
};

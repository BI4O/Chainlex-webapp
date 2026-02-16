'use client';

import { useEffect } from 'react';
import { useLexstudioStore } from '@/lib/store';

/**
 * Component to initialize store from localStorage on mount
 * Must be used in a client component
 */
export function StoreInitializer() {
  const loadFromLocalStorage = useLexstudioStore((state) => state.loadFromLocalStorage);

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  return null;
}
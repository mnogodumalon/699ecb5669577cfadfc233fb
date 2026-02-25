import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ArtikelEinstellen } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [artikelEinstellen, setArtikelEinstellen] = useState<ArtikelEinstellen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [artikelEinstellenData] = await Promise.all([
        LivingAppsService.getArtikelEinstellen(),
      ]);
      setArtikelEinstellen(artikelEinstellenData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { artikelEinstellen, setArtikelEinstellen, loading, error, fetchAll };
}
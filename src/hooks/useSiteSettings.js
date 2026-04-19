/**
 * useSiteSettings.js
 * Reads global feature flags from the `site_settings` Supabase table.
 * Returns { showAdultSection: boolean, loading: boolean }
 *
 * SETUP: Run supabase/migrations/20260419_site_settings.sql in the Supabase
 * SQL editor before using this hook.
 */
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

let _cache = null; // module-level cache so all components read the same value

export const useSiteSettings = () => {
  const [showAdultSection, setShowAdultSection] = useState(
    _cache !== null ? _cache : true // optimistic default = show
  );
  const [loading, setLoading] = useState(_cache === null);

  useEffect(() => {
    if (_cache !== null) {
      setShowAdultSection(_cache);
      setLoading(false);
      return;
    }
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'show_adult_section')
      .single()
      .then(({ data, error }) => {
        // If the table doesn't exist yet default to showing the tab
        const flag = error ? true : data?.value === true || data?.value === 'true';
        _cache = flag;
        setShowAdultSection(flag);
        setLoading(false);
      });
  }, []);

  return { showAdultSection, loading };
};

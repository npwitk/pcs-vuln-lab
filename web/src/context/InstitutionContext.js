import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { institutionsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const InstitutionContext = createContext();

export const useInstitutions = () => {
  const context = useContext(InstitutionContext);
  if (!context) {
    throw new Error('useInstitutions must be used within an InstitutionProvider');
  }
  return context;
};

const STORAGE_KEY = 'pcs_selected_institution';

function readStoredSelection() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return raw === 'all' ? 'all' : parseInt(raw, 10) || null;
  } catch {
    return null;
  }
}

// Single shared source of truth for "which institution's cheat sheets is the
// visitor browsing" — the navbar picker writes here, and Home.js (and
// anything else that cares, like the upcoming-exams carousel) just reads
// `selectedInstitution` reactively. A legacy ?institution= link is seeded
// in once by Home on mount and then dropped from the URL.
export const InstitutionProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(true);
  const [selectedInstitution, setSelectedInstitutionState] = useState(() => readStoredSelection() ?? 'all');
  // Live, not a one-time snapshot: flips true the moment ANY explicit pick
  // happens (see setSelectedInstitution below), not just ones from a prior
  // session. Without that, an explicit in-session pick made before auth
  // finishes resolving could get silently clobbered by the effect below
  // once `user` populates a moment later.
  const [hasStoredSelection, setHasStoredSelection] = useState(() => readStoredSelection() !== null);

  useEffect(() => {
    institutionsAPI.getAll()
      .then(res => setInstitutions(res.data.institutions || []))
      .catch(() => {})
      .finally(() => setInstitutionsLoading(false));
  }, []);

  // Only fall back to the user's own institution when nothing was ever
  // explicitly chosen before (no localStorage record) — an explicit pick,
  // including "All Institutions", should never get silently overridden by
  // login state resolving after the fact.
  useEffect(() => {
    if (authLoading || hasStoredSelection) return;
    if (user?.institution_id) {
      setSelectedInstitutionState(user.institution_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.institution_id, hasStoredSelection]);

  const setSelectedInstitution = useCallback((id) => {
    setSelectedInstitutionState(id);
    setHasStoredSelection(true);
    try { localStorage.setItem(STORAGE_KEY, String(id)); } catch {}
  }, []);

  const selectedInstitutionData = selectedInstitution === 'all'
    ? null
    : institutions.find(inst => inst.institution_id === selectedInstitution) || null;

  const value = {
    institutions,
    institutionsLoading,
    selectedInstitution,
    setSelectedInstitution,
    selectedInstitutionData,
  };

  return (
    <InstitutionContext.Provider value={value}>
      {children}
    </InstitutionContext.Provider>
  );
};

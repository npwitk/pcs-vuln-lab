import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { coursesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useInstitutions } from '../context/InstitutionContext';
import { useTranslation } from 'react-i18next';

const Wrapper = styled.div`
  position: relative;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  box-shadow: ${props => props.theme.shadows.md};
  z-index: 20;
  max-height: 220px;
  overflow-y: auto;
`;

const SuggestionItem = styled.button`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

const SuggestionCode = styled.span`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.primary};
  flex-shrink: 0;
`;

const SuggestionName = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ResolvedRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.success};
`;

const UnknownPanel = styled.div`
  margin-top: 0.6rem;
  padding: 0.85rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
`;

const UnknownText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.warning};
  margin-bottom: 0.6rem;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SmallButton = styled.button`
  padding: 0.4rem 0.75rem;
  border-radius: ${props => props.theme.radius.md};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimarySmallButton = styled(SmallButton)`
  background: ${props => props.theme.colors.primary};
  color: white;
  border-color: ${props => props.theme.colors.primary};

  &:hover:not(:disabled) {
    color: white;
    filter: brightness(1.08);
  }
`;

const ManualInputRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
`;

const ManualInput = styled.input`
  flex: 1;
  padding: 0.5rem 0.65rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.sm};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
`;

const HintText = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.4rem;
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const SpinIcon = styled(Loader2)`
  animation: ${spin} 0.8s linear infinite;
`;

/**
 * Drop-in replacement for a plain course_code <input>. As the user types it
 * suggests known courses (GET /api/courses/suggest); picking one from the
 * dropdown IS the confirmation. Typing a code with no match opens a small
 * panel offering a live registrar check (only when the institution has one
 * connected: SIIT or MFU, per `registrar_lookup` on GET /api/institutions)
 * and manual name entry —
 * confirming either path registers the course (POST /api/courses) and
 * reports the resolved {course_code, course_name} up via onResolved, so
 * parent forms don't need their own registry-write logic. Parent forms
 * should gate their submit button on having received onResolved for the
 * current value.
 *
 * `institutionId` picks whose registrar to check; it defaults to the signed-in
 * user's own institution (admin exam forms pass the exam's institution).
 */
const CourseCodeField = ({
  value = '',
  onChange,
  onResolved,
  initiallyResolved = false,
  placeholder,
  disabled = false,
  institutionId,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { institutions } = useInstitutions();
  const targetInstitutionId = institutionId ?? user?.institution_id;
  const registrar = institutions.find(inst => inst.institution_id === targetInstitutionId)?.registrar_lookup || null;

  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [resolved, setResolved] = useState(null);
  const [checkedValue, setCheckedValue] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [siitState, setSiitState] = useState('idle'); // idle | checking | found | not_found | error
  const [siitCandidate, setSiitCandidate] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualName, setManualName] = useState('');
  const [saving, setSaving] = useState(false);

  const debounceRef = useRef(null);
  const didInitRef = useRef(false);
  const wrapperRef = useRef(null);

  // Quietly resolve a pre-existing value (edit flows) without disrupting the
  // form — a code that predates this feature isn't forced to re-confirm.
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    if (!value) return;

    if (initiallyResolved) {
      setResolved({ course_code: value, course_name: null });
      setCheckedValue(value);
    }

    coursesAPI.getByCode(value)
      .then(res => {
        setResolved({ course_code: res.data.course_code, course_name: res.data.course_name });
        setCheckedValue(value);
        setNotFound(false);
      })
      .catch(() => { /* not registered yet — grandfathered in if initiallyResolved */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetResolutionState = () => {
    setResolved(null);
    setNotFound(false);
    setSiitState('idle');
    setSiitCandidate(null);
    setManualMode(false);
    setManualName('');
  };

  const runSuggest = useCallback((term) => {
    if (!term || term.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setNotFound(false);
      return;
    }
    coursesAPI.suggest(term.trim(), targetInstitutionId)
      .then(res => {
        const results = res.data.courses || [];
        setSuggestions(results);
        setShowDropdown(results.length > 0);
        setNotFound(results.length === 0);
      })
      .catch(() => setSuggestions([]));
  }, [targetInstitutionId]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (newValue !== checkedValue) {
      resetResolutionState();
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSuggest(newValue), 300);
  };

  const finalizeResolution = (course, isNew) => {
    onChange(course.course_code);
    setResolved(course);
    setCheckedValue(course.course_code);
    setNotFound(false);
    setShowDropdown(false);
    setManualMode(false);
    setSiitState('idle');
    onResolved?.({ ...course, isNew });
  };

  const handleSelectSuggestion = (course) => finalizeResolution(course, false);

  const handleCheckSiit = async () => {
    setSiitState('checking');
    try {
      const res = await coursesAPI.registrarLookup(value.trim(), targetInstitutionId);
      setSiitCandidate(res.data);
      setSiitState('found');
    } catch (err) {
      // 404: the registrar answered but doesn't know the code. Anything else
      // (registrar down, not connected) is a failed check, not a "no".
      setSiitState(err.response?.status === 404 ? 'not_found' : 'error');
    }
  };

  const confirmSiitCandidate = async () => {
    if (!siitCandidate) return;
    setSaving(true);
    try {
      const res = await coursesAPI.create({
        course_code: siitCandidate.course_code,
        course_name: siitCandidate.course_name,
        source: siitCandidate.source,
      });
      finalizeResolution(res.data, true);
    } finally {
      setSaving(false);
    }
  };

  const confirmManualName = async () => {
    if (!manualName.trim()) return;
    setSaving(true);
    try {
      const res = await coursesAPI.create({
        course_code: value.trim(),
        course_name: manualName.trim(),
        source: 'manual',
      });
      finalizeResolution(res.data, true);
    } finally {
      setSaving(false);
    }
  };

  // "SIIT registrar" / "ระบบทะเบียน SIIT", built from the registrar key
  // since the server's label is English-only.
  const registrarName = (r) => (r?.key
    ? t('courseCode.registrarName', { name: r.key.toUpperCase() })
    : t('courseCode.theRegistrar'));

  const trimmedValue = (value || '').trim();
  const isResolved = !!resolved && resolved.course_code?.toUpperCase() === trimmedValue.toUpperCase();
  const showUnknownPanel = notFound && !isResolved && trimmedValue.length >= 2;

  return (
    <Wrapper ref={wrapperRef}>
      <StyledInput
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder ?? t('courseCode.placeholder')}
        disabled={disabled}
        autoComplete="off"
      />

      {showDropdown && suggestions.length > 0 && (
        <Dropdown>
          {suggestions.map((course) => (
            <SuggestionItem key={course.course_code} type="button" onClick={() => handleSelectSuggestion(course)}>
              <SuggestionCode>{course.course_code}</SuggestionCode>
              <SuggestionName>{course.course_name}</SuggestionName>
            </SuggestionItem>
          ))}
        </Dropdown>
      )}

      {isResolved && resolved.course_name && (
        <ResolvedRow>
          <Check size={14} /> {resolved.course_name}
        </ResolvedRow>
      )}

      {showUnknownPanel && (
        <UnknownPanel>
          <UnknownText>
            <AlertCircle size={14} /> {t('courseCode.unknown', { code: trimmedValue })}
          </UnknownText>

          {siitState === 'found' && siitCandidate ? (
            <>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                {t('courseCode.registrarSays', { registrar: registrarName(siitCandidate.registrar) })} <strong>{siitCandidate.course_name}</strong>
              </div>
              <ActionRow>
                <PrimarySmallButton type="button" onClick={confirmSiitCandidate} disabled={saving}>
                  {t('courseCode.useName')}
                </PrimarySmallButton>
                <SmallButton type="button" onClick={() => { setSiitState('idle'); setSiitCandidate(null); }}>
                  {t('courseCode.notThis')}
                </SmallButton>
              </ActionRow>
            </>
          ) : manualMode ? (
            <ManualInputRow>
              <ManualInput
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder={t('courseCode.namePlaceholder')}
                autoFocus
              />
              <PrimarySmallButton type="button" onClick={confirmManualName} disabled={saving || !manualName.trim()}>
                {t('courseCode.confirm')}
              </PrimarySmallButton>
            </ManualInputRow>
          ) : (
            <ActionRow>
              {registrar ? (
                <>
                  <PrimarySmallButton type="button" onClick={handleCheckSiit} disabled={siitState === 'checking'}>
                    {siitState === 'checking' && <SpinIcon size={12} />}
                    {siitState === 'checking' ? t('courseCode.checking') : t('courseCode.check', { registrar: registrarName(registrar) })}
                  </PrimarySmallButton>
                  <SmallButton type="button" onClick={() => setManualMode(true)}>
                    {t('courseCode.enterManually')}
                  </SmallButton>
                </>
              ) : (
                // No registrar connected for this institution: manual is the
                // only way, so make it the primary action.
                <PrimarySmallButton type="button" onClick={() => setManualMode(true)}>
                  {t('courseCode.enterName')}
                </PrimarySmallButton>
              )}
            </ActionRow>
          )}

          {siitState === 'not_found' && (
            <HintText>{t('courseCode.notFound', { registrar: registrarName(registrar) })}</HintText>
          )}
          {siitState === 'error' && (
            <HintText>{t('courseCode.error', { registrar: registrarName(registrar) })}</HintText>
          )}
        </UnknownPanel>
      )}
    </Wrapper>
  );
};

export default CourseCodeField;

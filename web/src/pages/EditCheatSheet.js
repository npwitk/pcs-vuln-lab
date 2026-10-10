import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { cheatSheetsAPI, cheatSheetFilesAPI, cheatSheetCollaboratorsAPI, printServiceAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../components/LoadingSpinner';
import CourseCodeField from '../components/CourseCodeField';
import { useAuth } from '../context/AuthContext';
import { Card, Section, SectionHeader, SectionTitle, SectionDescription } from '../components/ui/Card';
import { FormGroup, Label, HelpText, Row } from '../components/ui/FormGroup';
import { Input, Select, TextArea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import PillSelect from '../components/ui/PillSelect';
import StatusPill from '../components/ui/StatusPill';
import { BookOpen, GraduationCap, ListChecks, FileText, Image as ImageIcon, Lock, Eye, Building2, Clock, Sparkles, ExternalLink } from 'lucide-react';
import MarkdownEditorField from '../components/cheatsheet-form/MarkdownEditorField';
import FileUploadField from '../components/cheatsheet-form/FileUploadField';
import YoutubeLinksField from '../components/cheatsheet-form/YoutubeLinksField';
import SupplementaryFilesField from '../components/cheatsheet-form/SupplementaryFilesField';
import CollaboratorsField from '../components/cheatsheet-form/CollaboratorsField';
import { MIN_PAID_PRICE } from '../constants/cheatSheetLimits';
import usePageMeta from '../hooks/usePageMeta';
import Preview3DUploadFields from '../components/cheatsheet-form/Preview3DUploadFields';
import { sheetExamTypes } from '../utils/examTypes';

const WHATS_NEW_MAX = 1000;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

// Card without bottom padding: the sticky save bar sits flush at its bottom.
const EditCard = styled(Card)`
  padding-bottom: 0;

  @media (max-width: 600px) {
    padding: 1.25rem 1.25rem 0;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  margin: 0 0 0.25rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};

  @media (max-width: 600px) {
    font-size: ${props => props.theme.typography.sizes['2xl']};
  }
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
  overflow-wrap: anywhere;
`;

const ViewLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
  margin-top: 0.5rem;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

// Underlined tabs; scroll sideways on narrow screens instead of wrapping.
const Tabs = styled.div`
  display: flex;
  gap: 1.5rem;
  margin: 0 -2rem 1.75rem;
  padding: 0 2rem;
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 600px) {
    gap: 1.25rem;
    margin: 0 -1.25rem 1.5rem;
    padding: 0 1.25rem;
  }
`;

const Tab = styled.button`
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem 0;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  margin-bottom: -1px;
  font: inherit;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.$active ? props.theme.typography.weights.semibold : props.theme.typography.weights.medium};
  color: ${props => props.$active ? props.theme.colors.text : props.theme.colors.textSecondary};
  white-space: nowrap;
  cursor: pointer;
  transition: color ${props => props.theme.transitions.fast}, border-color ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

// Marks a tab holding unsaved changes (or, after a failed save, errors).
const TabMarker = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.$error ? props.theme.colors.error : props.theme.colors.primary};
`;

// Note on tabs whose changes apply immediately rather than on Save.
const InstantNote = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.borderLight};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.625rem 0.875rem;
`;

const ValidatedInput = styled(Input)`
  &[aria-invalid="true"] {
    border-color: ${props => props.theme.colors.error};
  }
  &[aria-invalid="true"]:focus {
    box-shadow: 0 0 0 3px color-mix(in srgb, ${props => props.theme.colors.error} 18%, transparent);
  }
`;

const FieldError = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.error};
`;

// Always-visible save bar, pinned to the bottom of the viewport while the
// card is on screen.
const SaveBar = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 2rem -2rem 0;
  padding: 1rem 2rem;
  background: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.borderLight};
  border-radius: 0 0 ${props => props.theme.radius.lg} ${props => props.theme.radius.lg};

  @media (max-width: 600px) {
    margin: 1.5rem -1.25rem 0;
    padding: 0.875rem 1.25rem;
  }
`;

const SaveStatus = styled.span`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.$dirty ? props.theme.colors.text : props.theme.colors.textTertiary};
  font-weight: ${props => props.$dirty ? props.theme.typography.weights.semibold : props.theme.typography.weights.medium};
`;

const SaveActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const PrintSettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const DEFAULT_PRINT_SETTINGS = {
  is_enabled: false,
  is_accepting_requests: true,
  price_per_page: '2.75',
  pickup_location: '',
  promptpay_number: ''
};

const toLocalInputValue = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const cleanLinks = (links) => links.map(l => l.trim()).filter(Boolean);

function EditCheatSheet() {
  const { t } = useTranslation();
  usePageMeta(t('edit.pageTitle'));
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('details');
  // Set by a failed save: errors show inline and their tabs get marked.
  const [attempted, setAttempted] = useState(false);
  const tabsRef = useRef(null);

  const [previewImageFile, setPreviewImageFile] = useState(null);
  const [originalPreviewImageUrl, setOriginalPreviewImageUrl] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  // 3D preview (beta)
  const [preview3dFront, setPreview3dFront] = useState(null);
  const [preview3dBack, setPreview3dBack] = useState(null);
  const [existing3d, setExisting3d] = useState({ front: '', back: '' });
  const [remove3d, setRemove3d] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  // Optional note for the new file version; only sent along with a new PDF.
  const [whatsNew, setWhatsNew] = useState('');
  const [youtubeLinks, setYoutubeLinks] = useState(['']);
  const [courseResolved, setCourseResolved] = useState(true);
  const [supplementaryFiles, setSupplementaryFiles] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  // Only the actual uploader (or an admin) may see/edit financial settings —
  // a tagged collaborator can edit everything else but never this.
  const [createdBy, setCreatedBy] = useState(null);
  const isOwnerOrAdmin = createdBy === user?.user_id || !!user?.is_admin;
  // Institution is fixed at creation and never editable here — tracked
  // separately (not in formData) purely to decide whether the restriction
  // toggle below can be enabled at all.
  const [cheatSheetInstitutionId, setCheatSheetInstitutionId] = useState(null);

  const [printSettings, setPrintSettings] = useState(DEFAULT_PRINT_SETTINGS);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_code: '',
    semester: '',
    academic_year: '',
    year_level: '',
    exam_types: [],
    price: '',
    exclusive_content: '',
    release_at: '',
    full_preview_enabled: false,
    institution_restricted: false
  });
  // What was last loaded from the server, to tell what's unsaved.
  const [saved, setSaved] = useState(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchCheatSheet = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const response = await cheatSheetsAPI.getById(id);
      const cheatSheet = response.data.cheat_sheet;
      setCheatSheetInstitutionId(cheatSheet.institution_id || null);
      setCreatedBy(cheatSheet.created_by);

      const loadedForm = {
        title: cheatSheet.title || '',
        description: cheatSheet.description || '',
        course_code: cheatSheet.course_code || '',
        semester: cheatSheet.semester || '',
        academic_year: cheatSheet.academic_year ? String(cheatSheet.academic_year) : '',
        year_level: cheatSheet.year_level || '',
        exam_types: sheetExamTypes(cheatSheet),
        price: cheatSheet.price != null ? String(cheatSheet.price) : '',
        exclusive_content: cheatSheet.exclusive_content || '',
        full_preview_enabled: !!cheatSheet.full_preview_enabled,
        institution_restricted: !!cheatSheet.institution_restricted,
        release_at: toLocalInputValue(cheatSheet.release_at)
      };
      setFormData(loadedForm);

      setOriginalPreviewImageUrl(cheatSheet.preview_image_path || '');
      setPreviewImageUrl(cheatSheet.preview_image_path || '');
      setExisting3d({ front: cheatSheet.preview_3d_front_path || '', back: cheatSheet.preview_3d_back_path || '' });
      setPreviewImageFile(null);
      setPreview3dFront(null);
      setPreview3dBack(null);
      setRemove3d(false);
      setPdfFile(null);
      setWhatsNew('');

      let loadedLinks = [''];
      if (cheatSheet.youtube_links) {
        try {
          const links = Array.isArray(cheatSheet.youtube_links)
            ? cheatSheet.youtube_links
            : JSON.parse(cheatSheet.youtube_links);
          loadedLinks = links.length > 0 ? links : [''];
        } catch (e) {
          console.warn('Failed to parse youtube_links:', e);
        }
      }
      setYoutubeLinks(loadedLinks);

      // Load existing print service settings — only the actual uploader (or
      // an admin) sees this; a collaborator's Edit page skips it entirely.
      let loadedPrint = DEFAULT_PRINT_SETTINGS;
      if (cheatSheet.created_by === user?.user_id || user?.is_admin) {
        try {
          const psRes = await printServiceAPI.getSettings(id);
          if (psRes.data.setting) {
            const s = psRes.data.setting;
            loadedPrint = {
              is_enabled: !!s.is_enabled,
              is_accepting_requests: s.is_accepting_requests !== false && s.is_accepting_requests !== 0,
              price_per_page: String(s.price_per_page),
              pickup_location: s.pickup_location || '',
              promptpay_number: s.promptpay_number || ''
            };
          }
        } catch { /* non-critical, keep defaults */ }
      }
      setPrintSettings(loadedPrint);
      setSaved({ form: loadedForm, links: cleanLinks(loadedLinks), print: loadedPrint });

      if (!silent) {
        // Load existing supplementary files (owner view)
        try {
          const filesRes = await cheatSheetFilesAPI.listForOwner(id);
          setSupplementaryFiles(filesRes.data.files || []);
        } catch { /* non-critical, keep empty */ }

        // Load existing collaborators
        try {
          const collabRes = await cheatSheetCollaboratorsAPI.listForOwner(id);
          setCollaborators(collabRes.data.collaborators || []);
        } catch { /* non-critical, keep empty */ }
      }
    } catch (error) {
      console.error('Error fetching cheat sheet:', error);
      toast.error(error.response?.data?.message || t('edit.toasts.loadFailed'));
      navigate('/');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id, user?.user_id, user?.is_admin, navigate, t]);

  useEffect(() => {
    fetchCheatSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
  // Values stay English (they're stored); labels are translated.
  const yearLevels = [1, 2, 3, 4].map(n => ({ value: `Year ${n}`, label: t('upload.yearN', { n }) }));
  const examTypes = [
    { value: 'Midterm', label: t('upload.examTypes.midterm'), icon: BookOpen },
    { value: 'Final', label: t('upload.examTypes.final'), icon: GraduationCap },
    { value: 'Quiz', label: t('upload.examTypes.quiz'), icon: ListChecks }
  ];

  // ---- unsaved changes, per tab
  const changed = (key) => saved && JSON.stringify(formData[key]) !== JSON.stringify(saved.form[key]);
  const dirtyTabs = saved ? {
    details: ['title', 'course_code', 'price', 'semester', 'academic_year', 'year_level', 'exam_types'].some(changed),
    description: changed('description'),
    files: !!(pdfFile || previewImageFile || preview3dFront || preview3dBack || remove3d),
    options: ['exclusive_content', 'full_preview_enabled', 'institution_restricted', 'release_at'].some(changed)
      || JSON.stringify(cleanLinks(youtubeLinks)) !== JSON.stringify(saved.links),
    print: isOwnerOrAdmin && JSON.stringify(printSettings) !== JSON.stringify(saved.print),
  } : {};
  const sheetDirty = !!(dirtyTabs.details || dirtyTabs.description || dirtyTabs.files || dirtyTabs.options);
  const isDirty = sheetDirty || !!dirtyTabs.print;

  // Warn before closing the tab or reloading with unsaved changes.
  useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // ---- validation (same rules as upload)
  const priceError = (() => {
    if (formData.price === '') return t('upload.errors.priceEmpty');
    const parsed = parseFloat(formData.price);
    if (Number.isNaN(parsed)) return t('upload.errors.priceNaN');
    if (parsed < 0) return t('upload.errors.priceNegative');
    if (parsed > 0 && parsed < MIN_PAID_PRICE) return t('upload.errors.priceMin', { min: MIN_PAID_PRICE });
    return null;
  })();
  const errors = {};
  if (!formData.title.trim()) errors.title = t('upload.errors.title');
  if (!formData.course_code.trim()) errors.course_code = t('upload.errors.courseEmpty');
  else if (!courseResolved) errors.course_code = t('upload.errors.courseUnconfirmed');
  if (priceError) errors.price = priceError;
  if (!formData.description.trim()) errors.description = t('upload.errors.description');

  const printInvalid = isOwnerOrAdmin && printSettings.is_enabled
    && (!printSettings.pickup_location.trim() || !printSettings.promptpay_number.trim() || !(parseFloat(printSettings.price_per_page) > 0));
  const errorTabs = {
    details: !!(errors.title || errors.course_code || errors.price),
    description: !!errors.description,
    print: !!printInvalid,
  };
  // Price is checked as soon as it's changed; the rest after a Save attempt.
  const visibleError = (field) => {
    if (field === 'price' && changed('price')) return errors.price;
    return attempted ? errors[field] : undefined;
  };

  const TABS = [
    { key: 'details', label: t('edit.tabs.details') },
    { key: 'description', label: t('upload.steps.description') },
    { key: 'files', label: t('upload.steps.files') },
    { key: 'options', label: t('upload.steps.options') },
    { key: 'people', label: t('edit.tabs.people') },
    ...(isOwnerOrAdmin ? [{ key: 'print', label: t('edit.tabs.print') }] : []),
  ];

  const switchTab = (key) => {
    setTab(key);
    const top = tabsRef.current?.getBoundingClientRect().top;
    if (top !== undefined && top < 64) {
      tabsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreviewImageSelect = (file) => {
    setPreviewImageFile(file);
    setPreviewImageUrl(file ? URL.createObjectURL(file) : originalPreviewImageUrl);
  };

  const saveSheet = async () => {
    let uploadToastId;
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'release_at') {
          submitData.append(key, formData[key] ? new Date(formData[key]).toISOString() : '');
        } else if (key === 'exam_types') {
          // Always sent, so clearing every type is saved too.
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'full_preview_enabled' || key === 'institution_restricted') {
          submitData.append(key, formData[key] ? 'true' : 'false');
        } else {
          // Sent even when empty so clearing a field (year level, exclusive
          // content, ...) is saved; the server ignores empty required ones.
          submitData.append(key, formData[key] ?? '');
        }
      });

      // Empty string clears the links server-side.
      const validLinks = cleanLinks(youtubeLinks);
      submitData.append('youtube_links', validLinks.length > 0 ? JSON.stringify(validLinks) : '');

      if (previewImageFile) {
        submitData.append('preview_image', previewImageFile);
      }
      if (preview3dFront) submitData.append('preview_3d_front', preview3dFront);
      if (preview3dBack) submitData.append('preview_3d_back', preview3dBack);
      if (remove3d && !preview3dFront && !preview3dBack) submitData.append('remove_preview_3d', 'true');

      if (pdfFile) {
        // Upload the PDF straight to GCS via a signed URL first — it never
        // passes through our API server this way, so it isn't subject to
        // Cloud Run's 32MB request-size limit.
        uploadToastId = toast.loading(t('edit.toasts.updating', { percent: 0 }));

        const { data: uploadUrlData } = await cheatSheetsAPI.getUploadUrl({
          course_code: formData.course_code,
          // Only used to name the uploaded file; the first type is the primary.
          exam_type: formData.exam_types[0] || '',
        });

        await axios.put(uploadUrlData.uploadUrl, pdfFile, {
          headers: { 'Content-Type': 'application/pdf' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            toast.loading(t('edit.toasts.updating', { percent: percentCompleted }), { id: uploadToastId });
          },
        });

        submitData.append('pdf_object_path', uploadUrlData.objectPath);
        if (whatsNew.trim()) submitData.append('whats_new', whatsNew.trim());

        toast.loading(t('upload.toasts.saving'), { id: uploadToastId });
        await cheatSheetsAPI.edit(id, submitData);
      } else if (previewImageFile || preview3dFront || preview3dBack) {
        uploadToastId = toast.loading(t('edit.toasts.updating', { percent: 0 }));
        await cheatSheetsAPI.edit(id, submitData, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          toast.loading(t('edit.toasts.updating', { percent: percentCompleted }), { id: uploadToastId });
        });
      } else {
        await cheatSheetsAPI.edit(id, submitData);
      }
    } finally {
      if (uploadToastId) toast.dismiss(uploadToastId);
    }
  };

  const savePrintSettings = () => printServiceAPI.saveSettings(id, {
    is_enabled: printSettings.is_enabled,
    is_accepting_requests: printSettings.is_accepting_requests,
    price_per_page: parseFloat(printSettings.price_per_page) || 2.75,
    pickup_location: printSettings.pickup_location,
    promptpay_number: printSettings.promptpay_number
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty || submitting) return;

    const firstErrorTab = ['details', 'description', 'print'].find(key => errorTabs[key]);
    if (firstErrorTab) {
      setAttempted(true);
      switchTab(firstErrorTab);
      toast.error(t('edit.toasts.fixErrors'));
      return;
    }

    setSubmitting(true);
    try {
      if (sheetDirty) await saveSheet();
      if (dirtyTabs.print) await savePrintSettings();
      toast.success(t('edit.toasts.saved'));
      setAttempted(false);
      // Reload so saved values, new file URLs, and version info are current.
      await fetchCheatSheet({ silent: true });
    } catch (error) {
      console.error('Error updating cheat sheet:', error);
      toast.error(error.response?.data?.message || t('edit.toasts.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscard = () => {
    if (!window.confirm(t('edit.confirmDiscard'))) return;
    setAttempted(false);
    fetchCheatSheet({ silent: true });
  };

  const handleViewSheet = (e) => {
    if (isDirty && !window.confirm(t('edit.confirmLeave'))) e.preventDefault();
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  const releasePassed = !!(saved?.form.release_at && new Date(saved.form.release_at) <= new Date());
  // Full Preview is "coming soon" for new sheets; one that already has it on
  // can still switch it off.
  const fullPreviewLocked = !saved?.form.full_preview_enabled;

  return (
    <Container>
      <EditCard>
        <Header>
          <div style={{ minWidth: 0 }}>
            <Title>{t('edit.title')}</Title>
            <Subtitle>{saved?.form.title}</Subtitle>
          </div>
          <ViewLink to={`/cheatsheet/${id}`} onClick={handleViewSheet}>
            {t('edit.viewSheet')}<ExternalLink size={14} />
          </ViewLink>
        </Header>

        <Tabs ref={tabsRef} role="tablist" aria-label={t('edit.tabsLabel')} style={{ scrollMarginTop: '80px' }}>
          {TABS.map(({ key, label }) => {
            const hasError = attempted && errorTabs[key];
            return (
              <Tab
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                $active={tab === key}
                onClick={() => switchTab(key)}
              >
                {label}
                {(hasError || dirtyTabs[key]) && (
                  <TabMarker $error={hasError} aria-label={hasError ? t('edit.hasErrors') : t('edit.hasChanges')} />
                )}
              </Tab>
            );
          })}
        </Tabs>

        <form onSubmit={handleSubmit} noValidate>
          {tab === 'details' && (
            <Section>
              <FormGroup>
                <Label htmlFor="edit-title">{t('upload.basics.title')} <span>*</span></Label>
                <ValidatedInput
                  id="edit-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={t('upload.basics.titlePlaceholder')}
                  aria-invalid={!!visibleError('title')}
                />
                {visibleError('title') && <FieldError>{visibleError('title')}</FieldError>}
              </FormGroup>

              <Row>
                <FormGroup>
                  <Label>{t('upload.basics.courseCode')} <span>*</span></Label>
                  <CourseCodeField
                    value={formData.course_code}
                    initiallyResolved={courseResolved}
                    onChange={(newCode) => {
                      setCourseResolved(false);
                      setFormData(prev => ({ ...prev, course_code: newCode }));
                    }}
                    onResolved={() => setCourseResolved(true)}
                    placeholder={t('upload.basics.coursePlaceholder')}
                  />
                  {visibleError('course_code') && <FieldError>{visibleError('course_code')}</FieldError>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="edit-price">{t('upload.basics.price')} <span>*</span></Label>
                  <ValidatedInput
                    id="edit-price"
                    type="number"
                    name="price"
                    placeholder={t('upload.basics.pricePlaceholder')}
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={formData.price}
                    onChange={handleInputChange}
                    aria-invalid={!!visibleError('price')}
                  />
                  {visibleError('price')
                    ? <FieldError>{visibleError('price')}</FieldError>
                    : <HelpText>{t('upload.basics.priceHelp', { min: MIN_PAID_PRICE })}</HelpText>}
                </FormGroup>
              </Row>

              <Row>
                <FormGroup>
                  <Label>{t('upload.basics.semester')}</Label>
                  <Select name="semester" aria-label={t('upload.basics.semester')} value={formData.semester} onChange={handleInputChange}>
                    <option value="">{t('upload.basics.semesterPlaceholder')}</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3 (Summer)">{t('upload.basics.summer')}</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>{t('upload.basics.academicYear')}</Label>
                  <Select name="academic_year" aria-label={t('upload.basics.academicYear')} value={formData.academic_year} onChange={handleInputChange}>
                    <option value="">{t('upload.basics.academicYearPlaceholder')}</option>
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Select>
                </FormGroup>
              </Row>

              <FormGroup>
                <Label>{t('upload.basics.yearLevel')}</Label>
                <PillSelect
                  ariaLabel={t('upload.basics.yearLevel')}
                  options={yearLevels}
                  value={formData.year_level}
                  onChange={(value) => setFormData(prev => ({ ...prev, year_level: value }))}
                  clearable
                />
                <HelpText>{t('upload.basics.yearLevelHelp')}</HelpText>
              </FormGroup>

              <FormGroup>
                <Label>{t('upload.basics.examType')}</Label>
                <PillSelect
                  ariaLabel={t('upload.basics.examType')}
                  options={examTypes}
                  value={formData.exam_types}
                  onChange={(value) => setFormData(prev => ({ ...prev, exam_types: value }))}
                  multiple
                />
                <HelpText>{t('upload.basics.examTypeHelp')}</HelpText>
              </FormGroup>
            </Section>
          )}

          {tab === 'description' && (
            <Section>
              <SectionHeader>
                <SectionDescription>{t('upload.descriptionStep.description')}</SectionDescription>
              </SectionHeader>
              <MarkdownEditorField
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              />
              {visibleError('description') && <FieldError>{visibleError('description')}</FieldError>}
            </Section>
          )}

          {tab === 'files' && (
            <Section>
              <FileUploadField
                label={<><FileText size={15} />{t('edit.files.pdf')}</>}
                accept="application/pdf"
                maxSizeBytes={200 * 1024 * 1024}
                selectedFile={pdfFile}
                onFileSelect={(file) => {
                  setPdfFile(file);
                  if (!file) setWhatsNew('');
                }}
                helpText={t('edit.files.pdfHelp')}
              />

              {pdfFile && (
                <FormGroup>
                  <Label><Sparkles size={15} />{t('edit.files.whatsNew')}</Label>
                  <TextArea
                    value={whatsNew}
                    onChange={(e) => setWhatsNew(e.target.value.slice(0, WHATS_NEW_MAX))}
                    placeholder={t('edit.files.whatsNewPlaceholder')}
                    rows={4}
                    maxLength={WHATS_NEW_MAX}
                  />
                  <HelpText>
                    {t('edit.files.whatsNewHelp')}
                    {' '}{whatsNew.length}/{WHATS_NEW_MAX}
                  </HelpText>
                </FormGroup>
              )}

              <FileUploadField
                label={<><ImageIcon size={15} />{t('upload.filesStep.previewImage')}</>}
                accept="image/*"
                maxSizeBytes={5 * 1024 * 1024}
                selectedFile={previewImageFile}
                onFileSelect={handlePreviewImageSelect}
                existingFileUrl={previewImageUrl}
                helpText={t('upload.filesStep.previewImageHelp')}
              />

              <Preview3DUploadFields
                front={preview3dFront}
                back={preview3dBack}
                onFrontChange={(file) => { setPreview3dFront(file); if (file) setRemove3d(false); }}
                onBackChange={(file) => { setPreview3dBack(file); if (file) setRemove3d(false); }}
                existingFrontUrl={existing3d.front}
                existingBackUrl={existing3d.back}
                removed={remove3d}
                onRemove={() => setRemove3d(true)}
              />

              <SupplementaryFilesField
                cheatsheetId={id}
                existingFiles={supplementaryFiles}
                onExistingFilesChange={setSupplementaryFiles}
                pendingFiles={[]}
                onPendingFilesChange={() => {}}
                disabled={submitting}
              />
              <InstantNote>{t('edit.files.attachmentsInstant')}</InstantNote>
            </Section>
          )}

          {tab === 'options' && (
            <Section>
              <YoutubeLinksField
                links={youtubeLinks}
                onChange={setYoutubeLinks}
              />

              <FormGroup>
                <Label><Lock size={15} />{t('upload.optionsStep.exclusive')}</Label>
                <TextArea
                  name="exclusive_content"
                  placeholder={t('upload.optionsStep.exclusivePlaceholder')}
                  value={formData.exclusive_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, exclusive_content: e.target.value }))}
                  rows={4}
                />
                <HelpText>{t('upload.optionsStep.exclusiveHelp')}</HelpText>
              </FormGroup>

              <FormGroup>
                <Label>
                  <Eye size={15} />{t('upload.optionsStep.fullPreview')}
                  {fullPreviewLocked && <StatusPill>{t('cheatSheetForm.comingSoon')}</StatusPill>}
                </Label>
                <ToggleSwitch
                  checked={formData.full_preview_enabled}
                  disabled={fullPreviewLocked}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_preview_enabled: e.target.checked }))}
                  label={(checked) => checked ? t('edit.options.fullPreviewOn') : t('upload.optionsStep.fullPreviewOff')}
                  helpText={fullPreviewLocked ? t('upload.optionsStep.fullPreviewHelp') : t('edit.options.fullPreviewLegacyHelp')}
                />
              </FormGroup>

              <FormGroup>
                <Label><Building2 size={15} />{t('upload.optionsStep.institutionOnly')}</Label>
                <ToggleSwitch
                  checked={formData.institution_restricted}
                  disabled={!cheatSheetInstitutionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, institution_restricted: e.target.checked }))}
                  label={(checked) => checked ? t('upload.optionsStep.restricted') : t('upload.optionsStep.everyone')}
                  helpText={cheatSheetInstitutionId
                    ? t('upload.optionsStep.restrictedHelp')
                    : t('edit.options.noInstitutionHelp')}
                />
              </FormGroup>

              <FormGroup>
                <Label><Clock size={15} />{t('upload.optionsStep.releaseDate')}</Label>
                <Input
                  type="datetime-local"
                  name="release_at"
                  value={formData.release_at}
                  onChange={handleInputChange}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  disabled={releasePassed}
                />
                <HelpText>
                  {releasePassed ? t('edit.options.releasePassed') : t('edit.options.releaseHelp')}
                </HelpText>
              </FormGroup>
            </Section>
          )}

          {tab === 'people' && (
            <Section>
              <CollaboratorsField
                cheatsheetId={id}
                existingCollaborators={collaborators}
                onExistingCollaboratorsChange={setCollaborators}
                pendingEmails={[]}
                onPendingEmailsChange={() => {}}
                disabled={submitting}
              />
              <InstantNote>{t('edit.people.instant')}</InstantNote>
            </Section>
          )}

          {tab === 'print' && isOwnerOrAdmin && (
            <Section>
              <SectionHeader>
                <SectionTitle>{t('edit.print.title')}</SectionTitle>
                <SectionDescription>{t('edit.print.description')}</SectionDescription>
              </SectionHeader>

              <ToggleSwitch
                checked={printSettings.is_enabled}
                onChange={(e) => setPrintSettings(p => ({ ...p, is_enabled: e.target.checked }))}
                label={(checked) => checked ? t('edit.print.enabled') : t('edit.print.disabled')}
              />

              {printSettings.is_enabled && (
                <>
                  <PrintSettingsGrid>
                    <FormGroup>
                      <Label htmlFor="print-price">{t('edit.print.pricePerPage')} <span>*</span></Label>
                      <ValidatedInput
                        id="print-price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        max="999.99"
                        value={printSettings.price_per_page}
                        onChange={(e) => setPrintSettings(p => ({ ...p, price_per_page: e.target.value }))}
                        placeholder="2.75"
                        aria-invalid={attempted && !(parseFloat(printSettings.price_per_page) > 0)}
                      />
                      <HelpText>{t('edit.print.pricePerPageHelp')}</HelpText>
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="print-promptpay">{t('edit.print.promptpay')} <span>*</span></Label>
                      <ValidatedInput
                        id="print-promptpay"
                        type="text"
                        maxLength={10}
                        value={printSettings.promptpay_number}
                        onChange={(e) => setPrintSettings(p => ({ ...p, promptpay_number: e.target.value }))}
                        placeholder="0812345678"
                        aria-invalid={attempted && !printSettings.promptpay_number.trim()}
                      />
                      <HelpText>{t('edit.print.promptpayHelp')}</HelpText>
                    </FormGroup>
                  </PrintSettingsGrid>

                  <FormGroup>
                    <Label htmlFor="print-location">{t('edit.print.pickup')} <span>*</span></Label>
                    <ValidatedInput
                      id="print-location"
                      type="text"
                      value={printSettings.pickup_location}
                      onChange={(e) => setPrintSettings(p => ({ ...p, pickup_location: e.target.value }))}
                      placeholder={t('edit.print.pickupPlaceholder')}
                      aria-invalid={attempted && !printSettings.pickup_location.trim()}
                    />
                  </FormGroup>

                  {attempted && printInvalid && <FieldError>{t('edit.print.required')}</FieldError>}

                  <ToggleSwitch
                    checked={printSettings.is_accepting_requests}
                    onChange={(e) => setPrintSettings(p => ({ ...p, is_accepting_requests: e.target.checked }))}
                    label={(checked) => checked ? t('edit.print.accepting') : t('edit.print.notAccepting')}
                    helpText={t('edit.print.acceptingHelp')}
                  />
                </>
              )}
            </Section>
          )}

          <SaveBar>
            <SaveStatus $dirty={isDirty} aria-live="polite">
              {isDirty ? t('edit.unsaved') : t('edit.allSaved')}
            </SaveStatus>
            <SaveActions>
              {isDirty && (
                <Button type="button" $size="sm" onClick={handleDiscard} disabled={submitting}>
                  {t('edit.discard')}
                </Button>
              )}
              <Button type="submit" $variant="primary" $size="sm" disabled={!isDirty || submitting}>
                {submitting ? t('edit.saving') : t('edit.save')}
              </Button>
            </SaveActions>
          </SaveBar>
        </form>
      </EditCard>
    </Container>
  );
}

export default EditCheatSheet;

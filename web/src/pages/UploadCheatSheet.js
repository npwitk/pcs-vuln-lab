import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { cheatSheetsAPI, cheatSheetFilesAPI, cheatSheetCollaboratorsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import CourseCodeField from '../components/CourseCodeField';
import { useAuth } from '../context/AuthContext';
import { Card, Section, SectionHeader, SectionTitle, SectionDescription } from '../components/ui/Card';
import StatusPill from '../components/ui/StatusPill';
import { FormGroup, Label, HelpText, Row } from '../components/ui/FormGroup';
import { Input, Select, TextArea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import PillSelect from '../components/ui/PillSelect';
import { BookOpen, GraduationCap, ListChecks, FileText, Image as ImageIcon, Lock, Eye, Building2, Clock, User, Users, ArrowLeft, ArrowRight } from 'lucide-react';
import MarkdownEditorField from '../components/cheatsheet-form/MarkdownEditorField';
import FileUploadField from '../components/cheatsheet-form/FileUploadField';
import YoutubeLinksField from '../components/cheatsheet-form/YoutubeLinksField';
import SupplementaryFilesField from '../components/cheatsheet-form/SupplementaryFilesField';
import CollaboratorsField from '../components/cheatsheet-form/CollaboratorsField';
import { MIN_PAID_PRICE } from '../constants/cheatSheetLimits';
import usePageMeta from '../hooks/usePageMeta';
import { useTranslation } from 'react-i18next';
import Preview3DUploadFields from '../components/cheatsheet-form/Preview3DUploadFields';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  font-size: ${props => props.theme.typography.sizes.base};
`;

// Step progress: one labelled segment per step. Steps already reached can be
// clicked to jump back; later ones can't be skipped to.
const Steps = styled.ol`
  display: grid;
  grid-template-columns: repeat(${props => props.$count}, minmax(0, 1fr));
  gap: 0.375rem;
  list-style: none;
  margin: 0 0 2rem;
  padding: 0;
`;

const StepButton = styled.button`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
  background: none;
  border: none;
  text-align: left;
  font: inherit;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};

  &::before {
    content: '';
    height: 4px;
    border-radius: ${props => props.theme.radius.full};
    background: ${props => props.$state === 'todo' ? props.theme.colors.borderLight : props.theme.colors.primary};
    opacity: ${props => props.$state === 'done' ? 0.45 : 1};
    transition: background-color 0.25s ease, opacity 0.25s ease;
  }
`;

const StepLabel = styled.span`
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.$state === 'current' ? props.theme.typography.weights.semibold : props.theme.typography.weights.medium};
  color: ${props => props.$state === 'current'
    ? props.theme.colors.text
    : props.$state === 'done' ? props.theme.colors.textSecondary : props.theme.colors.textTertiary};

  /* Five labels don't fit a phone; show only the current step's. */
  @media (max-width: 600px) {
    display: ${props => props.$state === 'current' ? 'inline' : 'none'};
    white-space: nowrap;
  }
`;

const StepCount = styled.span`
  color: ${props => props.theme.colors.textTertiary};
  font-weight: ${props => props.theme.typography.weights.medium};
  margin-right: 0.375rem;

  @media (min-width: 601px) {
    display: none;
  }
`;

// "Who made this?" choices: two large tappable cards instead of a toggle.
const ChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ChoiceCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1.25rem;
  text-align: left;
  font: inherit;
  color: ${props => props.theme.colors.text};
  background: ${props => props.$selected ? props.theme.colors.primaryLight : props.theme.colors.surface};
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  cursor: pointer;
  transition: border-color ${props => props.theme.transitions.fast}, background-color ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.$selected ? props.theme.colors.primary : props.theme.colors.textTertiary};
  }

  svg {
    color: ${props => props.$selected ? props.theme.colors.primary : props.theme.colors.textSecondary};
  }
`;

const ChoiceTitle = styled.span`
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
`;

const ChoiceText = styled.span`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.45;
`;

// Inline validation: red border on the field plus a message under it.
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.borderLight};

  button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

// Labels live under upload.steps.<key>.
const STEPS = ['who', 'basics', 'description', 'files', 'options'];
const LAST_STEP = STEPS.length - 1;

const UploadCheatSheet = () => {
  const { t } = useTranslation();
  usePageMeta(t('upload.pageTitle'));
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
  const [preview3dFront, setPreview3dFront] = useState(null);
  const [preview3dBack, setPreview3dBack] = useState(null);
  const [youtubeLinks, setYoutubeLinks] = useState(['']);
  const [courseResolved, setCourseResolved] = useState(false);
  const [pendingSupplementaryFiles, setPendingSupplementaryFiles] = useState([]);
  const [isGroupUpload, setIsGroupUpload] = useState(false);
  const [pendingCollaborators, setPendingCollaborators] = useState([]);
  const [step, setStep] = useState(0);
  // Furthest step reached, so the progress bar can jump back to any of them.
  const [maxStep, setMaxStep] = useState(0);
  // Steps where Next was pressed: their empty required fields show errors
  // from then on (before that, only a price already typed is checked).
  const [attempted, setAttempted] = useState(() => new Set());
  const cardRef = useRef(null);
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

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const yearLevels = [
    // Values stay English (they're stored); labels are translated.
    { value: 'Year 1', label: t('upload.yearN', { n: 1 }) },
    { value: 'Year 2', label: t('upload.yearN', { n: 2 }) },
    { value: 'Year 3', label: t('upload.yearN', { n: 3 }) },
    { value: 'Year 4', label: t('upload.yearN', { n: 4 }) }
  ];
  const examTypes = [
    { value: 'Midterm', label: t('upload.examTypes.midterm'), icon: BookOpen },
    { value: 'Final', label: t('upload.examTypes.final'), icon: GraduationCap },
    { value: 'Quiz', label: t('upload.examTypes.quiz'), icon: ListChecks }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const priceError = (() => {
    if (formData.price === '') return t('upload.errors.priceEmpty');
    const parsed = parseFloat(formData.price);
    if (Number.isNaN(parsed)) return t('upload.errors.priceNaN');
    if (parsed < 0) return t('upload.errors.priceNegative');
    if (parsed > 0 && parsed < MIN_PAID_PRICE) return t('upload.errors.priceMin', { min: MIN_PAID_PRICE });
    return null;
  })();

  // Required-field errors per step; null when the step is complete.
  const stepErrors = (index) => {
    const errors = {};
    if (index === 1) {
      if (!formData.title.trim()) errors.title = t('upload.errors.title');
      if (!formData.course_code) errors.course_code = t('upload.errors.courseEmpty');
      else if (!courseResolved) errors.course_code = t('upload.errors.courseUnconfirmed');
      if (priceError) errors.price = priceError;
    }
    if (index === 2 && !formData.description.trim()) errors.description = t('upload.errors.description');
    if (index === 3 && !selectedFile) errors.file = t('upload.errors.file');
    return Object.keys(errors).length ? errors : null;
  };

  const errors = stepErrors(step) || {};
  const showAll = attempted.has(step);
  // Price is checked as soon as something's typed; the rest only after Next.
  const visibleError = (field) => {
    if (field === 'price' && formData.price !== '') return errors.price;
    return showAll ? errors[field] : undefined;
  };

  const goToStep = (index) => {
    setStep(index);
    setMaxStep(prev => Math.max(prev, index));
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNext = () => {
    if (stepErrors(step)) {
      setAttempted(prev => new Set(prev).add(step));
      // Bring the first problem into view once it has rendered.
      requestAnimationFrame(() => {
        cardRef.current?.querySelector('[aria-invalid="true"], [data-field-error]')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }
    goToStep(step + 1);
  };

  // Enter in a field moves to the next step instead of uploading early.
  const handleFormSubmit = (e) => {
    if (step < LAST_STEP) {
      e.preventDefault();
      handleNext();
      return;
    }
    handleSubmit(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.course_code || !formData.price) {
      toast.error(t('upload.toasts.requiredFields'));
      return;
    }

    if (!courseResolved) {
      toast.error(t('upload.toasts.confirmCourse'));
      return;
    }

    if (!selectedFile) {
      toast.error(t('upload.toasts.selectPdf'));
      return;
    }

    const parsedPrice = parseFloat(formData.price);
    if (parsedPrice < 0 || (parsedPrice > 0 && parsedPrice < MIN_PAID_PRICE)) {
      toast.error(t('upload.toasts.priceMin', { min: MIN_PAID_PRICE }));
      return;
    }

    setLoading(true);
    let uploadToastId;

    try {
      // Upload the PDF straight to GCS via a signed URL first — it never
      // passes through our API server this way, so it isn't subject to
      // Cloud Run's 32MB request-size limit.
      uploadToastId = toast.loading(t('upload.toasts.uploading', { percent: 0 }));

      const { data: uploadUrlData } = await cheatSheetsAPI.getUploadUrl({
        course_code: formData.course_code,
        // Only used to name the uploaded file; the first type is the primary.
        exam_type: formData.exam_types[0] || '',
      });

      await axios.put(uploadUrlData.uploadUrl, selectedFile, {
        headers: { 'Content-Type': 'application/pdf' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          toast.loading(t('upload.toasts.uploading', { percent: percentCompleted }), { id: uploadToastId });
        },
      });

      toast.loading(t('upload.toasts.saving'), { id: uploadToastId });

      const uploadData = new FormData();
      uploadData.append('pdf_object_path', uploadUrlData.objectPath);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('course_code', formData.course_code);
      uploadData.append('price', formData.price);

      if (formData.semester) uploadData.append('semester', formData.semester);
      if (formData.academic_year) uploadData.append('academic_year', formData.academic_year);
      if (formData.year_level) uploadData.append('year_level', formData.year_level);
      uploadData.append('exam_types', JSON.stringify(formData.exam_types));
      if (selectedPreviewImage) uploadData.append('preview_image', selectedPreviewImage);
      if (preview3dFront) uploadData.append('preview_3d_front', preview3dFront);
      if (preview3dBack) uploadData.append('preview_3d_back', preview3dBack);

      const validLinks = youtubeLinks.filter(link => link.trim() !== '');
      if (validLinks.length > 0) {
        uploadData.append('youtube_links', JSON.stringify(validLinks));
      }

      if (formData.exclusive_content.trim()) {
        uploadData.append('exclusive_content', formData.exclusive_content.trim());
      }

      if (formData.release_at) {
        uploadData.append('release_at', new Date(formData.release_at).toISOString());
      }

      uploadData.append('full_preview_enabled', formData.full_preview_enabled ? 'true' : 'false');
      uploadData.append('institution_restricted', formData.institution_restricted ? 'true' : 'false');

      const response = await cheatSheetsAPI.create(uploadData);
      const newId = response.data.cheat_sheet.cheatsheet_id;

      // The cheat sheet row now exists, so queued supplementary files (which
      // couldn't be uploaded earlier — they need a real cheatsheet_id to
      // attach to) can go up now. Sequential, not parallel, so the toast
      // can report an accurate "N of M" and one failure doesn't strand
      // concurrent uploads. A per-file failure is only toasted — it
      // shouldn't block navigation, since attachments can always be added
      // later via Edit.
      if (pendingSupplementaryFiles.length > 0) {
        for (let i = 0; i < pendingSupplementaryFiles.length; i++) {
          const pf = pendingSupplementaryFiles[i];
          toast.loading(t('upload.toasts.uploadingAttachment', { current: i + 1, total: pendingSupplementaryFiles.length }), { id: uploadToastId });
          try {
            const { data: fileUploadUrlData } = await cheatSheetFilesAPI.getUploadUrl(newId, pf.file.name);
            await axios.put(fileUploadUrlData.uploadUrl, pf.file, {
              headers: { 'Content-Type': pf.file.type || 'application/octet-stream' },
            });
            await cheatSheetFilesAPI.register(newId, {
              object_path: fileUploadUrlData.objectPath,
              original_filename: pf.file.name,
            });
          } catch (fileError) {
            console.error('Supplementary file upload failed:', fileError);
            toast.error(t('upload.toasts.attachmentFailed', { name: pf.file.name }));
          }
        }
      }

      if (pendingCollaborators.length > 0) {
        for (let i = 0; i < pendingCollaborators.length; i++) {
          const email = pendingCollaborators[i];
          toast.loading(t('upload.toasts.addingCollaborator', { current: i + 1, total: pendingCollaborators.length }), { id: uploadToastId });
          try {
            await cheatSheetCollaboratorsAPI.add(newId, { email });
          } catch (collabError) {
            console.error('Failed to add collaborator:', collabError);
            toast.error(collabError.response?.data?.message || t('upload.toasts.collaboratorFailed', { email }));
          }
        }
      }

      toast.dismiss(uploadToastId);
      toast.success(t('upload.toasts.uploaded'));

      setTimeout(() => {
        navigate(`/cheatsheet/${newId}`);
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      if (uploadToastId) toast.dismiss(uploadToastId);
      toast.error(error.response?.data?.message || t('upload.toasts.uploadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm(t('upload.confirmCancel'))) {
      navigate('/admin');
    }
  };

  const stepState = (index) => (index === step ? 'current' : index < step || index <= maxStep ? 'done' : 'todo');

  return (
    <Container>
      <Card ref={cardRef} style={{ scrollMarginTop: '80px' }}>
        <Title>{t('upload.title')}</Title>
        <Subtitle>{t('upload.subtitle')}</Subtitle>

        <Steps $count={STEPS.length} aria-label={t('upload.stepsLabel')}>
          {STEPS.map((key, index) => (
            <li key={key}>
              <StepButton
                type="button"
                $state={stepState(index)}
                disabled={index > maxStep || index === step || loading}
                onClick={() => goToStep(index)}
                aria-current={index === step ? 'step' : undefined}
              >
                <StepLabel $state={stepState(index)}>
                  <StepCount>{index + 1}/{STEPS.length}</StepCount>
                  {t(`upload.steps.${key}`)}
                </StepLabel>
              </StepButton>
            </li>
          ))}
        </Steps>

        <form onSubmit={handleFormSubmit} noValidate>
          {step === 0 && (
            <Section>
              <SectionHeader>
                <SectionTitle>{t('upload.who.title')}</SectionTitle>
                <SectionDescription>{t('upload.who.description')}</SectionDescription>
              </SectionHeader>

              <ChoiceGrid role="radiogroup" aria-label={t('upload.who.title')}>
                <ChoiceCard
                  type="button"
                  role="radio"
                  aria-checked={!isGroupUpload}
                  $selected={!isGroupUpload}
                  onClick={() => setIsGroupUpload(false)}
                >
                  <User size={22} />
                  <ChoiceTitle>{t('upload.who.solo')}</ChoiceTitle>
                  <ChoiceText>{t('upload.who.soloText')}</ChoiceText>
                </ChoiceCard>
                <ChoiceCard
                  type="button"
                  role="radio"
                  aria-checked={isGroupUpload}
                  $selected={isGroupUpload}
                  onClick={() => setIsGroupUpload(true)}
                >
                  <Users size={22} />
                  <ChoiceTitle>{t('upload.who.group')}</ChoiceTitle>
                  <ChoiceText>{t('upload.who.groupText')}</ChoiceText>
                </ChoiceCard>
              </ChoiceGrid>

              {isGroupUpload && (
                <CollaboratorsField
                  cheatsheetId={null}
                  existingCollaborators={[]}
                  onExistingCollaboratorsChange={() => {}}
                  pendingEmails={pendingCollaborators}
                  onPendingEmailsChange={setPendingCollaborators}
                  disabled={loading}
                />
              )}
            </Section>
          )}

          {step === 1 && (
            <Section>
              <SectionHeader>
                <SectionTitle>{t('upload.steps.basics')}</SectionTitle>
                <SectionDescription>{t('upload.basics.description')}</SectionDescription>
              </SectionHeader>

              <FormGroup>
                <Label htmlFor="upload-title">{t('upload.basics.title')} <span>*</span></Label>
                <ValidatedInput
                  id="upload-title"
                  type="text"
                  name="title"
                  placeholder={t('upload.basics.titlePlaceholder')}
                  value={formData.title}
                  onChange={handleInputChange}
                  aria-invalid={!!visibleError('title')}
                />
                {visibleError('title') && <FieldError>{visibleError('title')}</FieldError>}
              </FormGroup>

              <Row>
                <FormGroup>
                  <Label>{t('upload.basics.courseCode')} <span>*</span></Label>
                  <CourseCodeField
                    value={formData.course_code}
                    onChange={(newCode) => {
                      setCourseResolved(false);
                      setFormData(prev => ({ ...prev, course_code: newCode }));
                    }}
                    onResolved={() => setCourseResolved(true)}
                    initiallyResolved={courseResolved}
                    placeholder={t('upload.basics.coursePlaceholder')}
                  />
                  {visibleError('course_code') && <FieldError data-field-error>{visibleError('course_code')}</FieldError>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="upload-price">{t('upload.basics.price')} <span>*</span></Label>
                  <ValidatedInput
                    id="upload-price"
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

          {step === 2 && (
            <Section>
              <SectionHeader>
                <SectionTitle>{t('upload.steps.description')}</SectionTitle>
                <SectionDescription>{t('upload.descriptionStep.description')}</SectionDescription>
              </SectionHeader>

              <MarkdownEditorField
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              />
              {visibleError('description') && <FieldError data-field-error>{visibleError('description')}</FieldError>}
            </Section>
          )}

          {step === 3 && (
            <Section>
              <SectionHeader>
                <SectionTitle>{t('upload.steps.files')}</SectionTitle>
                <SectionDescription>{t('upload.filesStep.description')}</SectionDescription>
              </SectionHeader>

              <div>
                <FileUploadField
                  label={<><FileText size={15} />{t('upload.filesStep.pdf')}</>}
                  required
                  accept="application/pdf"
                  maxSizeBytes={200 * 1024 * 1024}
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                  helpText={t('upload.filesStep.pdfHelp')}
                />
                {visibleError('file') && <FieldError data-field-error style={{ marginTop: '0.5rem' }}>{visibleError('file')}</FieldError>}
              </div>

              <FileUploadField
                label={<><ImageIcon size={15} />{t('upload.filesStep.previewImage')}</>}
                accept="image/*"
                maxSizeBytes={5 * 1024 * 1024}
                selectedFile={selectedPreviewImage}
                onFileSelect={setSelectedPreviewImage}
                helpText={t('upload.filesStep.previewImageHelp')}
              />

              <Preview3DUploadFields
                front={preview3dFront}
                back={preview3dBack}
                onFrontChange={setPreview3dFront}
                onBackChange={setPreview3dBack}
              />

              <SupplementaryFilesField
                cheatsheetId={null}
                existingFiles={[]}
                onExistingFilesChange={() => {}}
                pendingFiles={pendingSupplementaryFiles}
                onPendingFilesChange={setPendingSupplementaryFiles}
                disabled={loading}
              />
            </Section>
          )}

          {step === 4 && (
            <Section>
              <SectionHeader>
                <SectionTitle>{t('upload.steps.options')}</SectionTitle>
                <SectionDescription>{t('upload.optionsStep.description')}</SectionDescription>
              </SectionHeader>

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
                <HelpText>
                  {t('upload.optionsStep.exclusiveHelp')}
                </HelpText>
              </FormGroup>

              <FormGroup>
                <Label><Eye size={15} />{t('upload.optionsStep.fullPreview')}<StatusPill>{t('cheatSheetForm.comingSoon')}</StatusPill></Label>
                <ToggleSwitch
                  checked={false}
                  disabled
                  onChange={() => {}}
                  label={t('upload.optionsStep.fullPreviewOff')}
                  helpText={t('upload.optionsStep.fullPreviewHelp')}
                />
              </FormGroup>

              <FormGroup>
                <Label><Building2 size={15} />{t('upload.optionsStep.institutionOnly')}</Label>
                <ToggleSwitch
                  checked={formData.institution_restricted}
                  disabled={!user?.institution_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, institution_restricted: e.target.checked }))}
                  label={(checked) => checked ? t('upload.optionsStep.restricted') : t('upload.optionsStep.everyone')}
                  helpText={user?.institution_id
                    ? t('upload.optionsStep.restrictedHelp')
                    : t('upload.optionsStep.noInstitutionHelp')}
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
                />
                <HelpText>
                  {t('upload.optionsStep.releaseDateHelp')}
                </HelpText>
              </FormGroup>
            </Section>
          )}

          <ButtonGroup>
            {step === 0 ? (
              <Button key="cancel" type="button" onClick={handleCancel}>
                {t('upload.cancel')}
              </Button>
            ) : (
              <Button key="back" type="button" onClick={() => goToStep(step - 1)} disabled={loading}>
                <ArrowLeft size={16} />{t('upload.back')}
              </Button>
            )}
            {/* Distinct keys so React never reuses the Next button as the
                submit button mid-click, which would upload immediately. */}
            {step < LAST_STEP ? (
              <Button key="next" type="button" $variant="primary" onClick={handleNext}>
                {t('upload.next')}<ArrowRight size={16} />
              </Button>
            ) : (
              <Button key="submit" type="submit" $variant="primary" disabled={loading}>
                {loading ? t('upload.submitting') : t('upload.submit')}
              </Button>
            )}
          </ButtonGroup>
        </form>
      </Card>
    </Container>
  );
};

export default UploadCheatSheet;

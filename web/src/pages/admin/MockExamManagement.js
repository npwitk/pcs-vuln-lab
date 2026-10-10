import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { mockExamsAPI, institutionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Plus, Edit2, Trash2, X, Lock, Unlock, Eye, EyeOff, FileText, Upload, Link2 } from 'lucide-react';
import CourseCodeField from '../../components/CourseCodeField';
import Breadcrumbs from '../../components/ui/Breadcrumb';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

const TableWrapper = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.theme.colors.border};
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.textSecondary};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 1rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  vertical-align: middle;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  background: ${props =>
    props.$type === 'Midterm' ? '#EFF6FF' :
    props.$type === 'Final' ? '#FFF7ED' :
    props.$type === 'locked' ? '#FEF2F2' :
    props.$type === 'free' ? '#F0FDF4' :
    '#F3F4F6'};
  color: ${props =>
    props.$type === 'Midterm' ? '#1D4ED8' :
    props.$type === 'Final' ? '#C2410C' :
    props.$type === 'locked' ? '#DC2626' :
    props.$type === 'free' ? '#16A34A' :
    '#6B7280'};
`;

const Toggle = styled.button`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background ${props => props.theme.transitions.fast};
  background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.borderLight};

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$active ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: left ${props => props.theme.transitions.fast};
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => props.$danger ? '#FEF2F2' : props.theme.colors.primaryLight};
  color: ${props => props.$danger ? '#DC2626' : props.theme.colors.primary};
  &:hover {
    background: ${props => props.$danger ? '#FEE2E2' : props.theme.colors.primary + '26'};
    transform: translateY(-1px);
  }
`;

const ModeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  border: 1px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text};
  cursor: pointer;
  font-size: ${props => props.theme.typography.sizes.sm};
  transition: all ${props => props.theme.transitions.fast};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

// Modal
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  padding: 2rem;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.xl};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes['2xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  padding: 0.25rem;
  border-radius: ${props => props.theme.radius.sm};
  &:hover { color: ${props => props.theme.colors.text}; }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.375rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.background};
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.background};
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const PasswordWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  padding: 0;
  display: flex;
  align-items: center;
  &:hover { color: ${props => props.theme.colors.text}; }
`;

const HelpText = styled.p`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background ${props => props.theme.transitions.fast};
  &:hover { background: ${props => props.theme.colors.primaryHover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const BLANK_FORM = {
  course_code: '',
  course_name: '',
  exam_type: 'Midterm',
  year_display: '3rd Year',
  semester: '1st Semester',
  accuracy: 2,
  exam_date: '',
  access_password: '',
  is_active: true,
  institution_id: '',
};

export default function MockExamManagement() {
  const { user } = useAuth();
  // Each institution has its own set of mock exams (migration 079).
  const [institutions, setInstitutions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [courseResolved, setCourseResolved] = useState(false);

  // File manager (question papers / answer keys) — a separate panel from
  // the metadata modal above, since files are managed per-exam after it
  // already exists.
  const [managingExam, setManagingExam] = useState(null);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [addFileForm, setAddFileForm] = useState({ kind: 'question', label: '', mode: 'upload', url: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [addingFile, setAddingFile] = useState(false);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await mockExamsAPI.adminGetAll();
      setExams(res.data.exams || []);
    } catch {
      toast.error('Failed to load mock exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExams(); }, []);

  useEffect(() => {
    institutionsAPI.adminGetAll()
      .then(res => setInstitutions(res.data.institutions || []))
      .catch(() => {});
  }, []);

  const openAdd = () => {
    setEditingExam(null);
    setForm({ ...BLANK_FORM, institution_id: user?.institution_id ? String(user.institution_id) : '' });
    setShowPassword(false);
    setCourseResolved(false);
    setShowModal(true);
  };

  const openEdit = (exam) => {
    setEditingExam(exam);
    setForm({
      course_code: exam.course_code,
      course_name: exam.course_name,
      exam_type: exam.exam_type,
      year_display: exam.year_display,
      semester: exam.semester,
      accuracy: exam.accuracy,
      exam_date: exam.exam_date ? exam.exam_date.split('T')[0] : '',
      access_password: exam.access_password || '',
      is_active: exam.is_active,
      institution_id: exam.institution_id ? String(exam.institution_id) : '',
    });
    setShowPassword(false);
    setCourseResolved(true);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingExam(null); };

  const handleSave = async () => {
    if (!form.course_code || !form.course_name) {
      toast.error('Course code and name are required');
      return;
    }
    if (!form.institution_id) {
      toast.error('Choose which institution this mock exam is for');
      return;
    }
    if (!courseResolved) {
      toast.error('Please confirm the course code before saving');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        course_code: form.course_code.trim().toUpperCase(),
        exam_date: form.exam_date || null,
        access_password: form.access_password || null,
        accuracy: parseInt(form.accuracy),
        institution_id: form.institution_id ? parseInt(form.institution_id, 10) : null,
      };
      if (editingExam) {
        await mockExamsAPI.update(editingExam.exam_id, payload);
        toast.success('Mock exam updated');
      } else {
        await mockExamsAPI.create(payload);
        toast.success('Mock exam created');
      }
      closeModal();
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save mock exam');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (exam) => {
    try {
      await mockExamsAPI.update(exam.exam_id, { is_active: !exam.is_active });
      toast.success(`Exam ${exam.is_active ? 'deactivated' : 'activated'}`);
      fetchExams();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (exam) => {
    if (!window.confirm(`Delete "${exam.course_code} - ${exam.course_name}"? This cannot be undone.`)) return;
    try {
      await mockExamsAPI.delete(exam.exam_id);
      toast.success('Mock exam deleted');
      fetchExams();
    } catch {
      toast.error('Failed to delete mock exam');
    }
  };

  const openFileManager = async (exam) => {
    setManagingExam(exam);
    setAddFileForm({ kind: 'question', label: '', mode: 'upload', url: '' });
    setSelectedFile(null);
    await fetchFiles(exam.exam_id);
  };

  const closeFileManager = () => {
    setManagingExam(null);
    setFiles([]);
  };

  const fetchFiles = async (examId) => {
    try {
      setLoadingFiles(true);
      const res = await mockExamsAPI.adminGetFiles(examId);
      setFiles(res.data.files || []);
    } catch {
      toast.error('Failed to load files');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleAddFile = async () => {
    if (addFileForm.mode === 'upload' && !selectedFile) {
      toast.error('Choose a PDF to upload');
      return;
    }
    if (addFileForm.mode === 'url' && !addFileForm.url.trim()) {
      toast.error('Enter a URL');
      return;
    }

    setAddingFile(true);
    try {
      let payload;
      if (addFileForm.mode === 'upload') {
        payload = new FormData();
        payload.append('pdf', selectedFile);
        payload.append('kind', addFileForm.kind);
        if (addFileForm.label.trim()) payload.append('label', addFileForm.label.trim());
      } else {
        payload = { kind: addFileForm.kind, label: addFileForm.label.trim() || undefined, url: addFileForm.url.trim() };
      }

      await mockExamsAPI.adminAddFile(managingExam.exam_id, payload);
      toast.success('File added');
      setAddFileForm({ kind: 'question', label: '', mode: 'upload', url: '' });
      setSelectedFile(null);
      await fetchFiles(managingExam.exam_id);
      fetchExams(); // refresh the table's file_count
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add file');
    } finally {
      setAddingFile(false);
    }
  };

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Delete this ${file.kind === 'answer' ? 'answer key' : 'question paper'}${file.label ? ` (${file.label})` : ''}?`)) return;
    try {
      await mockExamsAPI.adminDeleteFile(file.file_id);
      toast.success('File deleted');
      setFiles(prev => prev.filter(f => f.file_id !== file.file_id));
      fetchExams();
    } catch {
      toast.error('Failed to delete file');
    }
  };

  const getLockStatus = (exam) => {
    if (!exam.exam_date) return null;
    const msUntil = new Date(exam.exam_date) - new Date();
    return msUntil > 3 * 24 * 60 * 60 * 1000 ? 'locked' : 'free';
  };

  if (loading) return <Container><LoadingSpinner /></Container>;

  return (
    <Container>
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Mock Exams' }]} />
      <Header>
        <HeaderLeft>
          <Title>Mock Exam Management</Title>
          <Subtitle>Add and manage mock exams shown on the Mock Exams page</Subtitle>
        </HeaderLeft>
        <AddButton onClick={openAdd}>
          <Plus size={18} /> Add Mock Exam
        </AddButton>
      </Header>

      <TableWrapper>
        {exams.length === 0 ? (
          <EmptyState>No mock exams yet. Click "Add Mock Exam" to get started.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Course</Th>
                <Th>Institution</Th>
                <Th>Type</Th>
                <Th>Year / Semester</Th>
                <Th>Exam Date</Th>
                <Th>Access</Th>
                <Th>Accuracy</Th>
                <Th>Files</Th>
                <Th>Active</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => {
                const lockStatus = getLockStatus(exam);
                return (
                  <tr key={exam.exam_id}>
                    <Td>
                      <strong>{exam.course_code}</strong><br />
                      <span style={{ color: 'var(--color-text-secondary, #6B7280)', fontSize: '0.8rem' }}>{exam.course_name}</span>
                    </Td>
                    <Td>{exam.institution_short_name || <span style={{ opacity: 0.4 }}>—</span>}</Td>
                    <Td><Badge $type={exam.exam_type}>{exam.exam_type}</Badge></Td>
                    <Td>{exam.year_display}<br /><span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{exam.semester}</span></Td>
                    <Td>{exam.exam_date ? new Date(exam.exam_date).toLocaleDateString('en-GB') : <span style={{ opacity: 0.4 }}>—</span>}</Td>
                    <Td>
                      {lockStatus ? (
                        <Badge $type={lockStatus}>
                          {lockStatus === 'locked' ? <><Lock size={10} style={{ display: 'inline', marginRight: 3 }} />Locked</> : <><Unlock size={10} style={{ display: 'inline', marginRight: 3 }} />Free</>}
                        </Badge>
                      ) : <span style={{ opacity: 0.4 }}>Always free</span>}
                    </Td>
                    <Td>{exam.accuracy === -1 ? 'Not rated' : `${exam.accuracy}/4`}</Td>
                    <Td>
                      <IconButton onClick={() => openFileManager(exam)} title="Manage files">
                        <FileText size={15} />
                      </IconButton>
                      {' '}
                      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                        {exam.file_count > 0 ? `${exam.file_count} file${exam.file_count === 1 ? '' : 's'}` : 'No files'}
                      </span>
                    </Td>
                    <Td><Toggle $active={exam.is_active} onClick={() => handleToggleActive(exam)} /></Td>
                    <Td>
                      <ActionGroup>
                        <IconButton onClick={() => openEdit(exam)} title="Edit"><Edit2 size={15} /></IconButton>
                        <IconButton $danger onClick={() => handleDelete(exam)} title="Delete"><Trash2 size={15} /></IconButton>
                      </ActionGroup>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </TableWrapper>

      {showModal && (
        <Overlay onClick={closeModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingExam ? 'Edit Mock Exam' : 'Add Mock Exam'}</ModalTitle>
              <CloseButton onClick={closeModal}><X size={20} /></CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>Institution *</Label>
              <Select
                aria-label="Institution"
                value={form.institution_id}
                onChange={e => setForm({ ...form, institution_id: e.target.value })}
              >
                <option value="">Choose an institution</option>
                {institutions.map(inst => (
                  <option key={inst.institution_id} value={inst.institution_id}>
                    {inst.short_name} ({inst.name})
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>Course Code *</Label>
                <CourseCodeField
                  value={form.course_code}
                  institutionId={form.institution_id ? parseInt(form.institution_id, 10) : undefined}
                  initiallyResolved={!!editingExam}
                  onChange={(newCode) => {
                    setCourseResolved(false);
                    setForm(prev => ({ ...prev, course_code: newCode }));
                  }}
                  onResolved={(course) => {
                    setCourseResolved(true);
                    setForm(prev => ({
                      ...prev,
                      course_code: course.course_code,
                      course_name: course.course_name || prev.course_name
                    }));
                  }}
                  placeholder="e.g. CSS326"
                />
              </FormGroup>
              <FormGroup>
                <Label>Exam Type *</Label>
                <Select aria-label="Exam type" value={form.exam_type} onChange={e => setForm({ ...form, exam_type: e.target.value })}>
                  <option>Midterm</option>
                  <option>Final</option>
                  <option>Quiz</option>
                </Select>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Course Name *</Label>
              <Input
                value={form.course_name}
                onChange={e => setForm({ ...form, course_name: e.target.value })}
                placeholder="e.g. Database Programming Laboratory"
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>Year *</Label>
                <Select aria-label="Year" value={form.year_display} onChange={e => setForm({ ...form, year_display: e.target.value })}>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Semester *</Label>
                <Select aria-label="Semester" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}>
                  <option>1st Semester</option>
                  <option>2nd Semester</option>
                </Select>
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>Accuracy (1–4, or not rated yet)</Label>
                <Select aria-label="Accuracy" value={form.accuracy} onChange={e => setForm({ ...form, accuracy: e.target.value })}>
                  <option value={-1}>Not rated yet</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Exam Date (optional)</Label>
                <Input
                  type="date"
                  value={form.exam_date}
                  onChange={e => setForm({ ...form, exam_date: e.target.value })}
                />
                <HelpText>Locks exam until 3 days before this date</HelpText>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Access Password {form.exam_date ? '(required for lock)' : '(optional)'}</Label>
              <PasswordWrapper>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.access_password}
                  onChange={e => setForm({ ...form, access_password: e.target.value })}
                  placeholder="Password students must enter to unlock"
                  style={{ paddingRight: '2.5rem' }}
                />
                <PasswordToggle type="button" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </PasswordToggle>
              </PasswordWrapper>
              <HelpText>Share this password with students for early access. Leave blank for no password requirement.</HelpText>
            </FormGroup>

            <SaveButton onClick={handleSave} disabled={saving || !courseResolved}>
              {saving ? 'Saving…' : editingExam ? 'Save Changes' : 'Create Mock Exam'}
            </SaveButton>
            {!editingExam && (
              <HelpText style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                Add the question paper (and later, the answer key) from the exam's row once it's created.
              </HelpText>
            )}
          </Modal>
        </Overlay>
      )}

      {managingExam && (
        <Overlay onClick={closeFileManager}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{managingExam.course_code} Files</ModalTitle>
              <CloseButton onClick={closeFileManager}><X size={20} /></CloseButton>
            </ModalHeader>

            {loadingFiles ? (
              <LoadingSpinner />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {files.length === 0 ? (
                  <HelpText>No files yet — add a question paper below.</HelpText>
                ) : (
                  files.map(file => (
                    <div
                      key={file.file_id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.75rem', border: '1px solid var(--color-border, #E5E7EB)', borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                        <Badge $type={file.kind === 'answer' ? 'Final' : 'Midterm'}>
                          {file.kind === 'answer' ? 'Answer Key' : 'Question Paper'}
                        </Badge>
                        {file.label && <span style={{ fontSize: '0.85rem' }}>{file.label}</span>}
                        {file.source_type === 'gcs'
                          ? <Upload size={13} style={{ opacity: 0.5, flexShrink: 0 }} />
                          : <Link2 size={13} style={{ opacity: 0.5, flexShrink: 0 }} />}
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {file.url}
                        </a>
                      </div>
                      <IconButton $danger onClick={() => handleDeleteFile(file)} title="Delete file">
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  ))
                )}
              </div>
            )}

            <ModalTitle style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Add a File</ModalTitle>

            <FormRow>
              <FormGroup>
                <Label>Kind</Label>
                <Select
                  aria-label="File kind"
                  value={addFileForm.kind}
                  onChange={e => setAddFileForm(prev => ({ ...prev, kind: e.target.value }))}
                >
                  <option value="question">Question Paper</option>
                  <option value="answer">Answer Key</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Label (optional)</Label>
                <Input
                  value={addFileForm.label}
                  onChange={e => setAddFileForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g. Lab Section A"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <ActionGroup style={{ marginBottom: '0.75rem' }}>
                <ModeButton
                  type="button"
                  $active={addFileForm.mode === 'upload'}
                  onClick={() => setAddFileForm(prev => ({ ...prev, mode: 'upload' }))}
                >
                  <Upload size={14} /> Upload PDF
                </ModeButton>
                <ModeButton
                  type="button"
                  $active={addFileForm.mode === 'url'}
                  onClick={() => setAddFileForm(prev => ({ ...prev, mode: 'url' }))}
                >
                  <Link2 size={14} /> Link to URL
                </ModeButton>
              </ActionGroup>

              {addFileForm.mode === 'upload' ? (
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                />
              ) : (
                <Input
                  type="url"
                  value={addFileForm.url}
                  onChange={e => setAddFileForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                />
              )}
            </FormGroup>

            <SaveButton onClick={handleAddFile} disabled={addingFile}>
              {addingFile ? 'Adding…' : 'Add File'}
            </SaveButton>
          </Modal>
        </Overlay>
      )}
    </Container>
  );
}

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { upcomingExamsAPI, institutionsAPI, coursesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, X, Calendar, Clock, MapPin, FileJson } from 'lucide-react';
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

const FilterSection = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 1.5rem;
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.textSecondary};
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  cursor: pointer;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const TableContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  th {
    text-align: left;
    padding: 1rem;
    font-weight: ${props => props.theme.typography.weights.semibold};
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.typography.sizes.sm};
    border-bottom: 2px solid ${props => props.theme.colors.border};
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid ${props => props.theme.colors.borderLight};
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.typography.sizes.sm};
  }

  tbody tr {
    transition: background ${props => props.theme.transitions.fast};

    &:hover {
      background: ${props => props.theme.colors.backgroundSecondary};
    }
  }
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  background: ${props => {
    switch(props.$type) {
      case 'Midterm': return props.theme.colors.warning;
      case 'Final': return props.theme.colors.error;
      case 'Quiz': return props.theme.colors.success;
      default: return props.theme.colors.textTertiary;
    }
  }};
  color: white;
`;

const YearBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  background: ${props => props.theme.colors.primaryLight};
  color: ${props => props.theme.colors.primary};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.$checked ? props.theme.colors.success : props.theme.colors.textTertiary};
    transition: 0.3s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
      transform: ${props => props.$checked ? 'translateX(26px)' : 'translateX(0)'};
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: ${props => props.$variant === 'danger' ? props.theme.colors.error : props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: ${props => props.theme.radius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.lg};
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.xl};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
`;

const HelpText = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.5rem;
  line-height: 1.5;
`;

const SubmitButton = styled.button`
  padding: 0.875rem 2rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Institution sits above the auto-fetch box (it decides which registrar
// is used), but still belongs to the form via form="exam-form".
const InstitutionPicker = styled.div`
  margin-bottom: 1rem;
`;

const SiitFetchSection = styled.div`
  padding-bottom: 1.25rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SiitFetchRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FetchButton = styled.button`
  padding: 0.75rem 1.25rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  white-space: nowrap;
  transition: all ${props => props.theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SiitErrorText = styled.p`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const CandidateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 220px;
  overflow-y: auto;
`;

const CandidateCard = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  width: 100%;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  cursor: pointer;
  text-align: left;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

const UseLabel = styled.span`
  margin-left: auto;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.primary};
  white-space: nowrap;
`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateTimeLocal = (dateString) => {
  if (!dateString) return '';
  // Convert UTC date to Bangkok timezone (UTC+7)
  const date = new Date(dateString);
  const bangkokTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
  // Format as datetime-local input value (YYYY-MM-DDTHH:mm)
  const year = bangkokTime.getFullYear();
  const month = String(bangkokTime.getMonth() + 1).padStart(2, '0');
  const day = String(bangkokTime.getDate()).padStart(2, '0');
  const hours = String(bangkokTime.getHours()).padStart(2, '0');
  const minutes = String(bangkokTime.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

function UpcomingExamsManagement() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year_level: 'all',
    include_past: false,
    institution_id: 'all'
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    exam_type: 'Midterm',
    exam_date: '',
    year_level: 'Year 1',
    location: '',
    notes: '',
    institution_id: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [courseResolved, setCourseResolved] = useState(false);

  // SIIT registrar auto-fetch state (Add mode only)
  const [siitCourseCode, setSiitCourseCode] = useState('');
  const [siitFetching, setSiitFetching] = useState(false);
  const [siitCandidates, setSiitCandidates] = useState(null);
  const [siitError, setSiitError] = useState(null);

  useEffect(() => {
    institutionsAPI.adminGetAll()
      .then(res => setInstitutions(res.data.institutions || []))
      .catch(() => {});
  }, []);

  // JSON import state
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonImporting, setJsonImporting] = useState(false);

  useEffect(() => {
    fetchExams();
  }, [filters]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await upcomingExamsAPI.getAll({
        year_level: filters.year_level !== 'all' ? filters.year_level : undefined,
        include_past: filters.include_past ? 'true' : undefined,
        institution_id: filters.institution_id !== 'all' ? filters.institution_id : undefined
      });
      setExams(response.data.exams || []);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingExam(null);
    setFormData({
      course_code: '',
      course_name: '',
      exam_type: 'Midterm',
      exam_date: '',
      year_level: 'Year 1',
      location: '',
      notes: '',
      institution_id: user?.institution_id ? String(user.institution_id) : ''
    });
    setSiitCourseCode('');
    setSiitCandidates(null);
    setSiitError(null);
    setCourseResolved(false);
    setShowModal(true);
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    setFormData({
      course_code: exam.course_code,
      course_name: exam.course_name,
      exam_type: exam.exam_type,
      exam_date: formatDateTimeLocal(exam.exam_date),
      year_level: exam.year_level,
      location: exam.location || '',
      notes: exam.notes || '',
      institution_id: exam.institution_id ? String(exam.institution_id) : ''
    });
    setCourseResolved(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExam(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // The institution picked in the form decides which registrar (if any) the
  // auto-fetch talks to; the server flags support per institution.
  const formInstitution = institutions.find(inst => String(inst.institution_id) === String(formData.institution_id));
  const registrar = formInstitution?.registrar_lookup || null;

  const handleSiitFetch = async () => {
    if (!registrar) return;
    if (!siitCourseCode.trim()) {
      toast.error('Enter a course code to fetch');
      return;
    }

    setSiitFetching(true);
    setSiitError(null);
    setSiitCandidates(null);
    try {
      const response = await upcomingExamsAPI.registrarLookup(formData.institution_id, siitCourseCode.trim());
      setSiitCandidates(response.data.candidates || []);
    } catch (error) {
      console.error(`${registrar.label} lookup failed:`, error);
      setSiitError(error.response?.data?.message || `Failed to fetch from ${registrar.label}`);
    } finally {
      setSiitFetching(false);
    }
  };

  const applySiitCandidate = (candidate) => {
    setFormData(prev => ({
      ...prev,
      course_code: candidate.course_code,
      course_name: candidate.course_name,
      exam_type: candidate.exam_type,
      exam_date: `${candidate.exam_date}T${candidate.time_from}`,
      location: candidate.location || '',
      // MFU suggests one from reserved-seat info; SIIT has none.
      ...(candidate.year_level ? { year_level: candidate.year_level } : {})
    }));
    setCourseResolved(true);
    coursesAPI.create({
      course_code: candidate.course_code,
      course_name: candidate.course_name,
      // courses.source: 'siit_api' | 'mfu_api' | 'tu_api' | 'manual' (CHECK constraint).
      source: registrar?.key ? `${registrar.key}_api` : 'manual',
    }).catch(() => {});
    toast.success(candidate.year_level
      ? `Prefilled from ${registrar?.label || 'registrar'} (incl. suggested ${candidate.year_level}) — review before saving`
      : `Prefilled from ${registrar?.label || 'registrar'} — set Year Level before saving`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.course_code || !formData.course_name || !formData.exam_date || !formData.year_level) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!courseResolved) {
      toast.error('Please confirm the course code before saving');
      return;
    }

    setSubmitting(true);
    try {
      // Convert datetime-local value (Bangkok time) to ISO string
      // The input value is like "2024-02-20T09:00"
      // We need to treat this as Bangkok time and convert to UTC
      const [datePart, timePart] = formData.exam_date.split('T');
      const [year, month, day] = datePart.split('-');
      const [hours, minutes] = timePart.split(':');

      // Create date string in Bangkok timezone format
      const bangkokDateStr = `${year}-${month}-${day}T${hours}:${minutes}:00+07:00`;
      const examDateISO = new Date(bangkokDateStr).toISOString();

      const dataToSubmit = {
        ...formData,
        exam_date: examDateISO,
        institution_id: formData.institution_id ? parseInt(formData.institution_id) : null
      };

      if (editingExam) {
        await upcomingExamsAPI.update(editingExam.exam_id, dataToSubmit);
        toast.success('Exam updated successfully');
      } else {
        await upcomingExamsAPI.create(dataToSubmit);
        toast.success('Exam created successfully');
      }
      closeModal();
      fetchExams();
    } catch (error) {
      console.error('Failed to save exam:', error);
      toast.error(error.response?.data?.message || 'Failed to save exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (examId, currentStatus) => {
    try {
      await upcomingExamsAPI.toggleActive(examId);
      setExams(prev => prev.map(exam =>
        exam.exam_id === examId
          ? { ...exam, is_active: !currentStatus }
          : exam
      ));
      toast.success(`Exam ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (examId) => {
    const confirmed = window.confirm('Are you sure you want to delete this exam?');
    if (!confirmed) return;

    try {
      await upcomingExamsAPI.delete(examId);
      setExams(prev => prev.filter(exam => exam.exam_id !== examId));
      toast.success('Exam deleted successfully');
    } catch (error) {
      console.error('Failed to delete exam:', error);
      toast.error('Failed to delete exam');
    }
  };

  const openJsonImportModal = () => {
    setJsonInput('');
    setShowJsonModal(true);
  };

  const closeJsonImportModal = () => {
    setShowJsonModal(false);
    setJsonInput('');
  };

  const handleJsonImport = async () => {
    if (!jsonInput.trim()) {
      toast.error('Please enter JSON data');
      return;
    }

    try {
      const examsData = JSON.parse(jsonInput);

      if (!Array.isArray(examsData)) {
        toast.error('JSON must be an array of exam objects');
        return;
      }

      if (examsData.length === 0) {
        toast.error('JSON array is empty');
        return;
      }

      setJsonImporting(true);

      // Send to bulk create endpoint
      await upcomingExamsAPI.bulkCreate(examsData);

      toast.success(`Successfully imported ${examsData.length} exam(s)`);
      closeJsonImportModal();
      fetchExams();
    } catch (error) {
      console.error('Failed to import JSON:', error);
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON format. Please check your JSON syntax.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to import exams');
      }
    } finally {
      setJsonImporting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <Container>
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Upcoming Exams' }]} />
      <Header>
        <HeaderLeft>
          <Title>Upcoming Exams Management</Title>
          <Subtitle>Add and manage exam schedules displayed to students</Subtitle>
        </HeaderLeft>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <AddButton onClick={openJsonImportModal} style={{ background: '#6366F1' }}>
            <FileJson size={18} />
            Bulk Import JSON
          </AddButton>
          <AddButton onClick={openAddModal}>
            <Plus size={18} />
            Add Exam
          </AddButton>
        </div>
      </Header>

      <FilterSection>
        <FilterGroup>
          <Label>Year Level</Label>
          <Select
            aria-label="Filter by year level"
            value={filters.year_level}
            onChange={(e) => setFilters(prev => ({ ...prev, year_level: e.target.value }))}
          >
            <option value="all">All Years</option>
            <option value="Year 1">Year 1</option>
            <option value="Year 2">Year 2</option>
            <option value="Year 3">Year 3</option>
            <option value="Year 4">Year 4</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <Label>Institution</Label>
          <Select
            aria-label="Filter by institution"
            value={filters.institution_id}
            onChange={(e) => setFilters(prev => ({ ...prev, institution_id: e.target.value }))}
          >
            <option value="all">All Institutions</option>
            {institutions.map(inst => (
              <option key={inst.institution_id} value={inst.institution_id}>{inst.short_name}</option>
            ))}
          </Select>
        </FilterGroup>

        <Checkbox>
          <input
            type="checkbox"
            checked={filters.include_past}
            onChange={(e) => setFilters(prev => ({ ...prev, include_past: e.target.checked }))}
          />
          Include past exams
        </Checkbox>
      </FilterSection>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Exam Type</th>
              <th>Date & Time</th>
              <th>Year</th>
              <th>Institution</th>
              <th>Location</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <EmptyState>
                    No upcoming exams found. Click "Add Exam" to create one.
                  </EmptyState>
                </td>
              </tr>
            ) : (
              exams.map(exam => (
                <tr key={exam.exam_id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{exam.course_code}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{exam.course_name}</div>
                  </td>
                  <td>
                    <Badge $type={exam.exam_type}>{exam.exam_type}</Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} />
                      {formatDate(exam.exam_date)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', color: '#666' }}>
                      <Clock size={14} />
                      {formatTime(exam.exam_date)}
                    </div>
                  </td>
                  <td>
                    <YearBadge>{exam.year_level}</YearBadge>
                  </td>
                  <td>
                    {exam.institution_name || <span style={{ color: '#999' }}>-</span>}
                  </td>
                  <td>
                    {exam.location ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} />
                        {exam.location}
                      </div>
                    ) : (
                      <span style={{ color: '#999' }}>-</span>
                    )}
                  </td>
                  <td>
                    <ToggleSwitch $checked={exam.is_active}>
                      <input
                        type="checkbox"
                        checked={exam.is_active}
                        onChange={() => handleToggleActive(exam.exam_id, exam.is_active)}
                      />
                      <span />
                    </ToggleSwitch>
                  </td>
                  <td>
                    <ActionButtons>
                      <ActionButton onClick={() => openEditModal(exam)} title="Edit">
                        <Edit2 size={16} />
                      </ActionButton>
                      <ActionButton
                        $variant="danger"
                        onClick={() => handleDelete(exam.exam_id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </ActionButton>
                    </ActionButtons>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>

      {/* Add/Edit Modal */}
      {showModal && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingExam ? 'Edit Exam' : 'Add New Exam'}</ModalTitle>
              <CloseButton onClick={closeModal}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>

            <InstitutionPicker>
              <FormGroup>
                <Label>Institution *</Label>
                <Select
                  name="institution_id"
                  form="exam-form"
                  aria-label="Institution"
                  value={formData.institution_id}
                  onChange={(e) => {
                    handleInputChange(e);
                    // A different institution means a different registrar.
                    setSiitCandidates(null);
                    setSiitError(null);
                  }}
                  required
                >
                  <option value="" disabled>Select institution</option>
                  {institutions.map(inst => (
                    <option key={inst.institution_id} value={inst.institution_id}>{inst.short_name}</option>
                  ))}
                </Select>
                <HelpText>Only students at this institution will see this exam on the home page. SIIT and MFU can auto-fetch exam dates from their registrar.</HelpText>
              </FormGroup>
            </InstitutionPicker>

            {!editingExam && registrar && (
              <SiitFetchSection>
                <Label>Auto-fetch from {registrar.label} (optional)</Label>
                <SiitFetchRow>
                  <Input
                    type="text"
                    placeholder={`e.g., ${registrar.code_example}`}
                    value={siitCourseCode}
                    onChange={(e) => setSiitCourseCode(e.target.value)}
                  />
                  <FetchButton type="button" onClick={handleSiitFetch} disabled={siitFetching}>
                    {siitFetching ? 'Fetching...' : 'Fetch'}
                  </FetchButton>
                </SiitFetchRow>
                <HelpText>
                  {registrar.key === 'mfu'
                    ? 'Pulls Midterm/Final dates MFU has on file for this course and term, plus a suggested year level from reserved seats when available. Rooms are often unassigned ("TBA") — review everything below before saving.'
                    : 'Pulls Midterm/Final dates the registrar has on file for this course and term. Location often comes back unassigned ("TBA") — SIIT data has no year level either, so you\'ll still set that below.'}
                </HelpText>

                {siitError && <SiitErrorText>{siitError}</SiitErrorText>}

                {siitCandidates && siitCandidates.length === 0 && !siitError && (
                  <HelpText>No exam schedule found for this course code yet.</HelpText>
                )}

                {siitCandidates && siitCandidates.length > 0 && (
                  <CandidateList>
                    {siitCandidates.map((candidate, index) => (
                      <CandidateCard
                        key={`${candidate.exam_type}-${candidate.exam_date}-${index}`}
                        type="button"
                        onClick={() => applySiitCandidate(candidate)}
                      >
                        <Badge $type={candidate.exam_type}>{candidate.exam_type}</Badge>
                        <div>
                          <div style={{ fontWeight: 600 }}>{candidate.course_name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>
                            {candidate.exam_date} &middot; {candidate.time_from}-{candidate.time_to} &middot; {candidate.location || 'TBA'}
                            {candidate.year_level && <> &middot; {candidate.year_level}</>}
                          </div>
                        </div>
                        <UseLabel>Use</UseLabel>
                      </CandidateCard>
                    ))}
                  </CandidateList>
                )}
              </SiitFetchSection>
            )}

            <Form id="exam-form" onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup>
                  <Label>Course Code *</Label>
                  <CourseCodeField
                    value={formData.course_code}
                    institutionId={formData.institution_id ? parseInt(formData.institution_id, 10) : undefined}
                    initiallyResolved={!!editingExam}
                    onChange={(newCode) => {
                      setCourseResolved(false);
                      setFormData(prev => ({ ...prev, course_code: newCode }));
                    }}
                    onResolved={(course) => {
                      setCourseResolved(true);
                      setFormData(prev => ({
                        ...prev,
                        course_code: course.course_code,
                        course_name: course.course_name || prev.course_name
                      }));
                    }}
                    placeholder="e.g., CSS326"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Exam Type *</Label>
                  <Select
                    name="exam_type"
                    aria-label="Exam Type"
                    value={formData.exam_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Midterm">Midterm</option>
                    <option value="Final">Final</option>
                    <option value="Quiz">Quiz</option>
                  </Select>
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Course Name *</Label>
                <Input
                  type="text"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Database Programming Laboratory"
                  required
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Exam Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    name="exam_date"
                    value={formData.exam_date}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Year Level *</Label>
                  <Select
                    name="year_level"
                    aria-label="Year Level"
                    value={formData.year_level}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                  </Select>
                </FormGroup>
              </FormRow>


              <FormGroup>
                <Label>Location (Optional)</Label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Room 301, Building A"
                />
              </FormGroup>

              <FormGroup>
                <Label>Notes (Optional)</Label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="e.g., Open book, Bring calculator"
                />
              </FormGroup>

              <SubmitButton type="submit" disabled={submitting || !courseResolved}>
                {submitting ? 'Saving...' : (editingExam ? 'Update Exam' : 'Create Exam')}
              </SubmitButton>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* JSON Import Modal */}
      {showJsonModal && (
        <ModalOverlay onClick={closeJsonImportModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Bulk Import from JSON</ModalTitle>
              <CloseButton onClick={closeJsonImportModal}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>JSON Array of Exams</Label>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`[\n  {\n    "course_code": "CSS334",\n    "course_name": "Computer Network",\n    "exam_type": "Midterm",\n    "exam_date": "2026-02-25T09:00:00+07:00",\n    "year_level": "Year 3",\n    "institution_id": ${user?.institution_id || 1},\n    "location": "Room 301",\n    "notes": "Open book"\n  }\n]`}
                style={{ minHeight: '300px', fontFamily: 'monospace', fontSize: '0.875rem' }}
              />
              <HelpText>
                Paste a JSON array of exam objects. Each exam should have: course_code, course_name, exam_type (Midterm/Final/Quiz), exam_date (ISO format with +07:00 timezone), year_level (Year 1/2/3/4), institution_id (see the Institution filter above for IDs — omit to leave the exam unscoped), and optional location and notes.
              </HelpText>
            </FormGroup>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={closeJsonImportModal}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid #D2D2D7',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <SubmitButton type="button" onClick={handleJsonImport} disabled={jsonImporting}>
                {jsonImporting ? 'Importing...' : 'Import Exams'}
              </SubmitButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default UpcomingExamsManagement;

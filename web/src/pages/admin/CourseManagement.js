import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { coursesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Plus, Edit2, Trash2, X, Sparkles, Search } from 'lucide-react';
import Breadcrumbs from '../../components/ui/Breadcrumb';

const Container = styled.div`
  max-width: 1100px;
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

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
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
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const EnrichButton = styled(AddButton)`
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};
  &:hover {
    background: ${props => props.theme.colors.primaryLight};
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.6rem 0.9rem;
  margin-bottom: 1.5rem;
  max-width: 380px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: ${props => props.theme.typography.sizes.base};
  color: ${props => props.theme.colors.text};
`;

const EnrichSummary = styled.div`
  background: ${props => props.theme.colors.primaryLight};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.85rem 1rem;
  margin-bottom: 1.5rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
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
  background: ${props => props.$source === 'manual' ? '#F3F4F6' : '#EFF6FF'};
  color: ${props => props.$source === 'manual' ? '#6B7280' : '#1D4ED8'};
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

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

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
  max-width: 480px;
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
  &:disabled {
    opacity: 0.6;
  }
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

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({ course_code: '', course_name: '' });
  const [saving, setSaving] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichSummary, setEnrichSummary] = useState(null);

  const fetchCourses = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      const res = await coursesAPI.adminGetAll(searchTerm ? { search: searchTerm } : {});
      setCourses(res.data.courses || []);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchCourses(search), 300);
    return () => clearTimeout(timeout);
  }, [search, fetchCourses]);

  const openAdd = () => {
    setEditingCourse(null);
    setForm({ course_code: '', course_name: '' });
    setShowModal(true);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setForm({ course_code: course.course_code, course_name: course.course_name });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCourse(null);
  };

  const handleSave = async () => {
    if (!form.course_code.trim() || !form.course_name.trim()) {
      toast.error('Course code and name are required');
      return;
    }
    setSaving(true);
    try {
      if (editingCourse) {
        await coursesAPI.adminUpdate(editingCourse.course_code, form.course_name.trim());
        toast.success('Course updated');
      } else {
        await coursesAPI.create({
          course_code: form.course_code.trim(),
          course_name: form.course_name.trim(),
          source: 'manual',
        });
        toast.success('Course added');
      }
      closeModal();
      fetchCourses(search);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Remove ${course.course_code} from the registry? Existing cheat sheets and exams keep this code either way.`)) {
      return;
    }
    try {
      await coursesAPI.adminDelete(course.course_code);
      toast.success('Course removed');
      fetchCourses(search);
    } catch {
      toast.error('Failed to remove course');
    }
  };

  const handleEnrich = async () => {
    setEnriching(true);
    try {
      const res = await coursesAPI.adminBulkEnrich();
      setEnrichSummary(res.data);
      toast.success(`Checked ${res.data.checked}, added ${res.data.added}`);
      fetchCourses(search);
    } catch {
      toast.error('Enrich from SIIT failed');
    } finally {
      setEnriching(false);
    }
  };

  return (
    <Container>
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Course Registry' }]} />

      <Header>
        <HeaderLeft>
          <Title>Course Registry</Title>
          <Subtitle>Canonical course code to course name mapping, used to confirm codes across the site.</Subtitle>
        </HeaderLeft>
        <HeaderActions>
          <EnrichButton onClick={handleEnrich} disabled={enriching}>
            <Sparkles size={18} />
            {enriching ? 'Enriching...' : 'Enrich from SIIT'}
          </EnrichButton>
          <AddButton onClick={openAdd}>
            <Plus size={18} />
            Add Course
          </AddButton>
        </HeaderActions>
      </Header>

      {enrichSummary && (
        <EnrichSummary>
          Checked {enrichSummary.checked} code{enrichSummary.checked === 1 ? '' : 's'}, added {enrichSummary.added}.
          {enrichSummary.notFound?.length > 0 && ` No SIIT record for: ${enrichSummary.notFound.join(', ')}.`}
          {enrichSummary.remaining > 0 && (
            <> {enrichSummary.remaining} more code{enrichSummary.remaining === 1 ? '' : 's'} still unchecked — click "Enrich from SIIT" again to continue.</>
          )}
        </EnrichSummary>
      )}

      <SearchBar>
        <Search size={16} />
        <SearchInput
          type="text"
          placeholder="Search by code or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchBar>

      {loading ? (
        <LoadingSpinner />
      ) : courses.length === 0 ? (
        <EmptyState>No courses registered yet.</EmptyState>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Course Code</Th>
                <Th>Course Name</Th>
                <Th>Source</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.course_code}>
                  <Td>{course.course_code}</Td>
                  <Td>{course.course_name}</Td>
                  <Td>
                    <Badge $source={course.source}>
                      {{ siit_api: 'SIIT', mfu_api: 'MFU', tu_api: 'TU' }[course.source] || 'Manual'}
                    </Badge>
                  </Td>
                  <Td>
                    <ActionGroup>
                      <IconButton onClick={() => openEdit(course)} aria-label="Edit course">
                        <Edit2 size={16} />
                      </IconButton>
                      <IconButton $danger onClick={() => handleDelete(course)} aria-label="Delete course">
                        <Trash2 size={16} />
                      </IconButton>
                    </ActionGroup>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {showModal && (
        <Overlay onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingCourse ? 'Edit Course' : 'Add Course'}</ModalTitle>
              <CloseButton onClick={closeModal}><X size={20} /></CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>Course Code *</Label>
              <Input
                value={form.course_code}
                onChange={(e) => setForm({ ...form, course_code: e.target.value })}
                placeholder="e.g. CSS326"
                disabled={!!editingCourse}
              />
            </FormGroup>

            <FormGroup>
              <Label>Course Name *</Label>
              <Input
                value={form.course_name}
                onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                placeholder="e.g. Database Programming Laboratory"
              />
            </FormGroup>

            <SaveButton onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingCourse ? 'Save Changes' : 'Add Course'}
            </SaveButton>
          </Modal>
        </Overlay>
      )}
    </Container>
  );
}

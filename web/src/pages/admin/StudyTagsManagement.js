import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Search, Eye, EyeOff, CornerDownRight } from 'lucide-react';
import { studyTagsAPI, institutionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import StudyTagPicker from '../../components/StudyTagPicker';
import Breadcrumbs from '../../components/ui/Breadcrumb';

// Staff console for study tags (migration 076): each institution's programs
// and faculties, at most three levels (faculty -> program -> track), and
// which courses carry them. A cheat
// sheet or upcoming exam inherits its course's tags, and students who pick a
// tag see that content first (server/services/studyTags.js).

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};

  @media (max-width: 768px) {
    padding: 1.25rem 1rem;
  }
`;

const Header = styled.div`
  margin: 1rem 0 2rem;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
  max-width: 720px;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const Select = styled.select`
  padding: 0.6rem 0.9rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.surface};
`;

const DayInput = styled.input`
  width: 4.5rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.surface};
`;

const Section = styled.section`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const SectionHelp = styled.p`
  margin: 0.25rem 0 0;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: background ${props => props.theme.transitions.fast};
  &:hover { background: ${props => props.theme.colors.primaryHover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const TagRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  padding-left: ${props => props.$depth * 1.75}rem;
  border-top: 1px solid ${props => props.theme.colors.borderLight};
  opacity: ${props => (props.$inactive ? 0.55 : 1)};

  &:first-of-type {
    border-top: none;
  }
`;

const TagName = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-weight: ${props => (props.$group ? props.theme.typography.weights.semibold : props.theme.typography.weights.medium)};
  color: ${props => props.theme.colors.text};
`;

const Muted = styled.span`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.typography.weights.regular};
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 0.375rem;
  flex-shrink: 0;
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  cursor: pointer;
  background: ${props => (props.$danger ? '#FEF2F2' : props.theme.colors.primaryLight)};
  color: ${props => (props.$danger ? '#DC2626' : props.theme.colors.primary)};
  &:hover { filter: brightness(0.95); }
`;

const SearchBar = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.5rem 0.8rem;
  flex: 1;
  max-width: 320px;
  color: ${props => props.theme.colors.textSecondary};
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  font-size: ${props => props.theme.typography.sizes.base};
  color: ${props => props.theme.colors.text};
`;

const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
`;

const CourseRow = styled.div`
  padding: 0.875rem 0;
  border-top: 1px solid ${props => props.theme.colors.borderLight};
`;

const CourseHead = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`;

const CourseCode = styled.span`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  font-variant-numeric: tabular-nums;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
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
  }
`;

const FullSelect = styled(Select)`
  width: 100%;
  background: ${props => props.theme.colors.background};
`;

const GateRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FieldHelp = styled.p`
  margin: 0.375rem 0 0;
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const SaveButton = styled(PrimaryButton)`
  width: 100%;
  justify-content: center;
  padding: 0.875rem;
  margin-top: 0.5rem;
`;

const EMPTY_FORM = { name: '', name_th: '', short_name: '', sort_order: 0, parent_id: '', open_year: '', open_semester: '1' };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const MAX_DEPTH = 3;

// Every tag with its depth (1 = top level) and subtree height, in tree order.
function flattenTree(tree, depth = 1) {
  return tree.flatMap(tag => {
    const below = flattenTree(tag.children, depth + 1);
    const height = 1 + Math.max(0, ...tag.children.map(child => below.find(b => b.tag.tag_id === child.tag_id).height));
    return [{ tag, depth, height }, ...below];
  });
}

const countDescendants = (tag) => tag.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);

export default function StudyTagsManagement() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState(user?.institution_id ? String(user.institution_id) : '');
  const [tags, setTags] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [untaggedOnly, setUntaggedOnly] = useState(false);
  const [savingCourse, setSavingCourse] = useState(null);
  const [modal, setModal] = useState(null); // { tag } when editing, {} when adding
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  // The institution's second-semester start as month (1-12) and day.
  const [semester2, setSemester2] = useState({ month: '1', day: '1', saved: null });
  const [savingSemester, setSavingSemester] = useState(false);

  useEffect(() => {
    institutionsAPI.adminGetAll()
      .then(res => {
        const list = res.data.institutions || [];
        setInstitutions(list);
        setInstitutionId(current => current || (list[0] ? String(list[0].institution_id) : ''));
      })
      .catch(() => toast.error('Failed to load institutions'));
  }, []);

  const load = useCallback(async () => {
    if (!institutionId) return;
    setLoading(true);
    try {
      const [tagsRes, coursesRes] = await Promise.all([
        studyTagsAPI.adminList(institutionId),
        studyTagsAPI.adminCourses(institutionId),
      ]);
      setTags(tagsRes.data.tags || []);
      setCourses(coursesRes.data.courses || []);
      const saved = tagsRes.data.second_semester_start;
      const [month, day] = (saved || '01-01').split('-').map(Number);
      setSemester2({ month: String(month), day: String(day), saved });
    } catch {
      toast.error('Failed to load study tags');
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  useEffect(() => { load(); }, [load]);

  const flatTags = useMemo(() => flattenTree(tags), [tags]);

  const visibleCourses = useMemo(() => {
    const term = search.trim().toLowerCase();
    return courses.filter(course => (!untaggedOnly || course.tag_ids.length === 0)
      && (!term || course.course_code.toLowerCase().includes(term)
        || (course.course_name || '').toLowerCase().includes(term)));
  }, [courses, search, untaggedOnly]);

  const openAdd = (parentId = '') => {
    setForm({ ...EMPTY_FORM, parent_id: parentId ? String(parentId) : '' });
    setModal({});
  };

  const openEdit = (tag) => {
    setForm({
      name: tag.name,
      name_th: tag.name_th || '',
      short_name: tag.short_name || '',
      sort_order: tag.sort_order,
      parent_id: tag.parent_id ? String(tag.parent_id) : '',
      open_year: tag.sub_tags_open_year ? String(tag.sub_tags_open_year) : '',
      open_semester: tag.sub_tags_open_semester ? String(tag.sub_tags_open_semester) : '1',
    });
    setModal({ tag });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('An English name is required');
      return;
    }
    const payload = {
      name: form.name.trim(),
      name_th: form.name_th.trim() || null,
      short_name: form.short_name.trim() || null,
      sort_order: parseInt(form.sort_order, 10) || 0,
      parent_id: form.parent_id ? parseInt(form.parent_id, 10) : null,
      sub_tags_open_year: form.open_year ? parseInt(form.open_year, 10) : null,
      sub_tags_open_semester: form.open_year ? parseInt(form.open_semester, 10) : null,
    };
    setSaving(true);
    try {
      if (modal.tag) {
        await studyTagsAPI.adminUpdate(modal.tag.tag_id, payload);
        toast.success('Tag updated');
      } else {
        await studyTagsAPI.adminCreate({ ...payload, institution_id: parseInt(institutionId, 10) });
        toast.success('Tag added');
      }
      setModal(null);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save tag');
    } finally {
      setSaving(false);
    }
  };

  const saveSemester2 = async () => {
    const value = `${semester2.month.padStart(2, '0')}-${String(semester2.day).padStart(2, '0')}`;
    setSavingSemester(true);
    try {
      await studyTagsAPI.adminSetSecondSemesterStart(parseInt(institutionId, 10), value);
      setSemester2(current => ({ ...current, saved: value }));
      toast.success('Semester 2 start saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save the date');
    } finally {
      setSavingSemester(false);
    }
  };

  const toggleActive = async (tag) => {
    try {
      await studyTagsAPI.adminUpdate(tag.tag_id, { is_active: !tag.is_active });
      load();
    } catch {
      toast.error('Failed to update tag');
    }
  };

  const handleDelete = async (tag) => {
    const below = countDescendants(tag);
    const extra = below ? ` and the ${below} sub-tag${below === 1 ? '' : 's'} under it` : '';
    if (!window.confirm(`Delete "${tag.name}"${extra}? It comes off every course and every student who picked it. To hide it without losing that, deactivate it instead.`)) {
      return;
    }
    try {
      await studyTagsAPI.adminDelete(tag.tag_id);
      toast.success('Tag deleted');
      load();
    } catch {
      toast.error('Failed to delete tag');
    }
  };

  // `next` comes from the picker, already reduced to the most specific tags.
  const saveCourseTags = async (course, next) => {
    const previous = course.tag_ids;
    const setCourseTags = (tagIds) => setCourses(list => list.map(item => (
      item.course_code === course.course_code ? { ...item, tag_ids: tagIds } : item
    )));

    setCourseTags(next);
    setSavingCourse(course.course_code);
    try {
      await studyTagsAPI.adminSetCourseTags(course.course_code, parseInt(institutionId, 10), next);
    } catch {
      setCourseTags(previous);
      toast.error(`Failed to save ${course.course_code}`);
    } finally {
      setSavingCourse(null);
    }
  };

  // Where a tag can go: not under itself or its own sub-tags, and not so deep
  // that it (with everything under it) passes three levels.
  const editing = modal?.tag ? flatTags.find(entry => entry.tag.tag_id === modal.tag.tag_id) : null;
  const editingSubtree = editing ? new Set([editing.tag.tag_id, ...flattenTree(editing.tag.children).map(e => e.tag.tag_id)]) : new Set();
  const parentOptions = flatTags.filter(entry => !editingSubtree.has(entry.tag.tag_id)
    && entry.depth + (editing ? editing.height : 1) <= MAX_DEPTH);
  const untaggedCount = courses.filter(course => course.tag_ids.length === 0).length;

  const renderTagRow = ({ tag, depth }) => (
    <TagRow key={tag.tag_id} $depth={depth - 1} $inactive={!tag.is_active}>
      <TagName $group={depth === 1}>
        {depth > 1 && <CornerDownRight size={14} aria-hidden="true" />}
        {tag.name}
        {tag.short_name && <Muted>({tag.short_name})</Muted>}
        {tag.name_th && <Muted lang="th">{tag.name_th}</Muted>}
        <Muted>
          {tag.course_count} course{tag.course_count === 1 ? '' : 's'} · {tag.user_count} student{tag.user_count === 1 ? '' : 's'}
          {!!tag.sub_tags_open_year && ` · sub-tags open Year ${tag.sub_tags_open_year}, Semester ${tag.sub_tags_open_semester}`}
          {!tag.is_active && ' · hidden'}
        </Muted>
      </TagName>
      <ActionGroup>
        {depth < MAX_DEPTH && (
          <IconButton onClick={() => openAdd(tag.tag_id)} title="Add a sub-tag under this" aria-label={`Add a sub-tag under ${tag.name}`}>
            <Plus size={15} />
          </IconButton>
        )}
        <IconButton onClick={() => toggleActive(tag)} title={tag.is_active ? 'Hide' : 'Show'} aria-label={tag.is_active ? `Hide ${tag.name}` : `Show ${tag.name}`}>
          {tag.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
        </IconButton>
        <IconButton onClick={() => openEdit(tag)} title="Edit" aria-label={`Edit ${tag.name}`}>
          <Edit2 size={15} />
        </IconButton>
        <IconButton $danger onClick={() => handleDelete(tag)} title="Delete" aria-label={`Delete ${tag.name}`}>
          <Trash2 size={15} />
        </IconButton>
      </ActionGroup>
    </TagRow>
  );

  return (
    <Container>
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Study Tags' }]} />

      <Header>
        <Title>Study Tags</Title>
        <Subtitle>
          Each institution's programs and faculties, up to three levels (faculty, program, track),
          in English and optionally Thai. Tag a course once and every cheat sheet and upcoming exam
          for it follows. Students who pick a tag see its cheat sheets first and only its upcoming
          exams (plus untagged courses). Students never see tags on content.
        </Subtitle>
      </Header>

      <Toolbar>
        <Select
          aria-label="Institution"
          value={institutionId}
          onChange={(e) => setInstitutionId(e.target.value)}
        >
          {institutions.map(inst => (
            <option key={inst.institution_id} value={inst.institution_id}>
              {inst.short_name} ({inst.name})
            </option>
          ))}
        </Select>
      </Toolbar>

      {institutionId && (
        <Toolbar>
          <Muted as="label" htmlFor="semester2-month">Semester 2 starts</Muted>
          <Select
            id="semester2-month"
            aria-label="Semester 2 start month"
            value={semester2.month}
            onChange={(e) => setSemester2({ ...semester2, month: e.target.value })}
          >
            {MONTHS.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
          </Select>
          <DayInput
            type="number"
            min={1}
            max={31}
            aria-label="Semester 2 start day"
            value={semester2.day}
            onChange={(e) => setSemester2({ ...semester2, day: e.target.value })}
          />
          <PrimaryButton onClick={saveSemester2} disabled={savingSemester}>
            {savingSemester ? 'Saving...' : 'Save'}
          </PrimaryButton>
          <Muted>
            {semester2.saved ? 'Each year.' : 'Not set, so 1 January.'} Used for sub-tags that open in a Semester 2.
          </Muted>
        </Toolbar>
      )}

      {loading && tags.length === 0 && courses.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          <Section>
            <SectionHeader>
              <div>
                <SectionTitle>Tags</SectionTitle>
                <SectionHelp>
                  A top-level tag can be a program (SIIT: CPE) or a faculty. Use + to add a sub-tag,
                  e.g. tracks like Cyber Security and AI under CPE.
                </SectionHelp>
              </div>
              <PrimaryButton onClick={() => openAdd()} disabled={!institutionId}>
                <Plus size={18} />
                Add Tag
              </PrimaryButton>
            </SectionHeader>
            {tags.length === 0 ? (
              <EmptyState>No tags for this institution yet.</EmptyState>
            ) : (
              flatTags.map(renderTagRow)
            )}
          </Section>

          <Section>
            <SectionHeader>
              <div>
                <SectionTitle>Courses</SectionTitle>
                <SectionHelp>
                  Every course with a cheat sheet or upcoming exam here. {untaggedCount} untagged.
                  General courses taken by everyone can stay untagged. Picking a tag with sub-tags
                  shows them: pick CPE for a CPE-wide course, or CPE then AI for an AI-track one.
                </SectionHelp>
              </div>
            </SectionHeader>
            <Toolbar>
              <SearchBar>
                <Search size={16} />
                <SearchInput
                  type="text"
                  placeholder="Search code or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </SearchBar>
              <CheckboxLabel>
                <input type="checkbox" checked={untaggedOnly} onChange={(e) => setUntaggedOnly(e.target.checked)} />
                Untagged only
              </CheckboxLabel>
            </Toolbar>
            {tags.length === 0 ? (
              <EmptyState>Add a tag first, then tag courses here.</EmptyState>
            ) : visibleCourses.length === 0 ? (
              <EmptyState>No courses match.</EmptyState>
            ) : (
              visibleCourses.map(course => (
                <CourseRow key={course.course_code}>
                  <CourseHead>
                    <CourseCode>{course.course_code}</CourseCode>
                    {course.course_name && <Muted>{course.course_name}</Muted>}
                    <Muted>
                      · {course.sheet_count} sheet{course.sheet_count === 1 ? '' : 's'}, {course.exam_count} exam{course.exam_count === 1 ? '' : 's'}
                    </Muted>
                  </CourseHead>
                  <StudyTagPicker
                    compact
                    tags={tags}
                    value={course.tag_ids}
                    disabled={savingCourse === course.course_code}
                    onChange={(next) => saveCourseTags(course, next)}
                  />
                </CourseRow>
              ))
            )}
          </Section>
        </>
      )}

      {modal && (
        <Overlay onClick={() => setModal(null)}>
          <Modal onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="study-tag-modal-title">
            <ModalHeader>
              <ModalTitle id="study-tag-modal-title">{modal.tag ? 'Edit Tag' : 'Add Tag'}</ModalTitle>
              <CloseButton onClick={() => setModal(null)} aria-label="Close">
                <X size={22} />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label htmlFor="study-tag-name">English name</Label>
              <Input
                id="study-tag-name"
                value={form.name}
                maxLength={120}
                placeholder="e.g. Computer Engineering"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="study-tag-name-th">Thai name (optional)</Label>
              <Input
                id="study-tag-name-th"
                lang="th"
                value={form.name_th}
                maxLength={120}
                placeholder="เช่น วิศวกรรมคอมพิวเตอร์"
                onChange={(e) => setForm({ ...form, name_th: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="study-tag-short">Short name (optional)</Label>
              <Input
                id="study-tag-short"
                value={form.short_name}
                maxLength={20}
                placeholder="e.g. CPE"
                onChange={(e) => setForm({ ...form, short_name: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="study-tag-parent">Under</Label>
              <FullSelect
                id="study-tag-parent"
                value={form.parent_id}
                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
              >
                <option value="">Nothing (top level)</option>
                {parentOptions.map(({ tag, depth }) => (
                  <option key={tag.tag_id} value={tag.tag_id}>
                    {'\u2014 '.repeat(depth - 1)}{tag.name}
                  </option>
                ))}
              </FullSelect>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="study-tag-open-year">Sub-tags open to students from</Label>
              <GateRow>
                <FullSelect
                  id="study-tag-open-year"
                  value={form.open_year}
                  onChange={(e) => setForm({ ...form, open_year: e.target.value })}
                >
                  <option value="">Always (no wait)</option>
                  {[1, 2, 3, 4].map(year => <option key={year} value={year}>Year {year}</option>)}
                </FullSelect>
                {form.open_year && (
                  <FullSelect
                    aria-label="Semester"
                    value={form.open_semester}
                    onChange={(e) => setForm({ ...form, open_semester: e.target.value })}
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </FullSelect>
                )}
              </GateRow>
              <FieldHelp>
                For a tag with sub-tags, e.g. CPE's tracks from Year 3, Semester 2. Until then students
                don't see them; when they get there, Home asks them once to pick one (optional).
              </FieldHelp>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="study-tag-order">Sort order</Label>
              <Input
                id="study-tag-order"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </FormGroup>

            <SaveButton onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </SaveButton>
          </Modal>
        </Overlay>
      )}
    </Container>
  );
}

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { storesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  padding: 2.5rem;
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  margin-bottom: 0.25rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
`;

const SlugLink = styled.a`
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.sizes.base};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.lg};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.semibold};
  margin-bottom: 0.5rem;
`;

const HelpText = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1rem;
`;

const BannerPreview = styled.div`
  width: 100%;
  aspect-ratio: 16 / 5;
  border-radius: ${props => props.theme.radius.lg};
  overflow: hidden;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textTertiary};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const IconPreview = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textTertiary};
  font-size: ${props => props.theme.typography.sizes.xs};
`;

const Input = styled.input`
  padding: 0.625rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.sm};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  width: 100%;
`;

const FileInfo = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.5rem;
`;

const Button = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => props.theme.colors.primary};
  color: white;
  box-shadow: ${props => props.theme.shadows.sm};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:disabled {
    background: ${props => props.theme.colors.textTertiary};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

const ManageFlagshipStore = () => {
  const navigate = useNavigate();
  // Present when an admin reaches this page from the "Existing Stores" list
  // to manage a store they don't belong to — self-service visitors hit
  // /store-management with no slug and fall back to "my store" below.
  const { slug: adminSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [savingBanner, setSavingBanner] = useState(false);

  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [savingIcon, setSavingIcon] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminSlug]);

  const fetchStore = async () => {
    try {
      const response = adminSlug
        ? await storesAPI.getBySlug(adminSlug)
        : await storesAPI.getMyStore();
      setStore(response.data.store);
      setBannerPreview(response.data.store.banner_image_path || null);
      setIconPreview(response.data.store.icon_image_path || null);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch flagship store:', error);
        toast.error('Failed to load your flagship store');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be 15MB or smaller');
      e.target.value = '';
      return;
    }

    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (kind) => {
    const isBanner = kind === 'banner';
    const file = isBanner ? bannerFile : iconFile;
    if (!file) {
      toast.error(`Please choose a ${kind} image first`);
      return;
    }

    const setSaving = isBanner ? setSavingBanner : setSavingIcon;
    const uploadFn = isBanner ? storesAPI.uploadBanner : storesAPI.uploadIcon;
    const fieldName = isBanner ? 'banner_image' : 'icon_image';

    let toastId;
    try {
      setSaving(true);
      toastId = toast.loading(`Uploading ${kind}... 0%`);

      const formData = new FormData();
      formData.append(fieldName, file);

      const response = await uploadFn(store.store_id, formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        toast.loading(`Uploading ${kind}... ${percent}%`, { id: toastId });
      });

      toast.dismiss(toastId);
      toast.success(`${isBanner ? 'Banner' : 'Icon'} updated!`);

      const updatedPath = isBanner ? response.data.banner_image_path : response.data.icon_image_path;
      if (isBanner) {
        setStore(prev => ({ ...prev, banner_image_path: updatedPath }));
        setBannerFile(null);
      } else {
        setStore(prev => ({ ...prev, icon_image_path: updatedPath }));
        setIconFile(null);
      }
    } catch (error) {
      if (toastId) toast.dismiss(toastId);
      console.error(`Failed to upload store ${kind}:`, error);
      toast.error(error.response?.data?.message || `Failed to upload ${kind}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!store) {
    return (
      <Container>
        <Card>
          <EmptyState>
            <Title>{adminSlug ? 'Store Not Found' : 'No Flagship Store Yet'}</Title>
            <HelpText>
              {adminSlug
                ? "This store doesn't exist or is no longer active."
                : "You don't belong to a flagship store. Request one to get started."}
            </HelpText>
            {!adminSlug && (
              <Button onClick={() => navigate('/request-flagship-store')}>Request a Flagship Store</Button>
            )}
          </EmptyState>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        {adminSlug && <HelpText>You're editing this store as an admin.</HelpText>}
        <Title>{store.name}</Title>
        <SlugLink href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer">
          /store/{store.slug} ↗
        </SlugLink>
      </Card>

      <Card>
        <SectionTitle>Banner</SectionTitle>
        <HelpText>Shown at the top of your store page. Recommended: wide images, at least 1600x500.</HelpText>
        <BannerPreview $image={bannerPreview}>
          {!bannerPreview && 'No banner uploaded yet'}
        </BannerPreview>
        <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setBannerFile, setBannerPreview)} />
        {bannerFile && <FileInfo>Selected: {bannerFile.name} ({(bannerFile.size / 1024 / 1024).toFixed(2)} MB)</FileInfo>}
        <Button onClick={() => uploadImage('banner')} disabled={!bannerFile || savingBanner}>
          {savingBanner ? 'Uploading...' : 'Save Banner'}
        </Button>
      </Card>

      <Card>
        <SectionTitle>Icon / Logo</SectionTitle>
        <HelpText>Shown next to your store's name and as a small badge on your cheat sheets. Square images work best.</HelpText>
        <IconPreview $image={iconPreview}>
          {!iconPreview && 'No icon'}
        </IconPreview>
        <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setIconFile, setIconPreview)} />
        {iconFile && <FileInfo>Selected: {iconFile.name} ({(iconFile.size / 1024 / 1024).toFixed(2)} MB)</FileInfo>}
        <Button onClick={() => uploadImage('icon')} disabled={!iconFile || savingIcon}>
          {savingIcon ? 'Uploading...' : 'Save Icon'}
        </Button>
      </Card>
    </Container>
  );
};

export default ManageFlagshipStore;

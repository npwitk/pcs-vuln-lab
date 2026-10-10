import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { settingsAPI } from '../services/api';

const BannerContainer = styled.div`
  background: ${props => {
    switch (props.type) {
      case 'warning':
        return props.theme.colors.warning || '#FFA500';
      case 'success':
        return props.theme.colors.success || '#10B981';
      case 'error':
        return props.theme.colors.danger || '#EF4444';
      case 'info':
      default:
        return props.theme.colors.primary || '#3B82F6';
    }
  }};
  color: white;
  padding: 1rem 2rem;
  margin-bottom: 2rem;
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  animation: slideDown 0.3s ease-out;
  position: relative;

  ${props => props.$exiting && `
    animation: slideUp 200ms ease-out forwards;
  `}

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 2.5rem 1rem 1rem 1rem;
    align-items: stretch;
  }
`;

const BannerContent = styled.div`
  flex: 1;
`;

const BannerTitle = styled.h3`
  font-size: ${props => props.theme.typography.sizes.lg};
  font-weight: ${props => props.theme.typography.weights.bold};
  margin: 0 0 0.25rem 0;
`;

const BannerMessage = styled.p`
  font-size: ${props => props.theme.typography.sizes.base};
  margin: 0;
  opacity: 0.95;
`;

const BannerLink = styled.a`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: ${props => props.theme.radius.md};
  text-decoration: none;
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.sm};
  transition: all ${props => props.theme.transitions.fast};
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
    padding: 0.75rem 1.25rem;
    margin-top: 0.5rem;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  opacity: 0.8;
  transition: opacity ${props => props.theme.transitions.fast};

  &:hover {
    opacity: 1;
  }

  @media (max-width: 768px) {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.5rem;
    font-size: 1.75rem;
  }
`;

const shouldDisplayAnnouncement = (data) => {
  const now = new Date();

  // Check start date
  if (data.startDate) {
    const startDate = new Date(data.startDate);
    if (now < startDate) {
      return false;
    }
  }

  // Check end date
  if (data.endDate) {
    const endDate = new Date(data.endDate);
    endDate.setHours(23, 59, 59, 999); // End of day
    if (now > endDate) {
      return false;
    }
  }

  return true;
};

const isDismissed = (data) => {
  const dismissedKey = `announcement_dismissed_${data.title}_${data.startDate}`;
  return !!localStorage.getItem(dismissedKey);
};

const CACHE_KEY = 'announcement_cache_v1';

// Synchronous read so a returning visitor's banner renders on first paint
// instead of popping in after the fetch resolves (the main CLS source here).
const readCachedAnnouncement = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.enabled || !shouldDisplayAnnouncement(data) || isDismissed(data)) return null;
    return data;
  } catch {
    return null;
  }
};

const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState(readCachedAnnouncement);
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const response = await settingsAPI.getAnnouncement();
      const data = response.data;
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));

      if (data.enabled && shouldDisplayAnnouncement(data) && !isDismissed(data)) {
        setAnnouncement(data);
      } else {
        setAnnouncement(null);
      }
    } catch (error) {
      console.error('Failed to fetch announcement:', error);
    }
  };

  const handleDismiss = () => {
    if (announcement) {
      const dismissedKey = `announcement_dismissed_${announcement.title}_${announcement.startDate}`;
      localStorage.setItem(dismissedKey, 'true');
    }
    setIsExiting(true);
    setTimeout(() => setIsVisible(false), 200);
  };

  if (!announcement || !isVisible) {
    return null;
  }

  return (
    <BannerContainer type={announcement.type} $exiting={isExiting}>
      <BannerContent>
        {announcement.title && <BannerTitle>{announcement.title}</BannerTitle>}
        <BannerMessage>{announcement.message}</BannerMessage>
      </BannerContent>

      {announcement.link && (
        <BannerLink
          href={announcement.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {announcement.linkText || 'Learn More'}
        </BannerLink>
      )}

      <CloseButton onClick={handleDismiss} aria-label="Close announcement">
        ×
      </CloseButton>
    </BannerContainer>
  );
};

export default AnnouncementBanner;

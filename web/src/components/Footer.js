import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import PeanutIcon from './PeanutIcon';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { isBirthdayWindow } from '../utils/birthday';

const FooterContainer = styled.footer`
  background: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.border};
  padding: 2.5rem 2rem 1.5rem;
  margin-top: auto;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SwitcherRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FooterTitle = styled.h3`
  font-size: ${props => props.theme.typography.sizes.lg};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const FooterDescription = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FooterLink = styled(Link)`
  color: ${props => props.theme.colors.textSecondary};
  text-decoration: none;
  font-size: ${props => props.theme.typography.sizes.sm};
  transition: color ${props => props.theme.transitions.fast};
  display: inline-flex;
  align-items: center;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const ScrollToTopLink = styled(Link)`
  color: ${props => props.theme.colors.textSecondary};
  text-decoration: none;
  font-size: ${props => props.theme.typography.sizes.sm};
  transition: color ${props => props.theme.transitions.fast};
  display: inline-flex;
  align-items: center;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const FooterBottom = styled.div`
  max-width: 1200px;
  margin: 2rem auto 0;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textTertiary};
`;

const BrandSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const StyledPeanutIcon = styled(PeanutIcon)`
  width: 28px;
  height: 28px;
  fill: ${props => props.theme.colors.primary};
`;

const BrandName = styled.span`
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.primary};
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated, isSeller, isAdmin, isStaff } = useAuth();
  const { t } = useTranslation();

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Track footer link clicks
  const trackFooterClick = (linkName, linkType = 'internal') => {
    if (isAuthenticated) {
      analyticsAPI.track('footer_link_click', {
        additional_data: {
          link_name: linkName,
          link_type: linkType
        },
        page_url: window.location.pathname
      }).catch(err => console.error('Analytics tracking failed:', err));
    }
  };

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <BrandSection>
            <StyledPeanutIcon />
            <BrandName>Peanut</BrandName>
          </BrandSection>
          <FooterDescription>
            {t('footer.tagline')}
          </FooterDescription>
          <SwitcherRow>
            <ThemeSwitcher />
            <LanguageSwitcher />
          </SwitcherRow>
        </FooterSection>

        <FooterSection>
          <FooterTitle>{t('footer.quickLinks')}</FooterTitle>
          <FooterLinks>
            <ScrollToTopLink
              to="/"
              onClick={() => {
                scrollToTop();
                trackFooterClick('Browse Cheat Sheets', 'internal');
              }}
            >
              {t('footer.browseCheatSheets')}
            </ScrollToTopLink>


            {isAuthenticated && (
              <>
                <ScrollToTopLink
                  to="/my-purchases"
                  onClick={() => {
                    scrollToTop();
                    trackFooterClick('My Library', 'internal');
                  }}
                >
                  {t('footer.myLibrary')}
                </ScrollToTopLink>
                <ScrollToTopLink
                  to="/support"
                  onClick={() => {
                    scrollToTop();
                    trackFooterClick('Support', 'internal');
                  }}
                >
                  {t('footer.support')}
                </ScrollToTopLink>
                {/* Apply to be Seller - hide if already seller/admin/staff */}
                {!isSeller && !isAdmin && !isStaff && (
                  <ScrollToTopLink
                    to="/apply-seller"
                    onClick={() => {
                      scrollToTop();
                      trackFooterClick('Become a Seller', 'internal');
                    }}
                  >
                    {t('footer.becomeSeller')}
                  </ScrollToTopLink>
                )}


              </>
            )}
          </FooterLinks>
        </FooterSection>

        <FooterSection>
          <FooterTitle>{t('footer.legal')}</FooterTitle>
          <FooterLinks>
            <ScrollToTopLink
              to="/legal/privacy-policy"
              onClick={() => {
                scrollToTop();
                trackFooterClick('Privacy Policy', 'internal');
              }}
            >
              {t('footer.privacyPolicy')}
            </ScrollToTopLink>
            <ScrollToTopLink
              to="/legal/terms-of-service"
              onClick={() => {
                scrollToTop();
                trackFooterClick('Terms of Service', 'internal');
              }}
            >
              {t('footer.termsOfService')}
            </ScrollToTopLink>
          </FooterLinks>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <Copyright>
          {t('footer.copyright', { year: currentYear })}
        </Copyright>
        <Copyright>
          {t('footer.madeWith')}
          {' · '}{t('birthday.est')}
          {/* Peanut's birthday month: one more nudge towards the Easter egg. */}
          {isBirthdayWindow() && <> · {t('birthday.age')}</>}
        </Copyright>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;

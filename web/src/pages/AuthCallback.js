import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import { takePostLoginPath } from '../utils/postLogin';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  font-size: 1.2rem;
  color: #666;
`;

const AuthCallback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    const processAuth = async () => {
      // Get token from URL query params
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const error = params.get('error');

      // DEBUG: Uncomment for troubleshooting auth flow (SECURITY: Remove in production)
      // console.log('Auth callback - token:', token);
      // console.log('Auth callback - error:', error);
      // console.log('Auth callback - full URL:', window.location.href);

      if (error) {
        console.error('Authentication failed:', error);
        alert(t('auth.authFailedAlert', { error }));
        navigate('/');
        return;
      }

      if (token) {
        // DEBUG: Uncomment for troubleshooting (SECURITY: Remove in production)
        // console.log('Token received, storing and fetching user...');
        await handleAuthCallback(token);
        // DEBUG: Uncomment for troubleshooting (SECURITY: Remove in production)
        // console.log('User data loaded, navigating...');
        navigate(takePostLoginPath() || '/');
      } else {
        console.error('No token in URL params');
        alert(t('auth.noTokenAlert'));
        navigate('/');
      }
    };

    processAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, handleAuthCallback]);

  return <Container>{t('auth.processingLogin')}</Container>;
};

export default AuthCallback;

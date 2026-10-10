import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// NOTE: This replaces Google OAuth with a local username/password form for the
// CSS484 vulnerable lab. The submit hits POST /api/auth/login, which is
// SQL-injectable (V1): try  x' OR '1'='1' --  with any password.

const Wrap = styled.div`
  min-height: 70vh; display: flex; align-items: center; justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;
const Card = styled.div`
  width: 100%; max-width: 380px; background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.xl};
`;
const Logo = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center; margin-bottom: ${({ theme }) => theme.spacing.xs};
`;
const Sub = styled.p`
  text-align: center; color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg}; font-size: ${({ theme }) => theme.typography.sizes.sm};
`;
const Label = styled.label`
  display: block; font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary}; margin: ${({ theme }) => theme.spacing.md} 0 6px;
`;
const Input = styled.input`
  width: 100%; padding: 11px 13px; font-size: ${({ theme }) => theme.typography.sizes.base};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background}; color: ${({ theme }) => theme.colors.text};
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;
const Button = styled.button`
  width: 100%; margin-top: ${({ theme }) => theme.spacing.lg}; padding: 12px;
  font-size: ${({ theme }) => theme.typography.sizes.base}; font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: #fff; background: ${({ theme }) => theme.colors.primary}; border: 0;
  border-radius: ${({ theme }) => theme.radius.md}; cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:disabled { opacity: .6; cursor: default; }
`;
const Hint = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg}; font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textTertiary}; text-align: center; line-height: 1.6;
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const { handleAuthCallback } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await authAPI.login(email, password);
      if (res.data?.token) {
        await handleAuthCallback(res.data.token);
        toast.success(`Welcome, ${res.data.user?.name || 'back'}!`);
        navigate('/');
      } else {
        toast.error('No token returned');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Wrap>
      <Card>
        <Logo>🥜 Peanut Cheat Sheets</Logo>
        <Sub>Sign in to your account (dev)</Sub>
        <form onSubmit={submit}>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                 placeholder="you@dev.peanut.local" autoComplete="off" />
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 placeholder="••••••••" autoComplete="off" />
          <Button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
        </form>
        <Hint>Demo accounts: alice@dev.peanut.local / alice123 · admin@dev.peanut.local / admin123</Hint>
      </Card>
    </Wrap>
  );
}

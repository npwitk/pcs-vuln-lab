import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { safeqAPI } from '../services/api';
import { FormGroup, Label } from './ui/FormGroup';
import { Input } from './ui/Input';
import Button from './ui/Button';
import { getErrorMessage } from '../utils/getErrorMessage';

// Shared between the standalone print-balance page and the print-request
// creation modal on CheatSheetDetail.js — one real SafeQ login confirms the
// account, then only the username is remembered (never the password), so
// whatever this unlocks (checking balance's re-entry is separate; printing)
// needs no further password entry until the 30-day trust expires.
const SafeqVerifyForm = ({ initialUsername = '', onVerified, submitLabel = 'Verify Thammasat Printer Account' }) => {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const response = await safeqAPI.verify(username, password);
      // A wrong password resolves as a 401 here (validateStatus lets it
      // through instead of throwing) rather than rejecting — check success
      // explicitly instead of relying on catch for that case.
      if (!response.data.success) {
        toast.error(typeof response.data.error === 'string' ? response.data.error : 'Failed to verify credentials');
        return;
      }
      setPassword('');
      toast.success('Verified! No further password needed for 30 days.');
      onVerified?.({
        verified: true,
        safeqUsername: response.data.safeqUsername,
        verifiedAt: new Date().toISOString(),
        expiresAt: response.data.verifiedUntil,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to verify credentials'));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <FormGroup>
        <Label htmlFor="safeq-verify-username">Thammasat Printer Username</Label>
        <Input
          id="safeq-verify-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your university ID"
          autoComplete="off"
          required
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="safeq-verify-password">Thammasat Printer Password</Label>
        <Input
          id="safeq-verify-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          autoComplete="off"
          required
        />
      </FormGroup>
      <Button type="submit" $variant="primary" disabled={verifying}>
        {verifying ? 'Verifying...' : submitLabel}
      </Button>
    </form>
  );
};

export default SafeqVerifyForm;

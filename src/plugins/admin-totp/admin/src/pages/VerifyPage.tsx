import { useEffect, useState } from 'react';
import { TOTPVerify } from './TOTPVerify';
import { Box, Typography, Flex, Loader } from '@strapi/design-system';

type TotpSession = {
  totpSessionToken: string;
  expiresAt: string;
  user: {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
  };
  needsSetup: boolean;
};

const VerifyPage = () => {
  const [session, setSession] = useState<TotpSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Read session from sessionStorage
    const stored = sessionStorage.getItem('totpSession');
    if (!stored) {
      setError('No TOTP session found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as TotpSession;

      // Check if session has expired
      if (new Date(parsed.expiresAt) < new Date()) {
        sessionStorage.removeItem('totpSession');
        setError('TOTP session has expired. Please log in again.');
        setLoading(false);
        return;
      }

      setSession(parsed);
    } catch (e) {
      setError('Invalid session data. Please log in again.');
    }
    setLoading(false);
  }, []);

  const handleVerify = async (code: string) => {
    if (!session) throw new Error('No session');

    const response = await fetch('/admin-totp/totp/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        totpSessionToken: session.totpSessionToken,
        code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || 'Verification failed');
    }

    // Clear the TOTP session
    sessionStorage.removeItem('totpSession');

    // Store the token - Strapi admin looks for this
    if (data?.data?.token) {
      // Set the jwtToken cookie that Strapi admin expects
      document.cookie = `jwtToken=${data.data.token}; path=/admin`;
    }

    // Redirect to admin home
    window.location.href = '/admin';
  };

  const handleCancel = () => {
    sessionStorage.removeItem('totpSession');
    window.location.href = '/admin/auth/login';
  };

  if (loading) {
    return (
      <Box
        padding={8}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader>Loading...</Loader>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        padding={8}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Flex direction="column" alignItems="center" gap={4}>
          <Typography variant="alpha" textColor="danger600">
            Error
          </Typography>
          <Typography variant="omega">{error}</Typography>
          <a href="/admin/auth/login" style={{ color: '#4945ff' }}>
            Back to Login
          </a>
        </Flex>
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f6f6f9',
      }}
    >
      <Box
        background="neutral0"
        shadow="tableShadow"
        padding={8}
        borderRadius="4px"
        style={{ maxWidth: '450px', width: '100%' }}
      >
        <TOTPVerify
          onVerify={handleVerify}
          onCancel={handleCancel}
          userEmail={session.user.email}
          needsSetup={session.needsSetup}
        />
      </Box>
    </Box>
  );
};

export default VerifyPage;

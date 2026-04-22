import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Flex,
  TextInput,
  Field,
} from '@strapi/design-system';

type TOTPVerifyProps = {
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
  userEmail?: string;
  needsSetup?: boolean;
};

export const TOTPVerify = ({
  onVerify,
  onCancel,
  userEmail,
  needsSetup,
}: TOTPVerifyProps) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code || code.length < 6) {
      setError('Please enter a valid code');
      return;
    }

    setSubmitting(true);
    try {
      await onVerify(code);
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setSubmitting(false);
    }
  };

  if (needsSetup) {
    return (
      <Box padding={8}>
        <Flex direction="column" alignItems="center" gap={4}>
          <Typography variant="alpha">Two-Factor Authentication Required</Typography>
          <Typography variant="omega" textColor="neutral600">
            Your administrator requires you to set up two-factor authentication.
            Please contact your administrator for assistance.
          </Typography>
          <Button variant="tertiary" onClick={onCancel}>
            Back to Login
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box padding={8}>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" alignItems="center" gap={6}>
          <Typography variant="alpha">Two-Factor Authentication</Typography>
          {userEmail && (
            <Typography variant="omega" textColor="neutral600">
              Enter the code for {userEmail}
            </Typography>
          )}

          <Box width="100%" maxWidth="320px">
            <Field.Root error={error}>
              <Field.Label>Verification Code</Field.Label>
              <TextInput
                placeholder="Enter 6-digit code or backup code"
                value={code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCode(e.target.value);
                  setError('');
                }}
                autoFocus
              />
              <Field.Hint>
                Enter the code from your authenticator app or a backup code
              </Field.Hint>
              {error && <Field.Error>{error}</Field.Error>}
            </Field.Root>
          </Box>

          <Flex gap={2}>
            <Button variant="tertiary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Verify
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
};

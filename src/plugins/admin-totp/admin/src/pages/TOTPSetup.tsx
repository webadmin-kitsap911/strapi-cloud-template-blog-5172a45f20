import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Flex,
  TextInput,
  Field,
  Loader,
} from '@strapi/design-system';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { BackupCodesDisplay } from '../components/BackupCodesDisplay';

type SetupData = {
  qrCode: string;
  secret: string;
};

type TOTPSetupProps = {
  onComplete: () => void;
  onCancel: () => void;
};

export const TOTPSetup = ({ onComplete, onCancel }: TOTPSetupProps) => {
  const { post } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const beginSetup = async () => {
      try {
        const { data } = await post('/admin-totp/totp/setup/begin', {});
        setSetupData(data.data);
      } catch (error: any) {
        toggleNotification({
          type: 'danger',
          message:
            error?.response?.data?.error?.message || 'Failed to start TOTP setup',
        });
      } finally {
        setLoading(false);
      }
    };

    beginSetup();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!verificationCode || verificationCode.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await post('/admin-totp/totp/setup/complete', {
        code: verificationCode,
      });
      setBackupCodes(data.data.backupCodes);
      toggleNotification({
        type: 'success',
        message: 'Two-factor authentication enabled successfully',
      });
    } catch (error: any) {
      setError(
        error?.response?.data?.error?.message || 'Invalid verification code'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box padding={8}>
        <Flex justifyContent="center">
          <Loader>Loading...</Loader>
        </Flex>
      </Box>
    );
  }

  if (backupCodes) {
    return (
      <Box padding={8}>
        <Flex direction="column" gap={6} alignItems="center">
          <Typography variant="alpha">Save Your Backup Codes</Typography>
          <Box width="100%" maxWidth="500px">
            <BackupCodesDisplay codes={backupCodes} />
          </Box>
          <Button onClick={onComplete}>I've saved these codes</Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box padding={8}>
      <form onSubmit={handleVerify}>
        <Flex direction="column" gap={6} alignItems="center">
          <Typography variant="alpha">Set Up Two-Factor Authentication</Typography>
          <Typography variant="omega" textColor="neutral600">
            Scan this QR code with your authenticator app
          </Typography>

          {setupData && (
            <QRCodeDisplay qrCode={setupData.qrCode} secret={setupData.secret} />
          )}

          <Box width="100%" maxWidth="320px">
            <Field.Root error={error}>
              <Field.Label>Verification Code</Field.Label>
              <TextInput
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setVerificationCode(e.target.value);
                  setError('');
                }}
                maxLength={6}
              />
              <Field.Hint>
                Enter the code from your authenticator app to complete setup
              </Field.Hint>
              {error && <Field.Error>{error}</Field.Error>}
            </Field.Root>
          </Box>

          <Flex gap={2}>
            <Button variant="tertiary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Enable Two-Factor Auth
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
};

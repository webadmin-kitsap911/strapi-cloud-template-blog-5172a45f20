import { useState, useEffect } from 'react';
import {
  Main,
  Box,
  Typography,
  Button,
  Flex,
  TextInput,
  Modal,
  Field,
  Loader,
} from '@strapi/design-system';
import { Check, Cross } from '@strapi/icons';
import { useFetchClient, useNotification, Layouts } from '@strapi/strapi/admin';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { BackupCodesDisplay } from '../components/BackupCodesDisplay';

type TOTPStatus = {
  enabled: boolean;
  required: boolean;
  remainingBackupCodes: number;
};

type SetupData = {
  qrCode: string;
  secret: string;
};

export const HomePage = () => {
  const { get, post } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<TOTPStatus | null>(null);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [isBackupCodesModalOpen, setIsBackupCodesModalOpen] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchStatus = async () => {
    try {
      const { data } = await get('/admin-totp/totp/status');
      setStatus(data.data);
    } catch (error) {
      toggleNotification({
        type: 'danger',
        message: 'Failed to fetch TOTP status',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleBeginSetup = async () => {
    setSubmitting(true);
    try {
      const { data } = await post('/admin-totp/totp/setup/begin', {});
      setSetupData(data.data);
      setIsSetupModalOpen(true);
    } catch (error: any) {
      toggleNotification({
        type: 'danger',
        message: error?.response?.data?.error?.message || 'Failed to start TOTP setup',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSetup = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      toggleNotification({
        type: 'warning',
        message: 'Please enter a valid 6-digit code',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await post('/admin-totp/totp/setup/complete', {
        code: verificationCode,
      });
      setBackupCodes(data.data.backupCodes);
      setIsSetupModalOpen(false);
      setIsBackupCodesModalOpen(true);
      setVerificationCode('');
      await fetchStatus();
      toggleNotification({
        type: 'success',
        message: 'Two-factor authentication enabled successfully',
      });
    } catch (error: any) {
      toggleNotification({
        type: 'danger',
        message: error?.response?.data?.error?.message || 'Failed to verify code',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable = async () => {
    if (!password) {
      toggleNotification({
        type: 'warning',
        message: 'Please enter your password',
      });
      return;
    }

    setSubmitting(true);
    try {
      await post('/admin-totp/totp/disable', { password });
      setIsDisableModalOpen(false);
      setPassword('');
      await fetchStatus();
      toggleNotification({
        type: 'success',
        message: 'Two-factor authentication disabled',
      });
    } catch (error: any) {
      toggleNotification({
        type: 'danger',
        message: error?.response?.data?.error?.message || 'Failed to disable TOTP',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!password) {
      toggleNotification({
        type: 'warning',
        message: 'Please enter your password',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await post('/admin-totp/totp/backup-codes/regenerate', {
        password,
      });
      setBackupCodes(data.data.backupCodes);
      setIsRegenerateModalOpen(false);
      setIsBackupCodesModalOpen(true);
      setPassword('');
      await fetchStatus();
      toggleNotification({
        type: 'success',
        message: 'Backup codes regenerated successfully',
      });
    } catch (error: any) {
      toggleNotification({
        type: 'danger',
        message: error?.response?.data?.error?.message || 'Failed to regenerate backup codes',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Main>
        <Layouts.Header title="Two-Factor Authentication" />
        <Layouts.Content>
          <Flex justifyContent="center" padding={8}>
            <Loader>Loading...</Loader>
          </Flex>
        </Layouts.Content>
      </Main>
    );
  }

  return (
    <Main>
      <Layouts.Header
        title="Two-Factor Authentication"
        subtitle="Secure your account with an authenticator app"
      />
      <Layouts.Content>
        <Box background="neutral0" padding={6} shadow="tableShadow" hasRadius>
          <Flex direction="column" gap={6}>
            <Flex justifyContent="space-between" alignItems="center">
              <Flex direction="column" gap={1}>
                <Typography variant="delta">Status</Typography>
                <Flex gap={2} alignItems="center">
                  {status?.enabled ? (
                    <>
                      <Check fill="success600" />
                      <Typography textColor="success600" fontWeight="bold">
                        Enabled
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Cross fill="danger600" />
                      <Typography textColor="danger600" fontWeight="bold">
                        Disabled
                      </Typography>
                    </>
                  )}
                  {status?.required && (
                    <Typography variant="pi" textColor="neutral600">
                      (Required by administrator)
                    </Typography>
                  )}
                </Flex>
              </Flex>

              {!status?.enabled ? (
                <Button onClick={handleBeginSetup} loading={submitting}>
                  Enable Two-Factor Auth
                </Button>
              ) : (
                <Flex gap={2}>
                  <Button
                    variant="secondary"
                    onClick={() => setIsRegenerateModalOpen(true)}
                  >
                    Regenerate Backup Codes
                  </Button>
                  {!status?.required && (
                    <Button
                      variant="danger-light"
                      onClick={() => setIsDisableModalOpen(true)}
                    >
                      Disable
                    </Button>
                  )}
                </Flex>
              )}
            </Flex>

            {status?.enabled && (
              <Box>
                <Typography variant="omega" textColor="neutral600">
                  Backup codes remaining: {status.remainingBackupCodes}
                </Typography>
              </Box>
            )}
          </Flex>
        </Box>

        {/* Setup Modal */}
        <Modal.Root open={isSetupModalOpen} onOpenChange={setIsSetupModalOpen}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Set Up Two-Factor Authentication</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Flex direction="column" gap={6}>
                <Typography>
                  Scan this QR code with your authenticator app (like Google
                  Authenticator, Authy, or 1Password).
                </Typography>
                {setupData && (
                  <QRCodeDisplay
                    qrCode={setupData.qrCode}
                    secret={setupData.secret}
                  />
                )}
                <Field.Root>
                  <Field.Label>Verification Code</Field.Label>
                  <TextInput
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setVerificationCode(e.target.value)
                    }
                    maxLength={6}
                  />
                  <Field.Hint>
                    Enter the 6-digit code from your authenticator app to verify
                    setup
                  </Field.Hint>
                </Field.Root>
              </Flex>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close>
                <Button variant="tertiary">Cancel</Button>
              </Modal.Close>
              <Button onClick={handleCompleteSetup} loading={submitting}>
                Enable
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>

        {/* Disable Modal */}
        <Modal.Root open={isDisableModalOpen} onOpenChange={setIsDisableModalOpen}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Disable Two-Factor Authentication</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Flex direction="column" gap={4}>
                <Typography>
                  Enter your password to disable two-factor authentication.
                </Typography>
                <Field.Root>
                  <Field.Label>Password</Field.Label>
                  <TextInput
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                  />
                </Field.Root>
              </Flex>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close>
                <Button variant="tertiary">Cancel</Button>
              </Modal.Close>
              <Button variant="danger" onClick={handleDisable} loading={submitting}>
                Disable
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>

        {/* Regenerate Backup Codes Modal */}
        <Modal.Root open={isRegenerateModalOpen} onOpenChange={setIsRegenerateModalOpen}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Regenerate Backup Codes</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Flex direction="column" gap={4}>
                <Typography>
                  This will invalidate all existing backup codes and generate
                  new ones. Enter your password to continue.
                </Typography>
                <Field.Root>
                  <Field.Label>Password</Field.Label>
                  <TextInput
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                  />
                </Field.Root>
              </Flex>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close>
                <Button variant="tertiary">Cancel</Button>
              </Modal.Close>
              <Button onClick={handleRegenerateBackupCodes} loading={submitting}>
                Regenerate
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>

        {/* Backup Codes Display Modal */}
        <Modal.Root open={isBackupCodesModalOpen} onOpenChange={setIsBackupCodesModalOpen}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Your Backup Codes</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {backupCodes && <BackupCodesDisplay codes={backupCodes} />}
            </Modal.Body>
            <Modal.Footer>
              <Button
                onClick={() => {
                  setIsBackupCodesModalOpen(false);
                  setBackupCodes(null);
                }}
              >
                I've saved these codes
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>
      </Layouts.Content>
    </Main>
  );
};

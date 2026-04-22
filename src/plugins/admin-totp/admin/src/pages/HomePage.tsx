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
  Tabs,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
} from '@strapi/design-system';
import { Check, Cross, ArrowClockwise, Lock } from '@strapi/icons';
import { useFetchClient, useNotification, Layouts, useAuth } from '@strapi/strapi/admin';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { BackupCodesDisplay } from '../components/BackupCodesDisplay';

type TOTPStatus = {
  enabled: boolean;
  required: boolean;
  remainingBackupCodes: number;
};

type AdminUser = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  isActive: boolean;
  totp_enabled?: boolean;
  totp_required?: boolean;
};

type SetupData = {
  qrCode: string;
  secret: string;
};

export const HomePage = () => {
  const { get, post, put } = useFetchClient();
  const { toggleNotification } = useNotification();
  const { user: currentUser } = useAuth('HomePage', (state) => state);

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

  // Admin management state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isRequireModalOpen, setIsRequireModalOpen] = useState(false);

  const isSuperAdmin = currentUser?.roles?.some(
    (role: any) => role.code === 'strapi-super-admin'
  );

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

  const fetchAdminUsers = async () => {
    if (!isSuperAdmin) return;

    setLoadingUsers(true);
    try {
      // Fetch all admin users
      const { data: usersData } = await get('/admin/users');
      const users = usersData.data.results || usersData.data || [];

      // Fetch TOTP status for each user
      const usersWithStatus = await Promise.all(
        users.map(async (user: AdminUser) => {
          try {
            const { data: statusData } = await get(
              `/admin-totp/totp/users/${user.id}/status`
            );
            return {
              ...user,
              totp_enabled: statusData.data.enabled,
              totp_required: statusData.data.required,
            };
          } catch {
            return user;
          }
        })
      );

      setAdminUsers(usersWithStatus);
    } catch (error) {
      toggleNotification({
        type: 'danger',
        message: 'Failed to fetch admin users',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    if (isSuperAdmin) {
      fetchAdminUsers();
    }
  }, [isSuperAdmin]);

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

  const handleResetUserTOTP = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      await post(`/admin-totp/totp/users/${selectedUser.id}/reset`, {});
      setIsResetModalOpen(false);
      setSelectedUser(null);
      await fetchAdminUsers();
      toggleNotification({
        type: 'success',
        message: `TOTP reset for ${selectedUser.firstname} ${selectedUser.lastname}`,
      });
    } catch (error: any) {
      toggleNotification({
        type: 'danger',
        message: error?.response?.data?.error?.message || 'Failed to reset TOTP',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetRequired = async (required: boolean) => {
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      await put(`/admin-totp/totp/users/${selectedUser.id}/required`, {
        required,
      });
      setIsRequireModalOpen(false);
      setSelectedUser(null);
      await fetchAdminUsers();
      toggleNotification({
        type: 'success',
        message: required
          ? `TOTP now required for ${selectedUser.firstname} ${selectedUser.lastname}`
          : `TOTP no longer required for ${selectedUser.firstname} ${selectedUser.lastname}`,
      });
    } catch (error: any) {
      toggleNotification({
        type: 'danger',
        message: error?.response?.data?.error?.message || 'Failed to update requirement',
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

  const renderMySettings = () => (
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
  );

  const renderUserManagement = () => (
    <Box background="neutral0" padding={6} shadow="tableShadow" hasRadius>
      <Flex direction="column" gap={4}>
        <Typography variant="delta">Manage User TOTP</Typography>
        <Typography variant="omega" textColor="neutral600">
          Require or reset two-factor authentication for admin users.
        </Typography>

        {loadingUsers ? (
          <Flex justifyContent="center" padding={4}>
            <Loader>Loading users...</Loader>
          </Flex>
        ) : (
          <Table colCount={5} rowCount={adminUsers.length + 1}>
            <Thead>
              <Tr>
                <Th><Typography variant="sigma">Name</Typography></Th>
                <Th><Typography variant="sigma">Email</Typography></Th>
                <Th><Typography variant="sigma">Status</Typography></Th>
                <Th><Typography variant="sigma">Required</Typography></Th>
                <Th><Typography variant="sigma">Actions</Typography></Th>
              </Tr>
            </Thead>
            <Tbody>
              {adminUsers.map((user) => (
                <Tr key={user.id}>
                  <Td>
                    <Typography>
                      {user.firstname} {user.lastname}
                      {user.id === currentUser?.id && ' (you)'}
                    </Typography>
                  </Td>
                  <Td><Typography>{user.email}</Typography></Td>
                  <Td>
                    {user.totp_enabled ? (
                      <Badge active>Enabled</Badge>
                    ) : (
                      <Badge>Disabled</Badge>
                    )}
                  </Td>
                  <Td>
                    {user.totp_required ? (
                      <Badge active>Required</Badge>
                    ) : (
                      <Typography textColor="neutral600">Optional</Typography>
                    )}
                  </Td>
                  <Td>
                    <Flex gap={2}>
                      <IconButton
                        label={user.totp_required ? 'Make optional' : 'Make required'}
                        onClick={() => {
                          setSelectedUser(user);
                          setIsRequireModalOpen(true);
                        }}
                        disabled={user.id === currentUser?.id}
                      >
                        <Lock />
                      </IconButton>
                      {user.totp_enabled && (
                        <IconButton
                          label="Reset TOTP"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsResetModalOpen(true);
                          }}
                          disabled={user.id === currentUser?.id}
                        >
                          <ArrowClockwise />
                        </IconButton>
                      )}
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Flex>
    </Box>
  );

  return (
    <Main>
      <Layouts.Header
        title="Two-Factor Authentication"
        subtitle="Secure your account with an authenticator app"
      />
      <Layouts.Content>
        {isSuperAdmin ? (
          <Tabs.Root defaultValue="my-settings">
            <Tabs.List>
              <Tabs.Trigger value="my-settings">My Settings</Tabs.Trigger>
              <Tabs.Trigger value="user-management">User Management</Tabs.Trigger>
            </Tabs.List>
            <Box paddingTop={4}>
              <Tabs.Content value="my-settings">
                {renderMySettings()}
              </Tabs.Content>
              <Tabs.Content value="user-management">
                {renderUserManagement()}
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        ) : (
          renderMySettings()
        )}

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

        {/* Reset User TOTP Modal */}
        <Modal.Root open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Reset User's Two-Factor Authentication</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Typography>
                Are you sure you want to reset two-factor authentication for{' '}
                <strong>
                  {selectedUser?.firstname} {selectedUser?.lastname}
                </strong>
                ?
              </Typography>
              <Box paddingTop={4}>
                <Typography textColor="neutral600">
                  This will disable their TOTP and they will need to set it up again.
                  {selectedUser?.totp_required &&
                    ' Since TOTP is required for this user, they will be prompted to set it up on their next login.'}
                </Typography>
              </Box>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close>
                <Button variant="tertiary">Cancel</Button>
              </Modal.Close>
              <Button variant="danger" onClick={handleResetUserTOTP} loading={submitting}>
                Reset TOTP
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>

        {/* Require TOTP Modal */}
        <Modal.Root open={isRequireModalOpen} onOpenChange={setIsRequireModalOpen}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>
                {selectedUser?.totp_required
                  ? 'Make TOTP Optional'
                  : 'Require Two-Factor Authentication'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedUser?.totp_required ? (
                <Typography>
                  Are you sure you want to make two-factor authentication optional for{' '}
                  <strong>
                    {selectedUser?.firstname} {selectedUser?.lastname}
                  </strong>
                  ?
                </Typography>
              ) : (
                <>
                  <Typography>
                    Require two-factor authentication for{' '}
                    <strong>
                      {selectedUser?.firstname} {selectedUser?.lastname}
                    </strong>
                    ?
                  </Typography>
                  <Box paddingTop={4}>
                    <Typography textColor="neutral600">
                      {selectedUser?.totp_enabled
                        ? 'This user already has TOTP enabled. They will not be able to disable it.'
                        : 'This user will be prompted to set up TOTP on their next login.'}
                    </Typography>
                  </Box>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close>
                <Button variant="tertiary">Cancel</Button>
              </Modal.Close>
              <Button
                onClick={() => handleSetRequired(!selectedUser?.totp_required)}
                loading={submitting}
              >
                {selectedUser?.totp_required ? 'Make Optional' : 'Require TOTP'}
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>
      </Layouts.Content>
    </Main>
  );
};

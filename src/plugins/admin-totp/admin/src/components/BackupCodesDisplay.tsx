import { Box, Typography, Flex, Grid } from '@strapi/design-system';

type BackupCodesDisplayProps = {
  codes: string[];
};

export const BackupCodesDisplay = ({ codes }: BackupCodesDisplayProps) => {
  return (
    <Box>
      <Box
        background="warning100"
        padding={4}
        marginBottom={4}
        borderRadius="4px"
      >
        <Typography variant="omega" fontWeight="bold" textColor="warning700">
          Save these backup codes in a secure place. Each code can only be used
          once to sign in if you lose access to your authenticator app.
        </Typography>
      </Box>
      <Box background="neutral100" padding={4} borderRadius="4px">
        <Grid.Root gap={2}>
          {codes.map((code, index) => (
            <Grid.Item key={index} col={6}>
              <Typography
                variant="sigma"
                style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
              >
                {code}
              </Typography>
            </Grid.Item>
          ))}
        </Grid.Root>
      </Box>
    </Box>
  );
};

import { Box, Typography, Flex } from '@strapi/design-system';

type QRCodeDisplayProps = {
  qrCode: string;
  secret: string;
};

export const QRCodeDisplay = ({ qrCode, secret }: QRCodeDisplayProps) => {
  return (
    <Flex direction="column" alignItems="center" gap={4}>
      <Box
        background="neutral0"
        padding={4}
        borderRadius="4px"
        shadow="tableShadow"
      >
        <img
          src={qrCode}
          alt="QR Code for authenticator app"
          style={{ width: 200, height: 200 }}
        />
      </Box>
      <Box>
        <Typography variant="omega" textColor="neutral600">
          Can't scan the QR code? Enter this code manually:
        </Typography>
        <Box
          background="neutral100"
          padding={2}
          marginTop={2}
          borderRadius="4px"
        >
          <Typography
            variant="sigma"
            fontWeight="bold"
            style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
          >
            {secret}
          </Typography>
        </Box>
      </Box>
    </Flex>
  );
};

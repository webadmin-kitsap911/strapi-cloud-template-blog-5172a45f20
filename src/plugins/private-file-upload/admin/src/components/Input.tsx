import * as React from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import {
  Box,
  Flex,
  Typography,
  Button,
  Field,
} from '@strapi/design-system';
import { Trash, Download, Upload as UploadIcon, File as FileIcon } from '@strapi/icons';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FileInfo {
  id: number;
  name: string;
  url: string;
  size: number;
  mime: string;
  createdAt: string;
}

interface InputProps {
  attribute: {
    type: string;
    customField: string;
  };
  disabled?: boolean;
  intlLabel: {
    id: string;
    defaultMessage: string;
  };
  name: string;
  onChange: (event: { target: { name: string; value: number | null; type: string } }) => void;
  required?: boolean;
  value?: number | null;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLDivElement, InputProps>(
  ({ attribute, disabled, intlLabel, name, onChange, required, value, error, hint }, ref) => {
    const { get, post } = useFetchClient();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [uploadError, setUploadError] = React.useState<string | null>(null);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [folderId, setFolderId] = React.useState<number | null>(null);

    // Fetch the upload folder ID on mount
    React.useEffect(() => {
      const fetchFolderId = async () => {
        try {
          const response = await get('/private-file-upload/folder-id');
          setFolderId(response.data.folderId);
        } catch (err) {
          console.error('Failed to fetch folder ID:', err);
        }
      };

      fetchFolderId();
    }, [get]);

    // Fetch file info when value changes
    React.useEffect(() => {
      const fetchFileInfo = async () => {
        if (value && typeof value === 'number') {
          try {
            const response = await get(`/upload/files/${value}`);
            setFileInfo(response.data);
          } catch (err) {
            console.error('Failed to fetch file info:', err);
            setFileInfo(null);
          }
        } else {
          setFileInfo(null);
        }
      };

      fetchFileInfo();
    }, [value, get]);

    const validateFile = (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
          return `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
        }
      }

      if (file.size > MAX_FILE_SIZE) {
        return `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
      }

      return null;
    };

    const uploadFile = async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      setIsLoading(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append('files', file);
        formData.append(
          'fileInfo',
          JSON.stringify({
            folder: folderId,
            name: file.name,
          })
        );

        const response = await post('/upload', formData);
        const uploadedFile = response.data[0];

        onChange({
          target: {
            name,
            value: uploadedFile.id,
            type: attribute.type,
          },
        });

        setFileInfo(uploadedFile);
      } catch (err) {
        console.error('Upload failed:', err);
        setUploadError('Failed to upload file. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
      // Reset input so same file can be selected again
      event.target.value = '';
    };

    const handleDrop = (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      if (disabled || isLoading) return;

      const file = event.dataTransfer.files?.[0];
      if (file) {
        uploadFile(file);
      }
    };

    const handleDragOver = (event: React.DragEvent) => {
      event.preventDefault();
      if (!disabled && !isLoading) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = () => {
      setIsDragOver(false);
    };

    const handleRemove = async () => {
      onChange({
        target: {
          name,
          value: null,
          type: attribute.type,
        },
      });
      setFileInfo(null);
      setUploadError(null);
    };

    const handleDownload = () => {
      if (fileInfo?.url) {
        window.open(fileInfo.url, '_blank');
      }
    };

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileTypeLabel = (mime: string): string => {
      if (mime.includes('pdf')) return 'PDF';
      if (mime.includes('word') || mime.includes('document')) return 'Word';
      if (mime.includes('excel') || mime.includes('spreadsheet')) return 'Excel';
      if (mime.includes('image')) return 'Image';
      return 'File';
    };

    const label = intlLabel?.defaultMessage || 'File';

    return (
      <Field.Root name={name} error={error || uploadError} hint={hint} required={required} ref={ref}>
        <Field.Label>{label}</Field.Label>

        <div style={{ width: '100%' }}>
        {fileInfo ? (
          // File is attached - show file info
          <Box
            padding={4}
            background="neutral100"
            borderColor="neutral200"
            borderStyle="solid"
            borderWidth="1px"
            borderRadius="4px"
            width="100%"
          >
            <Flex direction="column" alignItems="flex-start" justifyContent="flex-start" gap={3} width="100%">
              <Flex alignItems="flex-start" justifyContent="flex-start" gap={3}>
                <Box
                  background="neutral200"
                  padding={2}
                  borderRadius="4px"
                  display="flex"
                  alignItems="flex-start"
                  justifyContent="flex-start"
                >
                  <FileIcon width={24} height={24} />
                </Box>
                <Flex direction="column" gap={1} alignItems="flex-start" justifyContent="flex-start">
                  <Typography variant="omega" fontWeight="bold" ellipsis>
                    {fileInfo.name}
                  </Typography>
                  <Typography variant="pi" textColor="neutral600">
                    {getFileTypeLabel(fileInfo.mime)} • {formatFileSize(fileInfo.size)}
                  </Typography>
                </Flex>
              </Flex>
              <Flex gap={2}>
                <Button
                  variant="tertiary"
                  onClick={handleDownload}
                  disabled={disabled}
                  size="S"
                >
                  Download
                </Button>
                <Button
                  variant="danger-light"
                  onClick={handleRemove}
                  disabled={disabled || isLoading}
                  size="S"
                >
                  Remove
                </Button>
              </Flex>
            </Flex>
          </Box>
        ) : (
          // No file - show upload dropzone
          <Box
            padding={4}
            background={isDragOver ? 'primary100' : 'neutral100'}
            borderColor={isDragOver ? 'primary500' : error || uploadError ? 'danger500' : 'neutral200'}
            borderStyle="dashed"
            borderWidth="1px"
            borderRadius="4px"
            cursor={disabled ? 'not-allowed' : 'pointer'}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && !isLoading && fileInputRef.current?.click()}
            alignItems="flex-start"
          >
            <Flex alignItems="flex-start" gap={3}>
              <UploadIcon width={24} height={24} color={disabled ? 'neutral400' : 'neutral600'} />
              <Flex direction="column" gap={1} alignItems="flex-start">
                <Typography variant="omega" textColor={disabled ? 'neutral400' : 'neutral600'}>
                  {isLoading ? 'Uploading...' : 'Drop file here or click to upload'}
                </Typography>
                <Typography variant="pi" textColor="neutral500">
                  PDF, Word, Excel, Images • Max 10MB
                </Typography>
              </Flex>
            </Flex>

            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
              onChange={handleFileSelect}
              disabled={disabled || isLoading}
              style={{ display: 'none' }}
            />
          </Box>
        )}
        </div>

        <Field.Error />
        <Field.Hint />
      </Field.Root>
    );
  }
);

Input.displayName = 'PrivateFileInput';

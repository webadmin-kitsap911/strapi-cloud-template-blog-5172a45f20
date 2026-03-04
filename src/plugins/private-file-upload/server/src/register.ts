import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register({
    name: 'private-file',
    plugin: 'private-file-upload',
    type: 'integer', // Stores the media file ID
  });
};

export default register;

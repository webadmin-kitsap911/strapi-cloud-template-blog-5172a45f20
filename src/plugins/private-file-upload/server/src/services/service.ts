import type { Core } from '@strapi/strapi';

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  getFolderId() {
    return strapi.plugin('private-file-upload').folderId || null;
  },
});

export default service;

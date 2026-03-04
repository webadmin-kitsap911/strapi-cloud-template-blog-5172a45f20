import type { Core } from '@strapi/strapi';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getFolderId(ctx) {
    const folderId = strapi
      .plugin('private-file-upload')
      .service('service')
      .getFolderId();

    ctx.body = { folderId };
  },
});

export default controller;

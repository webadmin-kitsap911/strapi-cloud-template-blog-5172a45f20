'use strict';
const bootstrap = require("./bootstrap");

async function computePathFromParent(strapi, slug, parentDocumentId) {
  if (!parentDocumentId) {
    return '/' + slug;
  }

  const slugs = [slug];
  let currentParentId = parentDocumentId;

  while (currentParentId) {
    const parent = await strapi.documents('api::page.page').findOne({
      documentId: currentParentId,
      populate: ['parent'],
    });

    if (!parent) break;
    slugs.unshift(parent.slug);
    currentParentId = parent.parent?.documentId || null;
  }

  return '/' + slugs.join('/');
}

async function getParentDocumentId(strapi, parent) {
  if (!parent) return null;

  if (typeof parent === 'string') return parent;
  if (parent.documentId) return parent.documentId;

  const parentId = parent.connect?.[0]?.id || parent.set?.[0]?.id;
  if (parentId) {
    const parentPage = await strapi.db.query('api::page.page').findOne({
      where: { id: parentId },
      select: ['documentId'],
    });
    return parentPage?.documentId || null;
  }

  return null;
}

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    strapi.documents.use(async (context, next) => {
      if (context.uid !== 'api::page.page') {
        return next();
      }

      const { action, params } = context;

      // Handle create and update actions
      if ((action === 'create' || action === 'update') && params?.data?.slug) {
        const parentDocumentId = await getParentDocumentId(strapi, params.data.parent);
        const computedPath = await computePathFromParent(strapi, params.data.slug, parentDocumentId);
        params.data.path = computedPath;
      }

      // Handle publish action
      if (action === 'publish' && params?.documentId) {
        const page = await strapi.documents('api::page.page').findOne({
          documentId: params.documentId,
          populate: ['parent'],
          status: 'draft',
        });

        if (page?.slug) {
          const parentDocumentId = page.parent?.documentId || null;
          const computedPath = await computePathFromParent(strapi, page.slug, parentDocumentId);
          if (!params.data) params.data = {};
          params.data.path = computedPath;
        }
      }

      const result = await next();

      // After update/publish, update children paths
      if ((action === 'update' || action === 'publish') && result?.documentId) {
        const children = await strapi.documents('api::page.page').findMany({
          filters: { parent: { documentId: result.documentId } },
        });

        for (const child of children) {
          const childPath = await computePathFromParent(strapi, child.slug, result.documentId);
          await strapi.db.query('api::page.page').updateMany({
            where: { documentId: child.documentId },
            data: { path: childPath },
          });
        }
      }

      return result;
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap,
};

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
      if (action === 'create' && params?.data?.slug) {
        const parentDocumentId = await getParentDocumentId(strapi, params.data.parent);
        const computedPath = await computePathFromParent(strapi, params.data.slug, parentDocumentId);
        params.data.path = computedPath;
      }

      // Handle update: always recalculate path to ensure consistency
      if (action === 'update' && params?.documentId) {
        // Get current page data
        const currentPage = await strapi.documents('api::page.page').findOne({
          documentId: params.documentId,
          populate: ['parent'],
          status: 'draft',
        });

        if (currentPage) {
          // Use new slug if provided, otherwise keep current
          const slug = params.data?.slug || currentPage.slug;

          // Start with current parent
          let parentDocumentId = currentPage.parent?.documentId || null;

          // Only change parent if there's an explicit parent modification in params
          if (params.data?.parent) {
            const parentData = params.data.parent;

            // Check for connect/set operations (setting a new parent)
            if (parentData.connect?.length > 0 || parentData.set?.length > 0) {
              parentDocumentId = await getParentDocumentId(strapi, parentData);
            }
            // Check for disconnect operation (removing parent)
            else if (parentData.disconnect?.length > 0) {
              parentDocumentId = null;
            }
            // Direct documentId reference
            else if (parentData.documentId) {
              parentDocumentId = parentData.documentId;
            }
          }
          // Explicit null means remove parent
          else if (params.data?.parent === null) {
            parentDocumentId = null;
          }

          const computedPath = await computePathFromParent(strapi, slug, parentDocumentId);
          params.data.path = computedPath;
        }
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

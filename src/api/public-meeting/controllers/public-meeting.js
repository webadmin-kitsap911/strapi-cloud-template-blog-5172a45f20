'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

/**
 * Hydrate file IDs in document attachments with full file objects
 */
async function hydrateDocumentFiles(strapi, data) {
  if (!data) return data;

  const hydrateEntry = async (entry) => {
    if (!entry?.documents || !Array.isArray(entry.documents)) {
      return entry;
    }

    const hydratedDocuments = await Promise.all(
      entry.documents.map(async (doc) => {
        if (!doc.file || typeof doc.file !== 'number') {
          return doc;
        }

        try {
          const file = await strapi.db.query('plugin::upload.file').findOne({
            where: { id: doc.file },
          });

          return {
            ...doc,
            file: file || null,
          };
        } catch {
          return doc;
        }
      })
    );

    return {
      ...entry,
      documents: hydratedDocuments,
    };
  };

  // Handle array of entries (find) or single entry (findOne)
  if (Array.isArray(data)) {
    return Promise.all(data.map(hydrateEntry));
  }

  return hydrateEntry(data);
}

module.exports = createCoreController(
  'api::public-meeting.public-meeting',
  ({ strapi }) => ({
    async find(ctx) {
      const response = await super.find(ctx);

      if (response.data) {
        response.data = await hydrateDocumentFiles(strapi, response.data);
      }

      return response;
    },

    async findOne(ctx) {
      const response = await super.findOne(ctx);

      if (response.data) {
        response.data = await hydrateDocumentFiles(strapi, response.data);
      }

      return response;
    },
  })
);

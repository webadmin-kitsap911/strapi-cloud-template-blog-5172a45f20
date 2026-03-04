import type { Core } from '@strapi/strapi';

const FOLDER_NAME = 'Structured Attachments';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  // Find or create the upload folder for private file uploads
  try {
    const folderService = strapi.plugin('upload').service('folder');

    // Look for existing folder
    const existingFolders = await strapi.db.query('plugin::upload.folder').findMany({
      where: { name: FOLDER_NAME, parent: null },
    });

    let folderId: number;

    if (existingFolders.length > 0) {
      folderId = existingFolders[0].id;
      strapi.log.info(`[private-file-upload] Using existing folder "${FOLDER_NAME}" (ID: ${folderId})`);
    } else {
      // Create the folder
      const newFolder = await folderService.create({ name: FOLDER_NAME, parent: null });
      folderId = newFolder.id;
      strapi.log.info(`[private-file-upload] Created folder "${FOLDER_NAME}" (ID: ${folderId})`);
    }

    // Store the folder ID in plugin state for later access
    strapi.plugin('private-file-upload').folderId = folderId;
  } catch (error) {
    strapi.log.error('[private-file-upload] Failed to initialize upload folder:', error);
  }
};

export default bootstrap;

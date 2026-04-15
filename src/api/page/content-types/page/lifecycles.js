'use strict';

/**
 * Extract plain text from HTML string
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
    .replace(/&nbsp;/g, ' ')    // Replace &nbsp;
    .replace(/&amp;/g, '&')     // Replace &amp;
    .replace(/&lt;/g, '<')      // Replace &lt;
    .replace(/&gt;/g, '>')      // Replace &gt;
    .replace(/&quot;/g, '"')    // Replace &quot;
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim();
}

/**
 * Extract searchable text from a single content block
 */
function extractBlockText(block) {
  if (!block || !block.__component) return '';

  const texts = [];

  switch (block.__component) {
    case 'blocks.rich-text':
      if (block.content) texts.push(stripHtml(block.content));
      break;

    case 'blocks.heading':
      if (block.text) texts.push(block.text);
      break;

    case 'blocks.call-to-action':
      if (block.heading) texts.push(block.heading);
      if (block.text) texts.push(block.text);
      if (block.closingMessage) texts.push(block.closingMessage);
      break;

    case 'blocks.embed':
      if (block.title) texts.push(block.title);
      break;

    case 'blocks.image':
      if (block.caption) texts.push(block.caption);
      break;

    case 'blocks.video':
      if (block.title) texts.push(block.title);
      break;

    case 'blocks.resource-links':
      if (block.heading) texts.push(block.heading);
      if (block.items && Array.isArray(block.items)) {
        for (const item of block.items) {
          if (item.title) texts.push(item.title);
        }
      }
      break;

    case 'blocks.columns':
      if (block.columns && Array.isArray(block.columns)) {
        for (const column of block.columns) {
          if (column.children && Array.isArray(column.children)) {
            for (const child of column.children) {
              texts.push(extractBlockText(child));
            }
          }
        }
      }
      break;
  }

  return texts.filter(Boolean).join(' ');
}

/**
 * Extract all searchable content from page contentBlocks
 */
function extractSearchableContent(data) {
  const texts = [];

  // Add title and SEO fields
  if (data.title) texts.push(data.title);
  if (data.seoTitle) texts.push(data.seoTitle);
  if (data.seoDescription) texts.push(data.seoDescription);

  // Extract text from content blocks
  if (data.contentBlocks && Array.isArray(data.contentBlocks)) {
    for (const block of data.contentBlocks) {
      const blockText = extractBlockText(block);
      if (blockText) texts.push(blockText);
    }
  }

  return texts.join(' ').replace(/\s+/g, ' ').trim();
}

// Track documents being processed to prevent infinite loops
const processing = new Set();

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    if (data.contentBlocks) {
      data.searchableContent = extractSearchableContent(data);
    }
  },

  async afterUpdate(event) {
    const { result } = event;

    // Prevent infinite loop - skip if already processing this document
    if (processing.has(result.documentId)) {
      return;
    }

    processing.add(result.documentId);

    try {
      // Fetch the full document with populated contentBlocks
      const fullDoc = await strapi.documents('api::page.page').findOne({
        documentId: result.documentId,
        populate: {
          contentBlocks: {
            on: {
              'blocks.rich-text': true,
              'blocks.heading': true,
              'blocks.call-to-action': true,
              'blocks.embed': true,
              'blocks.image': true,
              'blocks.video': true,
              'blocks.resource-links': true,
              'blocks.columns': {
                populate: {
                  columns: {
                    populate: {
                      children: {
                        on: {
                          'blocks.rich-text': true,
                          'blocks.heading': true,
                          'blocks.call-to-action': true,
                          'blocks.embed': true,
                          'blocks.image': true,
                          'blocks.video': true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (fullDoc) {
        const searchableContent = extractSearchableContent(fullDoc);

        await strapi.db.query('api::page.page').update({
          where: { id: result.id },
          data: { searchableContent },
        });
      }
    } finally {
      processing.delete(result.documentId);
    }
  },
};

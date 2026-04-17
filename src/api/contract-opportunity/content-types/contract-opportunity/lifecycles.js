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
 * Extract all searchable content from contract opportunity
 */
function extractSearchableContent(data) {
  const texts = [];

  if (data.title) texts.push(data.title);
  if (data.opportunityStatus) texts.push(data.opportunityStatus.replace(/-/g, ' '));
  if (data.content) texts.push(stripHtml(data.content));

  return texts.join(' ').replace(/\s+/g, ' ').trim();
}

// Track documents being processed to prevent infinite loops
const processing = new Set();

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    data.searchableContent = extractSearchableContent(data);
  },

  async afterUpdate(event) {
    const { result } = event;

    // Prevent infinite loop
    if (processing.has(result.documentId)) {
      return;
    }

    processing.add(result.documentId);

    try {
      const fullDoc = await strapi.documents('api::contract-opportunity.contract-opportunity').findOne({
        documentId: result.documentId,
      });

      if (fullDoc) {
        const searchableContent = extractSearchableContent(fullDoc);

        await strapi.db.query('api::contract-opportunity.contract-opportunity').update({
          where: { id: result.id },
          data: { searchableContent },
        });
      }
    } finally {
      processing.delete(result.documentId);
    }
  },
};

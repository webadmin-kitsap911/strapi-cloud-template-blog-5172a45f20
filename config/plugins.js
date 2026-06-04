module.exports = () => ({
  email: {
    enabled: false,
  },
  'admin-totp': {
    enabled: true,
    resolve: './src/plugins/admin-totp',
  },
  'csv-export': {
    enabled: true,
  },
  navigation: {
    enabled: true,
    config: {
      contentTypes: ['api::page.page'],
      allowedLevels: 2,
      additionalFields: ['audience'],
      i18nEnabled: false,
    },
  },
  'strapi-algolia': {
    enabled: !!process.env.ALGOLIA_APP_ID,
    config: {
      apiKey: process.env.ALGOLIA_ADMIN_KEY,
      applicationId: process.env.ALGOLIA_APP_ID,
      indexPrefix: process.env.ALGOLIA_INDEX_PREFIX || 'kitsap911',
      contentTypes: [
        {
          name: 'api::page.page',
          index: 'pages',
          hideFields: [
            'contentBlocks',
            'backgroundImage',
            'parent',
            'children',
            'slug',
            'createdAt',
            'updatedAt',
            'publishedAt',
            'locale',
          ],
        },
        {
          name: 'api::press-release.press-release',
          index: 'press_releases',
          hideFields: [
            'content',
            'contacts',
            'createdAt',
            'updatedAt',
            'publishedAt',
            'locale',
          ],
        },
        {
          name: 'api::contract-opportunity.contract-opportunity',
          index: 'contract_opportunities',
          hideFields: [
            'content',
            'contacts',
            'documents',
            'createdAt',
            'updatedAt',
            'publishedAt',
            'locale',
          ],
        },
      ],
    },
  },
});

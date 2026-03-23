module.exports = () => ({
  navigation: {
    enabled: true,
    config: {
      contentTypes: ['api::page.page'],
      allowedLevels: 3,
      additionalFields: ['audience'],
      i18nEnabled: false,
    },
  },
});

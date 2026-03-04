export default {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/folder-id',
      handler: 'controller.getFolderId',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};

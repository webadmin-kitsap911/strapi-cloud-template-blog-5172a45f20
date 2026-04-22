'use strict';

module.exports = ({ strapi }) => ({
  async setRequired(ctx) {
    const { id } = ctx.params;
    const { required } = ctx.request.body;

    if (!ctx.state.user?.id) {
      return ctx.unauthorized('Must be authenticated');
    }

    // Check if current user has permission to manage users
    const currentUser = ctx.state.user;
    const isSuperAdmin = currentUser.roles?.some(
      (role) => role.code === 'strapi-super-admin'
    );

    if (!isSuperAdmin) {
      return ctx.forbidden('Only super admins can require TOTP for users');
    }

    if (typeof required !== 'boolean') {
      return ctx.badRequest('required must be a boolean');
    }

    try {
      const totpService = strapi.plugin('admin-totp').service('totp');
      const user = await totpService.getAdminUser(id);

      if (!user) {
        return ctx.notFound('User not found');
      }

      await totpService.updateAdminUser(id, {
        totp_required: required,
      });

      ctx.body = {
        data: {
          id: parseInt(id, 10),
          totpRequired: required,
        },
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async reset(ctx) {
    const { id } = ctx.params;

    if (!ctx.state.user?.id) {
      return ctx.unauthorized('Must be authenticated');
    }

    // Check if current user has permission to manage users
    const currentUser = ctx.state.user;
    const isSuperAdmin = currentUser.roles?.some(
      (role) => role.code === 'strapi-super-admin'
    );

    if (!isSuperAdmin) {
      return ctx.forbidden('Only super admins can reset TOTP for users');
    }

    try {
      const totpService = strapi.plugin('admin-totp').service('totp');
      const user = await totpService.getAdminUser(id);

      if (!user) {
        return ctx.notFound('User not found');
      }

      // Reset TOTP but keep the required flag
      await totpService.updateAdminUser(id, {
        totp_secret: null,
        totp_enabled: false,
        totp_backup_codes: null,
        totp_pending_secret: null,
      });

      // Delete any pending sessions for this user
      const sessionService = strapi.plugin('admin-totp').service('session');
      await sessionService.deleteForUser(id);

      ctx.body = {
        data: {
          id: parseInt(id, 10),
          reset: true,
        },
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async getUserStatus(ctx) {
    const { id } = ctx.params;

    if (!ctx.state.user?.id) {
      return ctx.unauthorized('Must be authenticated');
    }

    // Check if current user has permission to view users
    const currentUser = ctx.state.user;
    const isSuperAdmin = currentUser.roles?.some(
      (role) => role.code === 'strapi-super-admin'
    );

    if (!isSuperAdmin) {
      return ctx.forbidden('Only super admins can view TOTP status for users');
    }

    try {
      const totpService = strapi.plugin('admin-totp').service('totp');
      const status = await totpService.getStatus(id);

      ctx.body = {
        data: {
          id: parseInt(id, 10),
          ...status,
        },
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
});

'use strict';

// Helper to check if user has a specific permission
const hasPermission = async (strapi, user, action) => {
  const permissionService = strapi.admin.services.permission;

  // Get user's permissions
  const userPermissions = await permissionService.findUserPermissions(user);

  // Check if user has the specific action permission
  return userPermissions.some(
    (permission) => permission.action === `plugin::admin-totp.${action}`
  );
};

module.exports = ({ strapi }) => ({
  async setRequired(ctx) {
    const { id } = ctx.params;
    const { required } = ctx.request.body;

    if (!ctx.state.user?.id) {
      return ctx.unauthorized('Must be authenticated');
    }

    // Check if current user has permission
    const canRequire = await hasPermission(strapi, ctx.state.user, 'users.require');
    if (!canRequire) {
      return ctx.forbidden('You do not have permission to require TOTP for users');
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

    // Check if current user has permission
    const canReset = await hasPermission(strapi, ctx.state.user, 'users.reset');
    if (!canReset) {
      return ctx.forbidden('You do not have permission to reset TOTP for users');
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

    // Check if current user has permission
    const canRead = await hasPermission(strapi, ctx.state.user, 'users.read');
    if (!canRead) {
      return ctx.forbidden('You do not have permission to view TOTP status for users');
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

  // Endpoint to check current user's permissions for admin TOTP management
  async getPermissions(ctx) {
    if (!ctx.state.user?.id) {
      return ctx.unauthorized('Must be authenticated');
    }

    const [canRead, canRequire, canReset] = await Promise.all([
      hasPermission(strapi, ctx.state.user, 'users.read'),
      hasPermission(strapi, ctx.state.user, 'users.require'),
      hasPermission(strapi, ctx.state.user, 'users.reset'),
    ]);

    ctx.body = {
      data: {
        canRead,
        canRequire,
        canReset,
        canManageUsers: canRead || canRequire || canReset,
      },
    };
  },

  // List all admin users with their TOTP status
  async listUsers(ctx) {
    if (!ctx.state.user?.id) {
      return ctx.unauthorized('Must be authenticated');
    }

    // Check if current user has permission to read
    const canRead = await hasPermission(strapi, ctx.state.user, 'users.read');
    if (!canRead) {
      return ctx.forbidden('You do not have permission to view users');
    }

    try {
      const totpService = strapi.plugin('admin-totp').service('totp');
      const knex = strapi.db.connection;

      // Get all admin users with basic info and TOTP fields
      const users = await knex('admin_users')
        .select(
          'id',
          'email',
          'firstname',
          'lastname',
          'is_active',
          'totp_enabled',
          'totp_required'
        )
        .orderBy('firstname', 'asc');

      ctx.body = {
        data: users.map((user) => ({
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          isActive: user.is_active,
          totp_enabled: !!user.totp_enabled,
          totp_required: !!user.totp_required,
        })),
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
});

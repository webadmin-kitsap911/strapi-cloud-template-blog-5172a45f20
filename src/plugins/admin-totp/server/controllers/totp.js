'use strict';

module.exports = ({ strapi }) => ({
  async verify(ctx) {
    const { totpSessionToken, code } = ctx.request.body;

    if (!totpSessionToken || !code) {
      return ctx.badRequest('Missing totpSessionToken or code');
    }

    try {
    const sessionService = strapi.plugin('admin-totp').service('session');
    const totpService = strapi.plugin('admin-totp').service('totp');

    // Validate the session
    const sessionResult = await sessionService.validate(totpSessionToken);

    if (!sessionResult.valid) {
      return ctx.badRequest(sessionResult.reason);
    }

    const { session } = sessionResult;
    const userId = session.adminUserId;

    // Verify the TOTP code
    const verifyResult = await totpService.verifyForLogin(userId, code);

    if (!verifyResult.valid) {
      await sessionService.incrementAttempts(totpSessionToken);
      return ctx.badRequest('Invalid verification code');
    }

    // Mark session as used
    await sessionService.markUsed(totpSessionToken);

    // Get the admin user using Strapi's proper query
    const user = await strapi.db.query('admin::user').findOne({
      where: { id: userId },
      populate: ['roles'],
    });

    if (!user) {
      return ctx.badRequest('User not found');
    }

    // Use Strapi's session manager to create proper tokens (same as login)
    const crypto = require('crypto');
    const sessionManager = strapi.sessionManager;

    if (!sessionManager) {
      return ctx.internalServerError('Session manager not available');
    }

    const deviceId = crypto.randomUUID();

    // Generate refresh token
    const { token: refreshToken, absoluteExpiresAt } = await sessionManager('admin').generateRefreshToken(
      String(userId),
      deviceId,
      { type: 'session' }
    );

    // Generate access token from refresh token
    const accessResult = await sessionManager('admin').generateAccessToken(refreshToken);
    if ('error' in accessResult) {
      return ctx.internalServerError('Failed to generate access token');
    }

    const { token: accessToken } = accessResult;

    // Set refresh token cookie using the same method as Strapi's login
    const isProduction = process.env.NODE_ENV === 'production';
    const path = strapi.config.get('admin.auth.cookie.path', '/admin');
    const domain = strapi.config.get('admin.auth.cookie.domain') || strapi.config.get('admin.auth.domain');
    const sameSite = strapi.config.get('admin.auth.cookie.sameSite') ?? 'lax';

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction && ctx.request.secure,
      overwrite: true,
      domain,
      path,
      sameSite,
    };

    strapi.log.info(`[admin-totp] Setting refresh cookie with options:`, JSON.stringify(cookieOptions));
    strapi.log.info(`[admin-totp] Refresh token length: ${refreshToken?.length}`);

    ctx.cookies.set('strapi_admin_refresh', refreshToken, cookieOptions);

    // Also set the jwtToken cookie so the frontend has immediate access
    ctx.cookies.set('jwtToken', accessToken, {
      httpOnly: false, // Frontend needs to read this
      secure: isProduction && ctx.request.secure,
      path,
      domain,
      sameSite,
      overwrite: true,
    });

    strapi.log.info(`[admin-totp] TOTP verification successful for user ${userId}, issuing tokens`);

    // Return the same structure as normal login
    ctx.body = {
      data: {
        token: accessToken,
        user: strapi.admin.services.user.sanitizeUser(user),
      },
    };
    } catch (error) {
      strapi.log.error(
        `[admin-totp] TOTP verify failed: ${error.message}\n${error.stack}`
      );
      return ctx.internalServerError('TOTP verification failed');
    }
  },

  // Setup TOTP using session token (for users who need to set up TOTP before first login)
  async setupBeginWithSession(ctx) {
    const { totpSessionToken } = ctx.request.body;

    if (!totpSessionToken) {
      return ctx.badRequest('Missing totpSessionToken');
    }

    const sessionService = strapi.plugin('admin-totp').service('session');

    // Validate the session
    const sessionResult = await sessionService.validate(totpSessionToken);
    if (!sessionResult.valid) {
      return ctx.badRequest(sessionResult.reason);
    }

    const { session } = sessionResult;
    const userId = session.adminUserId;

    // Verify user needs setup (required but not enabled)
    const totpService = strapi.plugin('admin-totp').service('totp');
    const user = await totpService.getAdminUser(userId);

    if (!user) {
      return ctx.badRequest('User not found');
    }

    if (!user.totp_required) {
      return ctx.badRequest('TOTP is not required for this user');
    }

    if (user.totp_enabled) {
      return ctx.badRequest('TOTP is already enabled');
    }

    try {
      const result = await totpService.setupBegin(userId);

      ctx.body = {
        data: {
          qrCode: result.qrCode,
          secret: result.secret,
        },
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  // Complete TOTP setup using session token and issue JWT
  async setupCompleteWithSession(ctx) {
    const { totpSessionToken, code } = ctx.request.body;

    if (!totpSessionToken || !code) {
      return ctx.badRequest('Missing totpSessionToken or code');
    }

    const sessionService = strapi.plugin('admin-totp').service('session');

    // Validate the session
    const sessionResult = await sessionService.validate(totpSessionToken);
    if (!sessionResult.valid) {
      return ctx.badRequest(sessionResult.reason);
    }

    const { session } = sessionResult;
    const userId = session.adminUserId;

    const totpService = strapi.plugin('admin-totp').service('totp');
    const user = await totpService.getAdminUser(userId);

    if (!user) {
      return ctx.badRequest('User not found');
    }

    try {
      // Complete the setup
      const result = await totpService.setupComplete(userId, code);

      // Mark session as used
      await sessionService.markUsed(totpSessionToken);

      // Get the full admin user for token generation
      const fullUser = await strapi.db.query('admin::user').findOne({
        where: { id: userId },
        populate: ['roles'],
      });

      // Use Strapi's session manager to create proper tokens
      const crypto = require('crypto');
      const sessionManager = strapi.sessionManager;

      if (!sessionManager) {
        return ctx.internalServerError('Session manager not available');
      }

      const deviceId = crypto.randomUUID();

      // Generate refresh token
      const { token: refreshToken } = await sessionManager('admin').generateRefreshToken(
        String(userId),
        deviceId,
        { type: 'session' }
      );

      // Generate access token from refresh token
      const accessResult = await sessionManager('admin').generateAccessToken(refreshToken);
      if ('error' in accessResult) {
        return ctx.internalServerError('Failed to generate access token');
      }

      const { token: accessToken } = accessResult;

      // Set cookies
      const isProduction = process.env.NODE_ENV === 'production';
      const path = strapi.config.get('admin.auth.cookie.path', '/admin');
      const domain = strapi.config.get('admin.auth.cookie.domain') || strapi.config.get('admin.auth.domain');
      const sameSite = strapi.config.get('admin.auth.cookie.sameSite') ?? 'lax';

      ctx.cookies.set('strapi_admin_refresh', refreshToken, {
        httpOnly: true,
        secure: isProduction && ctx.request.secure,
        overwrite: true,
        domain,
        path,
        sameSite,
      });

      ctx.cookies.set('jwtToken', accessToken, {
        httpOnly: false,
        secure: isProduction && ctx.request.secure,
        path,
        domain,
        sameSite,
        overwrite: true,
      });

      strapi.log.info(`[admin-totp] TOTP setup complete for user ${userId}, issuing tokens`);

      ctx.body = {
        data: {
          token: accessToken,
          user: strapi.admin.services.user.sanitizeUser(fullUser),
          backupCodes: result.backupCodes,
        },
      };
    } catch (error) {
      await sessionService.incrementAttempts(totpSessionToken);
      return ctx.badRequest(error.message);
    }
  },

  async setupBegin(ctx) {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('Must be authenticated');
    }

    try {
      const totpService = strapi.plugin('admin-totp').service('totp');
      const result = await totpService.setupBegin(userId);

      ctx.body = {
        data: {
          qrCode: result.qrCode,
          secret: result.secret,
        },
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async setupComplete(ctx) {
    const userId = ctx.state.user?.id;
    const { code } = ctx.request.body;

    if (!userId) {
      return ctx.unauthorized('Must be authenticated');
    }

    if (!code) {
      return ctx.badRequest('Verification code is required');
    }

    try {
      const totpService = strapi.plugin('admin-totp').service('totp');
      const result = await totpService.setupComplete(userId, code);

      ctx.body = {
        data: {
          enabled: true,
          backupCodes: result.backupCodes,
        },
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async disable(ctx) {
    const userId = ctx.state.user?.id;
    const { password } = ctx.request.body;

    if (!userId) {
      return ctx.unauthorized('Must be authenticated');
    }

    if (!password) {
      return ctx.badRequest('Password is required');
    }

    try {
      const totpService = strapi.plugin('admin-totp').service('totp');
      await totpService.disable(userId, password);

      ctx.body = {
        data: {
          disabled: true,
        },
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async status(ctx) {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('Must be authenticated');
    }

    try {
      const totpService = strapi.plugin('admin-totp').service('totp');
      const status = await totpService.getStatus(userId);

      const backupCodesService = strapi.plugin('admin-totp').service('backup-codes');
      const remainingBackupCodes = status.enabled
        ? await backupCodesService.getRemainingCount(userId)
        : 0;

      ctx.body = {
        data: {
          ...status,
          remainingBackupCodes,
        },
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async regenerateBackupCodes(ctx) {
    const userId = ctx.state.user?.id;
    const { password } = ctx.request.body;

    if (!userId) {
      return ctx.unauthorized('Must be authenticated');
    }

    if (!password) {
      return ctx.badRequest('Password is required');
    }

    try {
      const totpService = strapi.plugin('admin-totp').service('totp');
      const result = await totpService.regenerateBackupCodes(userId, password);

      ctx.body = {
        data: {
          backupCodes: result.backupCodes,
        },
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
});

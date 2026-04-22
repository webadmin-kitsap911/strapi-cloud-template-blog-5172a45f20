'use strict';

// Strapi's refresh cookie name
const REFRESH_COOKIE_NAME = 'strapi_admin_refresh';

module.exports = ({ strapi }) => {
  // Helper to clear refresh token cookie with proper options
  const clearRefreshCookie = (ctx) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const path = strapi.config.get('admin.auth.cookie.path', '/admin');
    const domain = strapi.config.get('admin.auth.cookie.domain') || strapi.config.get('admin.auth.domain');

    ctx.cookies.set(REFRESH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: isProduction,
      path,
      domain,
      maxAge: 0,
      overwrite: true,
    });
  };

  // Helper to clear jwtToken cookie with proper options
  const clearJwtCookie = (ctx) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const path = strapi.config.get('admin.auth.cookie.path', '/admin');
    const domain = strapi.config.get('admin.auth.cookie.domain') || strapi.config.get('admin.auth.domain');

    ctx.cookies.set('jwtToken', '', {
      httpOnly: false,
      secure: isProduction,
      path,
      domain,
      maxAge: 0,
      overwrite: true,
    });
  };

  // Register the TOTP login intercept middleware
  strapi.server.use(async (ctx, next) => {
    const isLoginPath = ctx.path === '/admin/login';
    const isLogoutPath = ctx.path === '/admin/logout';
    const isAccessTokenPath = ctx.path === '/admin/access-token';
    const isPost = ctx.method === 'POST';

    // Intercept logout to clear jwtToken cookie we set
    if (isLogoutPath && isPost) {
      await next();
      clearJwtCookie(ctx);
      return;
    }

    // Log access-token requests for debugging
    if (isAccessTokenPath && isPost) {
      const hasRefreshCookie = !!ctx.cookies.get('strapi_admin_refresh');
      strapi.log.info(`[admin-totp] access-token request, has refresh cookie: ${hasRefreshCookie}`);
    }

    // Intercept login requests
    if (isLoginPath && isPost) {
      await next();

      // After the original handler has run, check if TOTP is needed
      if (ctx.status === 200 && ctx.body?.data?.token) {
        try {
          const userId = ctx.body.data.user?.id;
          if (userId) {
            const totpService = strapi.plugin('admin-totp').service('totp');
            const user = await totpService.getAdminUser(userId);

            if (user && (user.totp_enabled || user.totp_required)) {
              strapi.log.info(`[admin-totp] TOTP required for user ${userId}`);

              // Create TOTP session
              const sessionService = strapi.plugin('admin-totp').service('session');
              const { token: totpSessionToken, expiresAt } = await sessionService.create(userId);

              // Destroy the admin session that was just created
              try {
                const sessionId = ctx.body.data.user?.sessionId;
                if (sessionId) {
                  await strapi.db.query('admin::session').delete({
                    where: { id: sessionId },
                  });
                }
              } catch (e) {
                strapi.log.warn('[admin-totp] Could not delete session:', e.message);
              }

              // Replace response with TOTP challenge
              ctx.body = {
                data: {
                  requiresTOTP: true,
                  totpSessionToken,
                  expiresAt,
                  user: {
                    id: userId,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                  },
                  needsSetup: user.totp_required && !user.totp_enabled,
                },
              };

              // Clear all auth cookies to prevent token refresh
              clearRefreshCookie(ctx);
              clearJwtCookie(ctx);
            }
          }
        } catch (error) {
          strapi.log.error('[admin-totp] Login intercept error:', error);
        }
      }
    } else {
      await next();
    }
  });
};

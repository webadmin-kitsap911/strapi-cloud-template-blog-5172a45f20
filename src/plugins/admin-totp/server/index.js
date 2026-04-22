'use strict';

const bootstrap = require('./bootstrap');
const register = require('./register');
const contentTypes = require('./content-types');
const controllers = require('./controllers');
const routes = require('./routes');
const services = require('./services');
const middlewares = require('./middlewares');

module.exports = {
  bootstrap,
  register,
  contentTypes,
  controllers,
  routes,
  services,
  middlewares,
};

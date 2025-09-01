'use strict';

/**
 * deployment router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::deployment.deployment');

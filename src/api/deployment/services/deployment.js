'use strict';

/**
 * deployment service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::deployment.deployment');

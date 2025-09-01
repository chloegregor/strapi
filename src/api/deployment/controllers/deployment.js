'use strict';

/**
 * deployment controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::deployment.deployment');

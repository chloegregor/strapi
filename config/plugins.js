module.exports = ({env}) => ({
  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET"),
    },
  },
  'email': {
     config: {
      provider: 'strapi-provider-email-resend',
      providerOptions: {
        apiKey: env('RESEND_API_KEY'), // Required
      },
      settings: {
        defaultFrom: 'no-reply@kraze.fr',
        defaultReplyTo: null,
      },
    }
  },
  upload:{
    config: {
      provider: 'cloudinary',
      actionOptions: {
        upload: {},
        delete: {},
      },
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_API_KEY'),
        api_secret: env('CLOUDINARY_API_SECRET'),
      },
  }
},

});

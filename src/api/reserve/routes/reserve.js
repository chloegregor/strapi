module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/incrementreserve',
      handler: 'reserve.incrementReserve',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/decrementreserve',
      handler: 'reserve.decrementReserve',
      config: {
        auth: false,
      },
    },
  ],
}

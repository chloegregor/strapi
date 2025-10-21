module.exports = {
  async incrementReserve(ctx) {
    console.log('Increment reserve called with body:', ctx.request.body);
    try {
      const { documentId, quantity, type } = ctx.request.body;
      if (!documentId || quantity === undefined || !type) {
        return ctx.badRequest('documentId, newReserve, and type are required');
      }

      const table = type === 'produit' ? 'produit_couleur_sizes' : type === 'piece-unique' ? 'piece_uniques' : null;

      if (!table) {
        return ctx.badRequest('Invalid type provided');
      }

      const updatedEntry = await strapi.db.connection(table)
        .where('document_id', documentId)
        .whereRaw('stock - reserve >= ?', [quantity])
        .increment('reserve', quantity)
        .returning('*');

      if (updatedEntry.length === 0) {
        console.log('Insufficient stock to increment reserve for documentId:', documentId);
        return ctx.badRequest('Insufficient stock to increment reserve');

      }
      ctx.body = updatedEntry[0];


    }catch (error) {
      return ctx.internalServerError(error.message);
    }
  },

  async decrementReserve(ctx) {
    console.log('Decrement reserve called with body:', ctx.request.body);
    try{
      const { documentId, quantity, type } = ctx.request.body;
      if (!documentId || quantity === undefined || !type) {
        return ctx.badRequest('documentId, quantity, and type are required');
      }

      const table = type === 'produit' ? 'produit_couleur_sizes' : type === 'piece-unique' ? 'piece_uniques' : null;

      if (!table) {
        return ctx.badRequest('Invalid type provided');
      }

      const updatedEntry = await strapi.db.connection(table)
        .where('document_id', documentId)
        .decrement('reserve', quantity)
        .returning('*');

      ctx.body = updatedEntry[0];
    } catch (error) {
      console.error('Error decrementing reserve:', error);
      return ctx.internalServerError('Failed to decrement reserve');
    }
  }
}

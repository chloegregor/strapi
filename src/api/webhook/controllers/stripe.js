'use strict';
const stripe = require('stripe')(process.env.SECRET_STRIPE);

function FormAddress(address){

  const street =  `${address.line1 || ''} ${address.line2 || ''}`.trim()
  const city = address.city || ''
  const state = address.country || ''
  const postalCode = address.postal_code || ''

  return `${street}, ${city} ${postalCode} ${state}`.trim();
}



module.exports ={
  async handleStripeWebhook(ctx) {
    const sig = ctx.request.headers['stripe-signature'];
    const webhookSecret = process.env.SECRET_STRIPE_WEBHOOK;
    let event;
    try {
      const rawBody = ctx.request.body[Symbol.for("unparsedBody")];

      if (!rawBody) {
        console.error('⚠️ No raw body found in the request');
        return ctx.badRequest('Webhook Error: No raw body found');
      }
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        webhookSecret
      )
    }  catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return ctx.badRequest(`Webhook Error: ${err.message}`);



    }
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      ctx.send({
        received: true
      });

      (async () => {
        try {
          const items = session.metadata.items ? JSON.parse(session.metadata.items) : [];
          const email = session.customer_details.email;
          const name = session.customer_details.name;
          const address = FormAddress(session.customer_details.address || {});

          const createCommandeLine = await Promise.all(
            items.map (async (item) => {


              let product = await strapi.documents('api::produit-couleur-size.produit-couleur-size').findOne({
                documentId: item.documentId,
                populate: ['produit_couleur'],
                status: 'published'
              })

              if (!product) {
                product = await strapi.documents('api::piece-unique.piece-unique').findOne({
                  documentId: item.documentId,
                  status: 'published'
                })
              }


              if (!product) {
                console.error(`⚠️ Produit  with ID ${item.documentId} not found`);
                throw new Error(`Produit  with ID ${item.documentId} not found`);
              }

              if (product.stock < item.quantity) {
                console.error(`⚠️ Insufficient stock for Produit Couleur Size with ID ${item.documentId}`);
                throw new Error(`Insufficient stock for Produit Couleur Size with ID ${item.documentId}`);
              }

              const data = {
                ...(product.taille ? {produit_couleur_size: item.documentId} : {piece_unique: item.documentId}),
                name:(product.taille ? `${product.produit_couleur.nom} / ${product.taille}` :`${product.titre}` ),
                quantity: item.quantity,
              }

              const endpoint = product.taille ? 'api::produit-couleur-size.produit-couleur-size' : 'api::piece-unique.piece-unique'

              product = await strapi.documents(endpoint).update({
                documentId: item.documentId,
                data: {
                  stock: (product.stock - item.quantity),
                  reserve: (product.reserve - item.quantity)
                },
                status: 'published'
              })


            return await strapi.entityService.create('api::commande-line.commande-line', {data}
            )
          }))


          await strapi.entityService.create('api::commande.commande', {
            data:{
            email: email,
            nom_complet: name,
            addresse: address,
            commande_lines: createCommandeLine.map(cl => cl.documentId)
            }


          })

        } catch (error) {
          console.error('⚠️ Error processing checkout.session.completed:', error);
        }
      })();


    }

    if (event.type === 'checkout.session.expired') {
      const session  = event.data.object
      const items = session.metadata.items ? JSON.parse(session.metadata.items) : [];

       ctx.send({
        received: true
      });

      (async () => {

        try{
          await Promise.all(
            items.map(async (item) => {


              let product = await strapi.documents('api::produit-couleur-size.produit-couleur-size').findOne({
                documentId: item.documentId,
                status: 'published'
              })

              if (!product) {
                product = await strapi.documents('api::piece-unique.piece-unique').findOne({
                  documentId: item.documentId,
                  status: 'published'
                })
              }

              if (!product) {
                console.error(`⚠️ Produit  with ID ${item.documentId} not found`);
                throw new Error(`Produit  with ID ${item.documentId} not found`);
              }

              const endpoint = product.taille ? 'api::produit-couleur-size.produit-couleur-size' : 'api::piece-unique.piece-unique'

              product = await strapi.documents(endpoint).update({
              documentId: item.documentId,
              data: {
                reserve: (product.reserve - item.quantity)
              },
              status: 'published'
            })

            }
          ))

        }catch(error){

          console.error('⚠️ Error updating reserve from expired product:', error);

          return ctx.badRequest('Webhook Error: Invalid metadata format');
        }
      })();
    }
    return
  }
}

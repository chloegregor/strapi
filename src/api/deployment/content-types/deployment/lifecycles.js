module.exports = {
  async afterCreate(event) {
    const  {result } = event;
    await fetch ('https://api.vercel.com/v1/integrations/deploy/prj_YodjbAC9bfCxnkErzOg4ByHOvm6R/7QDunECMUP'), {method: 'POST'};
    console.log('Revalidation request sent to Vercel at', new Date());

  }
};

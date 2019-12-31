exports.handler = function (context, event, callback) {

  const client = context.getTwilioClient();

  const keywords = new Map([
    ['census', 'https://textit.in/c/tms/receive'],
    ['shelter', 'https://gopidj.com/inbox/route'],
    ['default', 'https://webhooks.twilio.com/studio']
  ]);

  const ttl = 900;

  function redirectResponse(location) {
    let response = new Twilio.Response()
    response.setStatusCode(302);
    response.setHeaders({ 'Location': location });

    console.log('Sending response back to: ', location);
    callback(null, response);
  }

  function getWebhook(keyword) {
    if (keywords.has(keyword.toLowerCase())) return keywords.get(keyword);
    return keywords.get('default');
  }

  function createSession(key, appWebhook) {
    client.sync.services(context.SYNC_SERVICE_SID)
      .syncMaps(context.MAP_ID)
      .syncMapItems
      .create({
        key: key,
        data: {
          appWebhook: appWebhook,
        },
        ttl: ttl
      })
      .then(mapItem => {
        console.log('Created new map item: ', mapItem);
        redirectResponse(mapItem.data.appWebhook);
      })
      .catch(err => {
        console.log("Error saving new map item: ", err);
        callback(null, err);
      });
  }

  client.sync.services(context.SYNC_SERVICE_SID)
    .syncMaps(context.MAP_ID)
    .syncMapItems(event.From)
    .fetch()
    .then(mapItem => {
      console.log("Retrieved map item: ", mapItem);
      redirectResponse(mapItem.data.appWebhook);
    })
    .catch((err) => {
      console.log('No map item exists.');
      let webhookUrl = getWebhook(event.Body);
      createSession(event.From, webhookUrl);
    });
};
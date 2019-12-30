exports.handler = function (context, event, callback) {
  let client = context.getTwilioClient();

  let phoneNumber = decodeURIComponent(event.phone);

  client.sync.services(context.SYNC_SERVICE_SID)
    .syncMaps(context.MAP_ID)
    .syncMapItems(phoneNumber)
    .remove()
    .then((result) => {
      callback(null, result);
    })
    .catch((err) => {
      callback(null, err);
    })
};

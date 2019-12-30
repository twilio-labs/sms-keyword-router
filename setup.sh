# Set up a new sync service:
echo "Creating a new Sync service."
service_sid="$(twilio api:sync:v1:services:create --friendly-name='Keyword Sessions' -o=json | jq '.[0].sid')"

service_sid="${service_sid%\"}"
service_sid="${service_sid#\"}"

echo "${service_sid}"
# Create a new sync map:
echo "Creating a Sync map in Service ${service_sid}."
map_sid="$(twilio api:sync:v1:services:maps:create --service-sid=${service_sid} -o=json | jq '.[0].sid')"
echo "Created Sync map ${map_sid}"

echo "Writing Sync Service SID and Map SID to .env file."
echo "SYNC_SERVICE_SID=${service_sid}" >> .env
echo "MAP_ID=${map_sid}" >> .env
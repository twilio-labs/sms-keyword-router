# SMS Keyword Router

This SMS Keyword Router allows you to connect your phone number, messaging service, or short code to multiple webhooks. A user can text in with a keyword (e.g. "Support" or "Sales") and have all of their messages forwarded to a webhook that is specific to that keyword.

Use cases:

* You have a short code that's being used by different departments within your company and each department has a unique app they'd like to connect to.
* You'd like to connect multiple Twilio Studio Flows to a single phone number so that different teams can edit separate flows simultaneously.

# Prerequisites
* Install the Twilio CLI: https://www.twilio.com/docs/twilio-cli/quickstart
* Install the Twilio Serverless CLI plugin: `twilio plugins:install @twilio-labs/plugin-serverless`
* Connect the Twilio CLI to your account by running `twilio login`

# Getting Started

## Initial Setup
- [ ] Clone the repository: `git clone git@github.com:twilio-labs/sms-keyword-router.git`
- [ ] Open the project directory: `cd sms-keyword-router`

- [ ] Run the setup script: `bash setup.sh`. You can also run the bash script's commands manually:
    1. `twilio api:sync:v1:services:create --friendly-name='Keyword Sessions'`
    1. `twilio api:sync:v1:services:maps:create --service-sid=ISXXXXXXXXXXXXX`
    1. Add `SYNC_SERVICE_SID=ISXXXXXXXXXXXXX` and `MAP_ID=MPXXXXXXXXXXXXX` to `.env` file.

- [ ] Open `router.js` and modify they `keywords` variable on [line 5](https://github.com/twilio-labs/sms-keyword-router/blob/master/functions/router/router.js#L5) with the keywords and webhooks you'd like to use. The first value in each line is the keywords (case insensitive) and the second value is the webhook that messages will be redirected to.

    - Here's an example of what this should look like:

    ```
    let keywords = new Map([
        ['census', 'https://textit.in/c/tms/receive/12345ABCDE'],
        ['shelter', 'https://gopidj.com/inbox/route/acd1234'],
        ['default', 'https://webhooks.twilio.com/studio/FWXXXXXXXXXXX']
    ]);
    ```
    > Note: `default` is a special keyword that will be used if a user's first text doesn't match any of the specified keywords. You can connect this to an app, or just create a [Studio Flow with an auto-response](https://www.twilio.com/docs/studio/tutorials/how-to-set-up-auto-responder).

- [ ] Set the `ttl` variable on [line 11](https://github.com/twilio-labs/sms-keyword-router/blob/master/functions/router/router.js#L11) of `router.js`. This is the the amount of time (in seconds) that a keyword's session will stay active.

- [ ] Deploy your project: `twilio serverless:deploy`

- [ ] Configure your phone number, short code, or messaging service's webhook URL with the `router.js` function URL displayed in the deploy command. The URL should look something like:
    * `https://sms-keyword-router-1234-dev.twil.io/router/router`

- [ ] Optional: call the `delete-session.js` URL at the end of your conversation so that the user can immediately text in a new keyword and be connected to a different app.
    - Example request: `https://sms-keyword-router-1234-dev.twil.io/delete-session/delete-session?phone=+1234567890`

## Local Development
Test changes locally before deploying to production:

Start a local server: `twilio serverless:start --live`
Create a tunnel to your localhost using ngrok: `ngrok http 3000`
Update a phone number's SMS webhook URL with your function's ngrok url (e.g. 1234.ngrok.io/router/router).

## Testing
1. Text one of your keywords to the phone number that you've connected to the `router.js` function.
1. You should see the message appear in the app and/or receive the automated response that the app typically provides.
1. You can remove your keyword session manually and try another keyword using this Twilio CLI command:

```
twilio api:sync:v1:services:maps:items:remove \
    --key="[YOUR PHONE NUMBER in e164 format e.g. +1234567890]" \
    --map-sid=MPXXXXXXXXXXXX \
    --service-sid=ISXXXXXXXXXXXX
```

# How it Works

When a user texts in a keyword to your number, a new session is created in Twilio Sync that forwards Twilio's request on to your webhook. For subsequent messages, the router will check to see if there's still a session in Twilio Sync, and continue forwarding messages to the same web app.

Once the `delete-session.js` function is called, or the `ttl` for the session is reached, the router will check if the message is a keyword and again forward messages on the the correct app.

If a user doesn't have an existing session, the webhook associated with the `default` keyword is used.


# PostIT client

This is the client application for PostIT. This is a React application. You can start a development server by doing the following:

1. Navigate to the `postit-client` folder on the terminal/command prompt
2. Run the command `npm install` to install all required dependencies
3. Create a new file called `.env` in the root directory of `postit-client` (or use an existing one)
4. If you don't have a set of vapid keys, use [web-push](https://www.npmjs.com/package/web-push) to generate these. Follow the tutorial in web-push-tut.md.
5. Set the following environment variables in this file:

| Variable | Context |
|----------|---------|
REACT_APP_SERVER_PORT=3010 | Port of the PostIT server
REACT_APP_SERVER_URL=localhost | URL of the PostIT server
REACT_APP_SERVER_PROTOCOL=http | Protocol of the PostIT server
REACT_APP_OWN_URL=http://localhost:3000 | The URL that the client is being served on
REACT_APP_ENV=dev | Environment that the app is running in, can be dev or prod and has impact on the CORS settings when sending requests to the server, devtools and logging
REACT_APP_MAX_IMAGE_SIZE=1000000 | 1000000 = 1mb, max image size for uploading images to the Postit server
VAPID_PUBLIC_KEY=long_key | Needed for notification support, used for authenticating with the PostIT server when using web-push. Generated with [web-push](https://www.npmjs.com/package/web-push)

5. When all env variables are set, run the command `npm start` while still in the `postit-client` folder

You're done! You can access your development server via http://localhost:3000.
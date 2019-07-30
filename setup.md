# PostIT client

These are the setup instructions for the client application for PostIT. This is a React application. You can start a development server by doing the following:

1. Navigate to the `postit-client` folder on the terminal/command prompt
2. Run the command `npm install` to install all required dependencies
3. Create a new file called `.env` in the root directory of `postit-client` (or use an existing one)
4. If you don't have a set of vapid keys, use [web-push](https://www.npmjs.com/package/web-push) to generate these. Follow the tutorial in the file `generate_vapid_keys.md`.
5. Set the following environment variables in this file:

| Variable | Context |
|----------|---------|
REACT_APP_SERVER_PORT=3010 | Port of the PostIT server
REACT_APP_SERVER_URL=localhost | URL of the PostIT server
REACT_APP_SERVER_PROTOCOL=http | Protocol of the PostIT server
REACT_APP_OWN_URL=http://localhost:3000 | The URL that the client is being served on
REACT_APP_ENV=dev | Environment that the app is running in, can be dev or prod and has impact on the CORS settings when sending requests to the server, devtools and logging
REACT_APP_MAX_IMAGE_SIZE=1000000 | 1000000 = 1mb, max image size for uploading images to the Postit server
VAPID_PUBLIC_KEY=345tgf | Needed for notification support, used for authenticating with the PostIT server when using web-push. The public key you generated earlier

5. When all env variables are set, run the command `npm start` while still in the `postit-client` folder

You're done! You can access your development server via the URL displayed in the console.

# PostIT server

This is the server application for PostIT. This is a NodeJS Express application. You can start a development server by doing the following:

1. Navigate to the `postit-server` folder on the terminal/command prompt
2. Run the command `npm install` to install all required dependencies
3. Create a new file called `.env` in the root directory of `postit-server` (or use an existing one)
4. If you don't have a set of vapid keys, use [web-push](https://www.npmjs.com/package/web-push) to generate these. Follow the tutorial in the file `generate_vapid_keys.md`.
5. Set the following environment variables in this file:

| Variable | Context |
|----------|---------|
DB_URL=databaseurl.com | URL of the MongoDB database server
DB_PORT=27017 | Port of the MongoDB database server
DB_USER=username | Username to authenticate with the database. Can be omitted for MongoDB database servers without authentication
DB_PASSWORD=secretpass | Password to authenticate with the database. Can be omitted for MongoDB database servers without authentication
DB_NAME=postit | Name of the database that the server should use
DB_AUTH=admin | Authentication database for the username and password. Can be omitted if the server does not have any authentication
DB_SRV=true/false | Toggle srv for the MongoDB server. Required for Mongo Atlas to be true
APP_PORT=3010 | Port that the server should listen on
SECRET_KEY=C6HS@+RhbJL7E{^c | Encryption key used for the session parser
EMAIL_HOST=smtp.gmail.com | SMTP server for sending e-mails
EMAIL_PORT=587 | Port that is used for the SMTP server
EMAIL_ADDR=mail@domain.com | E-mail address that is used for authenticating with the SMTP server and sending e-mails
EMAIL_PASSWORD=password | Password for the SMTP server
EMAIL_BASE_URL_TO_PAGE=https://url.com | URL used to link to the client application from e-mails
IMAGE_SERVER_URL=localhost | URL of the image server, this directs the client to the right server for getting images (for when you want to use a seperate server for storing images, currently points to the API server)
IMAGE_SERVER_PORT=3010 | URL of the image server, this directs the client to the right server for getting images (for when you want to use a seperate server for storing images, currently points to the API server)
IMAGE_SERVER_PROTOCOL=http | Protocol to communicate with the image server
IMAGE_MAX_SIZE_IN_MB=5 | Max size of images being uploaded to this server
VAPID_SUBJECT=mailto:mail@domain.com | Required for web push, contact e-mail
VAPID_PUBLIC_KEY=234dswf | Needed for notification support, used for authenticating with the PostIT client when using web-push. The public key you generated earlier
VAPID_PRIVATE_KEY=234kb | Needed for notification support, used for authenticating with the PostIT client when using web-push. The private key you generated earlier

6. When all env variables are set, run the command `npm start` while still in the `postit-server` folder

You're done! You can access your development server via http://localhost:3000.
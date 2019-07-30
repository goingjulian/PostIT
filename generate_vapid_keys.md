# Generate a set of vapid keys

In order to enable web push notifications in the app, you need to provide a set of keys to the client and server application. This tutorial shows how you can generate these.

1. Install [web-push](https://www.npmjs.com/package/web-push) via npm with command `npm install web-push -g`. The -g tag will install it globally, and not only in the project folder.
2. Run the following command to generate the set of keys: `web-push generate-vapid-keys [--json]`
3. You will see the following output:
```
=======================================

Public Key:
BP9wtae10JYCxunqByQZUitD9Lov4nuyVC7oAzEiTSYgwEcQyF0WCI8NJSVGve4l-M1UQygr3dXkFHssX6J84Go

Private Key:
M2-5eiehxV_tud4oRtgAC3QdlZcrjeuJQ-QKv9XaeCc

=======================================
```
4. Copy the public key to the env files of both the client and the server. Copy the private key to then env file of the server.
Done! You now have the required keys to enable notifications in PostIT.
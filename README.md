# PostIT
PostIT was developed as part of a school project. The goal was to develop a stable and usable application in a known programming language and toolset.

## The concept
PostIT provides a digital idea board for your organisation. You can create your own "space" on the app. Employees can visit your space by visiting the spaces' unique URL. On your organisations space, employees can upvote existing ideas without logging in. They can only vote once per idea however. An employee can login by entering their work e-mail. The administrator of the space can set the e-mail domains that the employee is allowed to register with. Logged in employees can post ideas and comments.

There is also a special viewing mode for public displays. All ideas of the organisation are shown. New ideas and comments ae highlighted on this view, upvotes get special attention as well.

With serviceworkers and web-push, web notifications are supported as well. These notifications can be turned on or off per organisation and are sent when new ideas or comments are posted to the organisations space.

## Toolstack
The PostIT client application was developed in React + Redux for state management. The backend was developed in NodeJS + Express, combined with the ws library for Websockets integration.

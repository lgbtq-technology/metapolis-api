Slack Helper API
================

An API service for file hosting and posting to slacks as well as utility functions for managing Slack communities.

The main instance is available at https://api.metapolis.space/ with the user interface at https://metapolis.space/

Contributing
------------

This application is a [restify](https://www.npmjs.com/package/restify) service. It is configured with environment variables:

- `PORT`, the port to listen on for the service. If not specified, `3001` will be used.
- `SLACK_APP_CLIENT_ID`, the Slack client ID (not secret)
- `SLACK_APP_CLIENT_SECRET`, the Slack secret for the application.

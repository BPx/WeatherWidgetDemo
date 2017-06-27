
# WeatherWidgetDemo


## Setup

    npm install

This needs to run once before building or starting the dev server.

## Build

    npm run build

This will build ``/dist``, which can then be deployed on any server with a simple copy. There is no backend required.


## Dev server

    npm run start

This will launch a dev server at ``http://localhost:9000/`` and open the url in your browser. When source files change the bundle is automatically updated and the browser page will be reloaded.


## Cached data

``src/cached`` contains data which changes infrequently. This data should be checked for updates using a script on a sensible interval, but the list of cities/countries doesn't changed very often.

- ``ISO 3166-2.json``, source http://data.okfn.org/data/core/country-list
- ``city.list.json``, source http://bulk.openweathermap.org/sample/


## Todo with more time

- Show the time in the local timezone. Right now it's UTC.

- Setup a test environment. This could include karma with jasmine and chrome (karma-chrome-launcher). This way we can have automated testing for CI with real-world conditions. Add karma-firefox-launcher, karma-edge-launcher, karma-safari-launcher or other targets we are interested in.

- Add a JS linter.

- Document the code (not relevant for a spike, but necessary in real products)

- We could setup a proxy on the server for openweathermap so the frontend doesn't see the API key if it's important, or we could make it configurable for the user with an input in the UI.

- Extract the list of cities for each country from city.list.json and use the data for dropdowns in the app.

- Build React in production mode to reduce size and improve performance.

- Use react-router. Realistically, all apps bigger than a tiny demo need a router. We could save the page config (widgets) in the url (or in the local storage).

- Hire a UX Designer for a nice UI. The current one is functional but raw.

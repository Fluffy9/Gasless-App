# Gasless App
The web UI for users to manage their Gasless account. Here, you can: 
* See the API endpoints
* Test the API endpoints
* See how much of your quota you've used
* See when your quota resets
* See the transactions you've made
* Upgrade/cancel your subscription

## [Demo](http://pupcakes.me:8083)

## Issues
The dashboard relies on the [explorer](https://explorer.execution.l16.lukso.network/) for transaction history in lieu of subgraph access. The explorer is not syncing the most recent blocks meaning the api data is stale. This is the reason why the dashboard does not show all past user transactions

## Testing
When paying with Stripe, use the test cards shown [here](https://stripe.com/docs/testing#use-test-cards)

## Development setup
Modify the variables in the .env file as necessary

```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Docker

**Do not push the docker image to a public location like dockerhub to avoid leaking enviornment variables**
### Build

```
docker build . -t gasless/app
```
### Run
```
docker run -p 8081:8080 -d --name app gasless/app
```


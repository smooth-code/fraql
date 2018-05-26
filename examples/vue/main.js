import Vue from 'vue'
import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'
import App from './App'

const client = new ApolloClient({
  uri: 'https://w5xlvm3vzz.lp.gql.zone/graphql',
})

Vue.use(VueApollo)

const apolloProvider = new VueApollo({
  defaultClient: client,
})

new Vue({
  el: '#app',
  provide: apolloProvider.provide(),
  render: h => h(App),
});

<template lang="html">
  <div class="apollo">
    <div v-if="$apollo.loading">Loading...</div>
    <div v-else-if="$apollo.error">Error :(</div>
    <RateCard v-else v-for="rate in rates" :key="rate.currency" :rate="rate" />
  </div>
</template>

<script>
import RateCard from './RateCard';
import gql from 'graphql-tag';

export default {
  components: {
    RateCard
  },

  apollo: {
    rates: gql`{
      rates(currency: "USD") {
        ${RateCard.fragments.rate}
      }
    }`,
  },

  data () {
    return {
      rates: '',
    }
  }
}
</script>

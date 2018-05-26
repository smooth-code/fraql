<template>
  <div style="margin: 20px">
    <h2>{{rate.name}}</h2>
    <p>
      {{rate.currency}} - {{rate.rate}}
    </p>
  </div>
</template>

<script>
import React from 'react'
import gql from '../../'

export default {
  props: {
    rate: Object
  },
  fragments: {
    rate: gql`
      fragment _ on ExchangeRate {
        name
        currency
        rate
      }
    `,
  }
}
</script>

import React from 'react'
import { introspectionQuery } from 'graphql'
import gql from '../../'

const RateCard = ({ rate }) => (
  <div style={{ margin: 20 }}>
    <h2>{rate.name}</h2>
    <p>
      {rate.currency} - {rate.rate}
    </p>
  </div>
)

RateCard.fragments = {
  rate: gql`
    fragment _ on ExchangeRate {
      name
      currency
      rate
    }
  `,
}

export default RateCard

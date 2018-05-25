import React from 'react'
import { Query } from 'react-apollo'
import gql from '../../'
import RateCard from './RateCard'

const App = () => (
  <Query
    query={gql`
      {
        rates(currency: "USD") {
          ${RateCard.fragments.rate}
        }
      }
    `}
  >
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>
      if (error) return <p>Error :(</p>

      return data.rates.map(rate => (
        <RateCard key={rate.currency} rate={rate} />
      ))
    }}
  </Query>
)

export default App

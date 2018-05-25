import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'
import { createMockerFromIntrospection } from '../../../mock'
import RateCard from '../RateCard'
import * as introspectionData from '../schema.json'

const mocker = createMockerFromIntrospection(introspectionData, {
  mocks: {
    ExchangeRate: () => ({
      name: 'Euro',
      currency: 'EUR',
      rate: 0.86,
    }),
  },
})

const props = mocker.mockFragments(RateCard.fragments)

storiesOf('RateCard', module).add('default', () => <RateCard {...props} />)

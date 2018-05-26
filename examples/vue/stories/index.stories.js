import Vue from 'vue'
import { storiesOf } from '@storybook/vue'
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

storiesOf('RateCard', module).add('default', () => ({
  components: { RateCard },
  data () {
    return {
      rate: props.rate
    }
  },
  template: '<RateCard :rate="rate" />'
}))

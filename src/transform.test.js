import gql from 'graphql-tag'
import { toInlineFragment } from './'

describe('transform', () => {
  describe('#toInlineFragment', () => {
    it('should throw an error if we use it on a query', () => {
      expect.assertions(1)

      try {
        toInlineFragment(gql`
          query Articles {
            articles {
              title
            }
          }
        `)
      } catch (error) {
        expect(error.message).toBe(
          'fraql: toInlineFragment must be called on a document that only contains fragments',
        )
      }
    })

    it('should transform a GraphQL tree into an inline fragment', () => {
      const fragment = toInlineFragment(gql`
        fragment _ on Article {
          title
        }
      `)

      expect(fragment.loc.source.body).toMatchSnapshot()
    })
  })
})

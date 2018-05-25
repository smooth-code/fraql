import { makeExecutableSchema } from 'graphql-tools'
import { introspectSchema } from './server'

describe('server', () => {
  describe('#introspectSchema', () => {
    it('should generate an introspection result', () => {
      const schema = makeExecutableSchema({
        typeDefs: /* GraphQL */ `
          type Query {
            article: Article
          }

          type Article {
            id: ID!
            title: String
          }
        `,
      })

      const introspectionResult = introspectSchema(schema)
      expect(introspectionResult).toMatchSnapshot()
    })
  })
})

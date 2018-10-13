import { GraphQLSchema } from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'
import * as introspectionResult from './__fixtures__/schema.json'
import gql from '.'
import {
  Mocker,
  createMockerFromIntrospection,
  createMockerFromSchema,
  generateSchemaFromIntrospectionResult,
} from './mock'

describe('mock', () => {
  let mocker

  beforeEach(() => {
    mocker = createMockerFromIntrospection(introspectionResult)
  })

  describe('#generateSchemaFromIntrospectionResult', () => {
    it('should generate a schema from an introspection result', () => {
      expect(
        generateSchemaFromIntrospectionResult(introspectionResult),
      ).toBeInstanceOf(GraphQLSchema)
    })
  })

  describe('#createMockerFromSchema', () => {
    it('should create a mocker from a schema', () => {
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

      const mocker = createMockerFromSchema(schema)
      expect(mocker).toBeInstanceOf(Mocker)
    })
  })

  describe('#createMockerFromIntrospection', () => {
    it('should be possible to specify mocks', () => {
      const mocks = {
        Package: () => ({
          name: 'My Package',
        }),
      }
      mocker = createMockerFromIntrospection(introspectionResult, { mocks })
      const fragment = gql`
        fragment _ on Package {
          name
        }
      `
      expect(mocker.mockFragment(fragment)).toEqual({
        name: 'My Package',
      })
    })
  })

  describe('#fromFragment', () => {
    it('should generate data from a fragment', () => {
      const fragment = gql`
        fragment _ on Package {
          id
          name
          coverPicture {
            cloudinaryId
          }
        }
      `

      const data = mocker.mockFragment(fragment)
      expect(data.id).toBeDefined()
      expect(data.name).toBe('Hello World')
      expect(data.coverPicture.cloudinaryId).toBe('Hello World')
    })

    it('should be possible to specify mocks', () => {
      const fragment = gql`
        fragment _ on Package {
          id
          name
          coverPicture {
            cloudinaryId
          }
        }
      `

      const data = mocker.mockFragment(fragment, {
        mocks: {
          Picture: () => ({
            cloudinaryId: 'A cloudinaryId',
          }),
        },
      })

      expect(data.id).toBeDefined()
      expect(data.name).toBe('Hello World')
      expect(data.coverPicture.cloudinaryId).toBe('A cloudinaryId')

      // Mock should not modify original schema
      const data2 = mocker.mockFragment(fragment)
      expect(data2.coverPicture.cloudinaryId).toBe('Hello World')
    })

    it('should throw an error if a type is not found', () => {
      const fragment = gql`
        fragment _ on WTF {
          id
          name
        }
      `

      expect.assertions(1)
      try {
        mocker.mockFragment(fragment)
      } catch (error) {
        expect(error.message).toBe('fraql: type "WTF" not found')
      }
    })

    it('should throw an error if an interface has no __typename', () => {
      const fragment = gql`
        fragment _ on Place {
          id
          name
        }
      `

      expect.assertions(1)
      try {
        mocker.mockFragment(fragment, { mocks: { Place: () => ({}) } })
      } catch (error) {
        expect(error.message).toBe('Please return a __typename in "Place"')
      }
    })

    it('should support interface', () => {
      const fragment = gql`
        fragment _ on Place {
          id
          name
        }
      `

      const data = mocker.mockFragment(fragment, {
        mocks: { Place: () => ({ __typename: 'Hotel' }) },
      })

      expect(data.id).toBeDefined()
    })
  })

  describe('#fromFragments', () => {
    it('should be possible mock several fragments', () => {
      const fragments = {
        package: gql`
          fragment _ on Package {
            id
            name
            coverPicture {
              cloudinaryId
            }
          }
        `,
        hotel: gql`
          fragment _ on Hotel {
            name
            stars
          }
        `,
      }

      const data = mocker.mockFragments(fragments)
      expect(data.package.id).toBeDefined()
      expect(data.package.name).toBe('Hello World')
      expect(data.package.coverPicture.cloudinaryId).toBe('Hello World')
      expect(data.hotel.name).toBe('Hello World')
      expect(data.hotel.stars).toBeDefined()
    })

    it('should be possible to specify mocks', () => {
      const fragments = {
        package: gql`
          fragment _ on Package {
            id
            name
            coverPicture {
              cloudinaryId
            }
          }
        `,
        hotel: gql`
          fragment _ on Hotel {
            name
            stars
          }
        `,
      }

      const data = mocker.mockFragments(fragments, {
        mocks: {
          Hotel: () => ({
            stars: 5,
          }),
        },
      })
      expect(data.package.id).toBeDefined()
      expect(data.package.name).toBe('Hello World')
      expect(data.package.coverPicture.cloudinaryId).toBe('Hello World')
      expect(data.hotel.name).toBe('Hello World')
      expect(data.hotel.stars).toBe(5)
    })
  })
})

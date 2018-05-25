import gql from 'graphql-tag'
import {
  buildClientSchema,
  execute,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLSchema,
} from 'graphql'
import {
  addMockFunctionsToSchema,
  mergeSchemas,
  transformSchema,
} from 'graphql-tools'

export function generateSchemaFromIntrospectionResult(introspectionResult) {
  const introspectionData = introspectionResult.data || introspectionResult
  const originalSchema = buildClientSchema(introspectionData)

  const typeMap = originalSchema.getTypeMap()
  const fields = Object.keys(typeMap).reduce((fields, typeName) => {
    const type = typeMap[typeName]
    if (
      typeName.startsWith('__') ||
      typeName === 'Query' ||
      (!(type instanceof GraphQLObjectType) &&
        !(type instanceof GraphQLInterfaceType))
    ) {
      return fields
    }
    return {
      ...fields,
      [`fraql__${typeName}`]: {
        type: typeMap[typeName],
      },
    }
  }, {})

  const fraqlSchema = new GraphQLSchema({
    query: new GraphQLObjectType({ name: 'Query', fields }),
  })

  return mergeSchemas({ schemas: [originalSchema, fraqlSchema] })
}

function mockSchema(schema, { mocks } = {}) {
  // Clone schema
  const clonedSchema = transformSchema(schema, [])
  addMockFunctionsToSchema({ schema: clonedSchema, mocks })
  return clonedSchema
}

function executeFragment(schema, fragmentDocument) {
  if (!fragmentDocument.originalDocument) {
    throw new Error(
      'fraql: generateDataFromFragment supports only fraql fragments',
    )
  }
  const typeName = fragmentDocument.definitions[0].typeCondition.name.value
  const fieldName = `fraql__${typeName}`
  const query = gql`
    query {
      ${fieldName} {
        ${fragmentDocument}
      }
    }
  `

  const res = execute(schema, query)

  if (res.errors && res.errors.length) {
    throw res.errors[0]
  }

  if (res.data[fieldName] === undefined) {
    throw new Error(`fraql: type "${typeName}" not found`)
  }
  return res.data[fieldName]
}

export class Mocker {
  constructor(schema, { mocks } = {}) {
    this.schema = schema
    this.mocks = mocks
  }

  mockSchema({ mocks } = {}) {
    const mergedMocks = { ...this.mocks, ...mocks }
    return mockSchema(this.schema, { mocks: mergedMocks })
  }

  mockFragment(fragmentDocument, options) {
    const schema = this.mockSchema(options)
    return executeFragment(schema, fragmentDocument)
  }

  mockFragments(fragmentDocuments, options) {
    const schema = this.mockSchema(options)
    return Object.keys(fragmentDocuments).reduce((data, key) => {
      const fragmentDocument = fragmentDocuments[key]
      return {
        ...data,
        [key]: executeFragment(schema, fragmentDocument),
      }
    }, {})
  }
}

export function createMockerFromSchema(schema, options) {
  return new Mocker(schema, options)
}

export function createMockerFromIntrospection(introspectionResult, options) {
  const schema = generateSchemaFromIntrospectionResult(introspectionResult)
  return createMockerFromSchema(schema, options)
}

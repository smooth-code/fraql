/* eslint-disable no-underscore-dangle, no-console */
import gql from 'graphql-tag'
import { execute, introspectionQuery } from 'graphql'

export function introspectSchema(schema) {
  const data = execute(
    schema,
    gql`
      ${introspectionQuery}
    `,
  )
  return data
}

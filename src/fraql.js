import gql, { disableFragmentWarnings } from 'graphql-tag'
import { toInlineFragment } from './transform'

const fraql = (...args) => {
  disableFragmentWarnings()

  const doc = gql(...args)

  if (doc.definitions.every(({ kind }) => kind === 'FragmentDefinition')) {
    return toInlineFragment(doc)
  }

  return doc
}

export default fraql

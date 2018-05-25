import { print, Source } from 'graphql/language'

function inlineSpreadFragments(fragmentDefinitions, definition) {
  if (definition.kind === 'FragmentSpread') {
    return fragmentDefinitions.find(
      ({ name }) => name.value === definition.name.value,
    )
  }
  if (!definition.selectionSet) {
    return definition
  }

  definition.selectionSet = {
    ...definition.selectionSet,
    selections: definition.selectionSet.selections.map(selection =>
      inlineSpreadFragments(fragmentDefinitions, selection),
    ),
  }

  return definition
}

export function toInlineFragment(doc) {
  let definitions = doc.definitions.map(definition => {
    if (definition.kind !== 'FragmentDefinition') {
      throw new Error(
        `fraql: toInlineFragment must be called on a document that only contains fragments`,
      )
    }

    return {
      kind: 'InlineFragment',
      name: definition.name,
      directives: definition.directives,
      selectionSet: definition.selectionSet,
      typeCondition: definition.typeCondition,
    }
  })

  definitions = definitions.map(definition =>
    inlineSpreadFragments(definitions, definition),
  )

  const definition = definitions[0]

  if (!definition) {
    throw new Error('Unable to find a fragment definition')
  }

  const newDoc = {
    ...doc,
    originalDocument: doc,
    definitions: [definition],
  }

  newDoc.loc = {
    ...doc.loc,
    source: new Source(print(newDoc)),
  }

  return newDoc
}

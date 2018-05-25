import gql from './'

describe('fraql', () => {
  it('should not do anything on query', () => {
    const fragment = gql`
      query Articles {
        articles {
          title
        }
      }
    `

    expect(fragment.loc.source.body).toMatchSnapshot()
  })

  it('should transform basic fragments', () => {
    const fragment = gql`
      fragment _ on Article {
        title
      }
    `

    expect(fragment.loc.source.body).toMatchSnapshot()
  })

  it('should support inline fragments', () => {
    const fragment = gql`
      fragment _ on Article {
        title
        author {
          name
          ... on User {
            avatar
          }
        }
      }
    `

    expect(fragment.loc.source.body).toMatchSnapshot()
  })

  it('should support directives', () => {
    const fragment = gql`
      fragment _ on Article {
        title @upperCase
      }
    `

    expect(fragment.loc.source.body).toMatchSnapshot()
  })

  it('should support named fragments', () => {
    const fragment = gql`
      fragment _ on Article {
        ...ArticleDate
        title
        siblings {
          ...ArticleDate
          title
          siblings {
            ...ArticleDate
            title
          }
        }
      }

      fragment ArticleDate on Article {
        id
      }
    `

    expect(fragment.loc.source.body).toMatchSnapshot()
  })

  it('should keep original document', () => {
    const fragment = gql`
      fragment _ on Article {
        title
      }
    `

    expect(fragment.originalDocument.loc.source.body).toMatchSnapshot()
  })
})

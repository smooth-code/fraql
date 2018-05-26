<h1 align="center">
  <img src="https://raw.githubusercontent.com/smooth-code/fraql/master/resources/fraql-logo.png" alt="FraQL" title="FraQL" width="300">
</h1>
<p align="center" style="font-size: 1.2rem;">Build data aware components using GraphQL ⚡️</p>

[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package] [![MIT License][license-badge]][license]

[![PRs Welcome][prs-badge]][prs]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

```sh
npm install fraql graphql graphql-tools graphql-tag
```

FraQL solves several things:

* ☀️ Isolation: fragments don't rely on name anymore
* ✨ Mocking: generate data & props from fragments
* 🤯 Collocation: put GraphQL in your components

## Example

```js
import gql from 'fraql'

// Create fragment without naming it.
const fragment = gql`
  fragment _ on Article {
    title
    description
  }
`

// Just use it in your queries!
const query = gql`
  query Articles {
    articles {
      id
      ${fragment}
    }
  }
`
```

**⚡️ [See live example on CodeSandbox](https://codesandbox.io/s/l42jqm319l)**

## Motivation

Putting data next to your component is a good practice. It is built-in [Relay](https://facebook.github.io/relay/) and Lee Byron explains the advantages into [his talk about the IDEA architecture](https://www.youtube.com/watch?v=oTcDmnAXZ4E).

I tried to do it by myself, but relying on fragment names is not an easy task. FraQL solves this issue by bringing isolation, fragments do not rely on their names.

The second problem solved by FraQL is the mocking. Generating a set of data for complex components is a pain. FraQL solves it by generating data right from your fragments!

## Usage with React

### Reference fragments into components

FraQL exports a default tag function that is a drop-in replacement for `graphql-tag`. By using it you can create easily reusable fragments.

FraQL is not a framework, but it is recommended create a static property `fragments` on your components that contains a map of properties. For each one, you can specify the associated fragment.

You may have noticed that the fragment uses "\_" as name. FraQL transforms your fragment into an inline fragment, the name is just dropped, using "\_" is just a convention.

```js
import React from 'react'
import gql from 'fraql'

const ArticleCard = ({ article }) => (
  <div>
    <h1>{article.title}</h1>
    <p>{article.description}</p>
  </div>
)

// Create a map of fragments and reference them on a static property "fragments"
ArticleCard.fragments = {
  article: gql`
    fragment _ on Article {
      title
      description
    }
  `,
}

export default ArticleCard
```

### Use fragments into your queries

With FraQL, using a fragment into a query is natural, the only thing to do it to reference it at the place you want to use it.

Importing `gql` from `fraql` is not require for building query. In this case this is just a pass-throught to `graphql-tag`. The magic behind FraQL only happens when you use it on a fragment.

```js
import React from 'react'
import gql from 'fraql'
import { Query } from 'apollo-client'
import ArticleCard from './ArticleCard'

// Build your query by using your fragment.
const ARTICLES = gql`
  query Articles {
    articles {
      id
      ${ArticleCard.fragments.article}
    }
  }
`

const ArticleList = ({ articles }) => (
  <div>
    <Query query={ARTICLES}>
      {({ data }) =>
        data.articles &&
        data.articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))
      }
    </Query>
  </div>
)

export default ArticleList
```

**⚡️ [See live example on CodeSandbox](https://codesandbox.io/s/l42jqm319l)**

**⚡️ [See React example in this repository](https://github.com/smooth-code/fraql/tree/master/examples/react)**

## Mocking

Tools like [StoryBook](https://github.com/storybooks/storybook) permits you to develop your components into an isolated environment. But you still have to generate a set of data for displaying your components. Maintaining this set of data is a pain.

If all your components have fragments, you get mocking for free!

#### 1. Generate introspection

Mocking data from a fragment requires to know all schema types. You have to generate a introspection result from your schema in order to use mocking.

FraQL exposes a method `introspectSchema` to simplify this operation. The only thing you have to do is creating a script that dump your introspection result into a JSON file.

```js
// Example of script that generate an introspection result into "schema.json"
const { writeFileSync } = require('fs')
const { introspectSchema } = require('fraql/server')
const schema = require('./myGraphQLSchema') // Your schema defined server-side

const data = introspectSchema(schema)
fs.writeFileSync('schema.json', JSON.stringify(data))
```

#### 2. Create a mocker

FraQL exposes a method `createMockerFromIntrospection` that create a mocker from your `schema.json`.

It is recommended to create one mocker and to use it everywhere you need to generate data.

```js
// mocker.js
import { createMockerFromIntrospection } from 'fraql/mock'
import introspectionData from './schema.json'

export default createMockerFromIntrospection(introspectionData)
```

#### 3. Mock your fragments

You can now mock fragments using `mockFragment` or `mockFragments` methods.

**Single fragment**

```js
import gql from 'fraql'
import mocker from './mocker'

const fragment = gql`
  fragment _ on Article {
    id
    title
    author {
      name
    }
  }
`

const data = mocker.mockFragment(fragment)
// {
//   id: '4b165f7d-2ee1-4f09-8fd7-fc90d38a238a',
//   title: 'Hello World',
//   author: {
//     name: 'Hello World',
//   },
// }
```

**Multiple fragments (components)**

```js
import React from 'react'
import gql from 'fraql'
import mocker from './mocker'
import ArticleCard from './ArticleCard'

// Generate all props directly from fragments
const props = mocker.mockFragments(ArticleCard.fragments)

// Create a component using props
const articleCard = <ArticleCard {...props} />
```

**⚡️ [See StoryBook example in this repository](https://github.com/smooth-code/fraql/tree/master/examples/react)**

## Recipes

### Compose fragments

One of the principle of React is component composition. It is recommended to do the same with your GraphQL fragments. FraQL makes it easy:

```js
// ArticleTitle.js
import React from 'react'
import gql from 'fraql'

const ArticleTitle = ({ article }) => <h2>{article.title}</h2>

ArticleTitle.fragments = {
  article: gql`
    fragment _ on Article {
      title
    }
  `,
}

export default ArticleTitle
```

```js
// ArticleCard.js
import React from 'react'
import gql from 'fraql'
import ArticleTitle from './ArticleTitle'

const ArticleCard = ({ article }) => (
  <div>
    <ArticleTitle article={article} />
    <div>{article.text}</div>
  </div>
)

ArticleCard.fragments = {
  article: gql`
    fragment _ on Article {
      ${ArticleTitle.fragments.article}
      text
    }
  `,
}

export default ArticleCard
```

### Use without `gql`

FraQL offers a drop-in replacement for `graphql-tag` but sometimes you don't want to use `gql` to define your fragments. As mentioned in [graphql-tag documentation](https://github.com/apollographql/graphql-tag) there is a lot of other ways to do it (using Babel, Webpack, etc..).

FraQL exposes a function `toInlineFragment`, this function transforms a GraphQL fragment into an inline fragment.

```js
import { toInlineFragment } from 'fraql'
import gql from 'grapql-tag'
import fragment from './myFragment.gql'

const inlineFragment = toInlineFragment(fragment)

const query = gql`
  query {
    articles {
      ${inlineFragment}
    }
  }
`
```

### Mix named and inline fragments

Sometimes you may want to have the best of the two world, use a name fragment in one query and a inline fragment in another.

For this specific use-case FraQL exposes the original document:

```js
import gql from 'fraql'

const fragment = gql`
  fragment BaseArticleInfos on Article {
    title
    text
  }
`

const query = gql`
  query Articles {
    articles {
      ...BaseArticleInfos
    }
  }

  ${fragment.originalDocument}
`
```

### Use custom mocks

Mocking feature of FraQL is build on top of [grapql-tools](https://www.apollographql.com/docs/graphql-tools/), it means you can [customize all mocks](https://www.apollographql.com/docs/graphql-tools/mocking.html#Customizing-mocks).

You can define global mocks when you create the mocker:

```js
import introspectionData from './schema.json'

const mocker = createMockerFromIntrospection(introspectionData, {
  mocks: {
    Article: () => ({
      title: 'My article title',
    }),
  },
})
```

And you can override them into `mockFragment` and `mockFragments`:

```js
import ArticleCard from './ArticleCard'

const props = mocker.mockFragments(ArticleCard.fragments, {
  mocks: {
    Article: () => ({
      title: 'Another title',
    }),
  },
})
```

## API

### `fraql` / `gql`

The default export of `fraql` is a drop-in replacement for `graphql-tag` that automatically converts fragments into inline fragments.

```js
import gql from 'fraql'

const inlineFragment = gql`
  fragment _ on Article {
    title
  }
`

const query = gql`
  {
    articles {
      id
      ${inlineFragment}
    }
  }
`
```

### `toInlineFragment(fragmentDocument)`

Converts a fragment into an inline fragment usable in requests.

```js
import gql from 'graphql-tag'
import { toInlineFragment } from 'fraql'

const fragment = gql`
  fragment ArticleTitle on Article {
    title
  }
`

const inlineFragment = toInlineFragment(fragment)

const query = gql`
  {
    articles {
      id
      ${inlineFragment}
    }
  }
`
```

### `introspectSchema(schema)`

Generate introspection data from a schema.

```js
import { introspectSchema } from 'fraql/server'
import schema from './graphqlSchema'

const introspectionData = introspectSchema(schema)
```

### `createMockerFromIntrospection(introspectionData, { mocks } = {})`

Generate a mocker from an introspection result generated using `introspectSchema`.

You can specify mocks, using [the same format as `graphql-tools`](https://www.apollographql.com/docs/graphql-tools/mocking.html#Customizing-mocks).

```js
import { createMockerFromIntrospection } from 'fraql/mock'
import introspectionData from './schema.json'

const mocker = createMockerFromIntrospection(introspectionData)
```

### `mocker.mockFragment(fragment, { mocks } = {})`

Generate mock data from one fragment.

You can specify mocks, using [the same format as `graphql-tools`](https://www.apollographql.com/docs/graphql-tools/mocking.html#Customizing-mocks).

```js
const fragment = gql`
  fragment _ on Article {
    title
  }
`

const data = fraqlMocker.mockFragment(fragment)
// { title: 'Hello World' }
```

### `mocker.mockFragments(fragments, { mocks } = {})`

Generate mock data from a map of fragments.

You can specify mocks, using [the same format as `graphql-tools`](https://www.apollographql.com/docs/graphql-tools/mocking.html#Customizing-mocks).

```js
const fragments = {
  article: gql`
    fragment _ on Article {
      title
      author {
        name
      }
    }
  `,
  book: gql`
    fragment _ on Book {
      title
    }
  `,
}

const data = fraqlMocker.mockFragment(fragments)
// {
//   article: {
//     title: 'Hello World',
//     author: {
//       name: 'Hello World',
//     },
//   },
//   book: {
//     title: 'Hello World',
//   }
// }
```

## Inspiration & Thanks

* Thanks to [Relay](https://facebook.github.io/relay/) for bringing the collocation idea
* Thanks to Lee Byron for [his awesome talk about IDEA Architecture](https://www.youtube.com/watch?v=oTcDmnAXZ4E)
* Thanks to [Apollo](https://www.apollographql.com) for the awesome tools they provide to the GraphQL community

# License

MIT

[build-badge]: https://img.shields.io/travis/smooth-code/fraql.svg?style=flat-square
[build]: https://travis-ci.org/smooth-code/fraql
[coverage-badge]: https://img.shields.io/codecov/c/github/smooth-code/fraql.svg?style=flat-square
[coverage]: https://codecov.io/github/smooth-code/fraql
[version-badge]: https://img.shields.io/npm/v/fraql.svg?style=flat-square
[package]: https://www.npmjs.com/package/fraql
[license-badge]: https://img.shields.io/npm/l/fraql.svg?style=flat-square
[license]: https://github.com/smooth-code/fraql/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[github-watch-badge]: https://img.shields.io/github/watchers/smooth-code/fraql.svg?style=social
[github-watch]: https://github.com/smooth-code/fraql/watchers
[github-star-badge]: https://img.shields.io/github/stars/smooth-code/fraql.svg?style=social
[github-star]: https://github.com/smooth-code/fraql/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20fraql!%20https://github.com/smooth-code/fraql%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/smooth-code/fraql.svg?style=social

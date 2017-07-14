# El _schema_

Quizás la parte más importante de diseñar una API de GraphQL sea crear el _schema_. Es importante pues una vez que nuestra API esté en producción, un cambio en el schema podría romper la compatibilidad con los clientes que ya estén consumiendo la API. O sea, no podemos andar improvisando mucho acá si queremos estar en producción lo antes posible.

Diseñar el _schema_ requiere tener un entendimiento cabal del dominio de datos que vamos a exponer. En nuestro caso, estamos hablando de la [API de Hacker News](https://github.com/HackerNews/API). Es sencilla y está bien documentada, por lo cual con una primer lectura conscienzuda ya hay cosas que van saltando a la vista.

Un _schema_ es básicamente la declaración de los tipos de cada una de nuestras entidades. Cada tipo tiene campos, que pueden ser de uno de los tipos primitivos (`Boolean`, `Int`, etc.) o de otro tipo que hayamos definido. Además cada uno de los tipos puede (o no) tener un _resolver_, que es una función de JavaScript que indica cómo obtener el dato desde el backend.

Por último, el _schema_ debe sí o sí tener un tipo `Query` que indica los puntos de entrada de un query.

## La API de Hacker News

Entonces, la entidad más importante parece ser los [_items_](https://github.com/HackerNews/API#items): pueden ser stories, comments, etc., es decir, tanto las entradas que se publican como los comentarios que se hacen en las mismas.

Un item tiene `id`, `deleted`, `type`, `by`, etc. Tanto `by` como `parent` y `kids` son IDs de otras entidades: `by` es el ID del usuario que creó el _item_ y `parent` y `kids` apuntan a otros _items_.

Entonces, un `Item` podría tener esta pinta:

```graphql
type Item {
  id: Int!
  deleted: Boolean
  type: String!
  by: User
  time: Int!
  text: String
  dead: Boolean
  parent: Item
  kids: [Item]
  url: String
  score: Int
  title: String
}
```

Acá ya estamos introduciendo un poco del lenguaje que vamos a utilizar para definir tipos en GraphQL. Básicamente le damos un nombre al tipo, definimos los campos que va a tener y los tipos de cada uno. Nótense estos casos:

- `parent` es del mismo tipo `Item`
- Lo que está entre corchetes (`[]`) implica que es un array
- Lo que tiene `!` implica que ese campo es no-nulo, o sea que lo que *vuelva del backend* no puede ser nulo, caso contrario la consulta devolverá error.

Habrán notado que el campo `by` es de tipo `User`, pero todavía no lo definimos. Hagámoslo.

```graphql
type User {
  id: String!
  about: String
  created: Int
  delay: Int,
  karma: Int!
  submitted: [Item]
}
```

Con `Item` y `User` definidos podemos mapear casi todo el dominio de datos de la API de Hacker News. Juntamos todo y definimos el tipo `Query`, así:

```graphql
type User {
  about: String
  created: Int
  delay: Int,
  id: String!
  karma: Int!
  submitted: [Item]
}

enum ITEM_TYPE {
  JOB
  STORY
  COMMENT
  POLL
  POLLOPT
}

type Item {
  id: Int!
  by: User!
  kids: [Item]
  score: Int!
  time: Int
  title: String
  type: ITEM_TYPE
  url: String
  text: String
  dead: Boolean
}

type Query {
  item(id: Int!): Item
  stories(page: Int, count: Int): [Item]
  user(id: String!): User
}

schema {
  query: Query
}
```

Para incluir nuestros tipos en la aplicación, vamos a hacer unos pequeños cambios. Dado que el paquete `graphql` sólo permite definir el _schema_ usando la notación de objetos de JavaScript, vamos a usar otros paquetes que nos permiten definirla con la notación que usamos más arriba, que es muchísimo más clara.

Ejecutamos lo siguiente en nuestra Terminal:

```
npm install --save graphql-tools graphql-server-express
```

Hacemos un poco de limpieza en `index.js` y lo dejamos así:

```js
// index.js
const express = require('express')
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express')
const bodyParser = require('body-parser')
const schema = require('./schema')

const app = express()

// Este endpoint utilizará el schema para parsear las consultas que lleguen por POST a /graphql
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))

// Este endpoint disponibiliza GraphiQL en el endpoint /graphiql
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

app.listen(3000, function () {
  console.log('Our Node server is up and running on port 3000!')
})
```

En `schema/index.js` incluimos los tipos en el _schema_:

```js
// schema/index.js
const { makeExecutableSchema } = require('graphql-tools')
const { getItem, getUser, getTopStories } = require('../hnclient')

const typeDefs = [`
  type User {
    about: String
    created: Int
    delay: Int,
    id: String!
    karma: Int!
    submitted: [Item]
  }

  enum ITEM_TYPE {
    JOB
    STORY
    COMMENT
    POLL
    POLLOPT
  }

  type Item {
    id: Int!
    by: User!
    kids: [Item]
    score: Int!
    time: Int
    title: String
    type: ITEM_TYPE
    url: String
    text: String
    dead: Boolean
  }

  type Query {
    item(id: Int!): Item
    stories(page: Int, count: Int): [Item]
    user(id: String!): User
  }

  schema {
    query: Query
  }
`]

const resolvers = {}

module.exports = makeExecutableSchema({ typeDefs, resolvers })
```

Usamos la función `makeExecutableSchema` que toma como parámetro un objeto con dos propiedades: `typeDefs` (los tipos) y `resolvers`, las funciones que resuelven cada campo.

## Resolvers

Los campos que sí o sí van a necesitar resolvers son `item`, `stories` y `user` del tipo `Query`.

- `item` recibe como parámetro un número y devuelve algo de tipo `Item`. Utilizaremos la función `getItem` de `hnclient` para devolver ese dato.
- `stories` devuelve un array de `Item`s, y recibe opcionalmente un número de página y la cantidad de items a devolver.
- `user` recibe el ID de un usuario que es un string y devuelve algo de tipo `User`.

Los implementamos así:

```js
const resolvers = {
  Query: {
    item (_, { id }) {
      //
    },

    stories (_, { page, count }) {
      //
    },

    user (_, { id }) {
      //
    }
  }
}
```

Es decir, `resolvers` será un objeto que mapeará la forma que tienen los tipos. Para los resolvers del tipo `Query` se creará una entrada con la key `Query` que será un objeto cuyas keys serán los nombres de los campos del tipo `Query`: `item`, `stories` y `user`. El segundo parámetro de cada función es un objeto que contiene los valores de los parámetros que se pasan en el query. Los desestructuramos para ganar en legibilidad.

Ahora agregamos la implementación de cada función:

```js
const resolvers = {
  Query: {
    item (_, { id }) {
      return getItem(id)
    },

    async stories (_, { page, count }) {
      const stories = await getTopStories()
      if (page && count) {
        return stories
          .slice(page * count, (page * count) + count)
          .map(getItem)
      }

      return stories.map(getItem)
    },

    user (_, { id }) {
      return getUser(id)
    }
  }
}
```

De los otros tipos, `Item` y `User`, también hay campos que requieren de _resolvers_.

Por ejemplo, `submitted` de `User` devuelve un array de `Item`, pero el backend devuelve sólo los IDs, con lo cual ese campo tiene que tener un resolver que por cada ID resuelva el `Item` y lo devuelva.

Tendría esta pinta:

```js
{
  // ...
  User: {
    submitted ({ submitted }) {
      // `submitted` es un array de IDs, y tengo que devolver un array de una
      // estructura que sea mappeable al tipo Item.
      // Es decir, por cada ID llamo al backend de Hacker News para obtener el item.
      return submitted.map(id => getItem(id))
    }
  }
}
```

Nótese que usamos el primer parámetro de la función. Este no tiene los argumentos, sino que tiene una referencia al nodo padre del query, de quien obtenemos el array de IDs y lo reemplazamos por el array de `Item`s.

Agregando los resolvers que faltan y juntando todo quedaría así:

```js
const resolvers = {
  Query: {
    item (_, { id }) {
      return getItem(id)
    },

    async stories (_, { page, count }) {
      const stories = await getTopStories()
      if (page && count) {
        return stories
          .slice(page * count, (page * count) + count)
          .map(getItem)
      }

      return stories.map(getItem)
    },

    user (_, { id }) {
      return getUser(id)
    }
  },
  Item: {
    by ({ by }) {
      return getUser(by)
    },
    kids ({ kids }) {
      return kids.map(getItem)
    },
    type ({ type }) {
      return type.toUpperCase()
    }
  },
  User: {
    submitted ({ submitted }) {
      return submitted.map(getItem)
    }
  }
}
```

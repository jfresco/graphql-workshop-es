# Un cliente simple

Nuestro servidor está listo. Ahora queremos ponernos del otro lado, del lado de quien consume la API GraphQL, es decir, el cliente.

## CORS

Antes vamos a hacer una pequeña modificación al servidor. Vamos a habilitar CORS para que se puedan hacer requests desde un browser en otro dominio sin problemas.

```
npm install --save cors
```

Y modificamos el archivo `index.js` para que quede así:

```js
const express = require('express')
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express')
const bodyParser = require('body-parser')
// Se agrega este require
const cors = require('cors')
const schema = require('./schema')

const app = express()

// Y se antepone `cors()` a la llamada al middleware `graphqlExpress`
app.use('/graphql', cors(), bodyParser.json(), graphqlExpress({ schema }))

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

app.listen(3001, function () {
  console.log('Our Node server is up and running on port 3001!')
})
```

## `create-react-app`

Vamos a hacer un cliente con React. Para evitar crear todo el _boilerplate_, vamos a usar la herramienta `create-react-app`. Necesitamos instalarla globalmente para poder correrla como comando:

```
npm install -g create-react-app
```

Una vez finalizada la instalación, ejecutamos el comando especificando el nombre del directorio donde se creará nuestro código.

```
create-react-app hackernews
```

Si finalizó todo correctamente, nos modemos a ese directorio con `cd hackernews` y ejecutamos `npm start`. Debería abrirse una solapa en el browser con la aplicación de ejemplo.

## Apollo Client

Ya podemos detener la aplicación con <kbd>Ctrl+C</kbd>. Lo que vamos a necesitar ahora es instalar `apollo-client` y `graphql-tag`, dos librerías para usar desde aplicaciones Web y que sirven para hacer consultas a servidores GraphQL.

```
npm install --save apollo-client graphql-tag
```

Abrimos nuestro editor de texto, esta vez dentro del directorio `create-react-app`. Editamos el archivo `src/App.js`. Ahí está el componente de React que se muestra en la página. Vamos a hacer que haga una consulta a GraphQL y se traiga las stories y las muestre:

Importamos las librerías de Apollo:

```js
import ApolloClient, { createNetworkInterface } from 'apollo-client'
import gql from 'graphql-tag'
```

Y agregamos las siguientes propiedades a la clase, justo antes de `render`:

```js
client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: 'http://localhost:3001/graphql'
  })
})

state = {
  stories: null
}

async componentDidMount() {
  const result = await this.client.query({
    query: gql`
      query {
        stories(page: 1, count: 10) {
          title
        }
      }
    `
  })

  this.setState({ stories: result.data.stories })
}
```

Por último modificamos el markup del método `render` para mostrar las stories:

```js
render() {
  return (
    <div className="App">
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h2>Welcome to React</h2>
      </div>
      <p className="App-intro">
        To get started, edit <code>src/App.js</code> and save to reload.
      </p>
      <ul>
        {this.state.stories
          ? this.state.stories.map(story =>
            <li>{story.title}</li>)
          : <span>Loading...</span>}
      </ul>
    </div>
  );
}
```

## Ejercicio

- Modificar el query para traer más datos. Utilizar esa información en el markup (por ejemplo, trayendo la URL y creando un link a cada story)
- Modificar el CSS de la aplicación 💅

___

- [Código](src)

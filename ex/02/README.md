# Creando un servidor simple

Ir de cero a "algo que responda queries GraphQL" requiere de cuatro simples pasos:

1. Set up de nuestra aplicación Node
2. Hacer que nuestra app responda requests HTTP con `express`
3. Crear un schema
4. Atar todos los cabos y probar

## Set up de nuestra aplicación Node

Primero necesitamos generar el archivo `package.json`, donde `npm` (el package manager de Node) va a ir guardando un registro de las dependencias de nuestra aplicación.

Una forma fácil de hacerlo es con el comando `npm init`. Al ejecutarlo, nos irá pidiendo datos de nuestra aplicación, como nombre, versión, URL del repositorio, etc. Probablemente sean cosas que todavía no queremos pensar, porque lo único que queremos es asegurarnos de que nuestro set up de GraphQL funciona.

Aprovechando que el `package.json` lo podemos editar en cualquier momento, podemos ejecutar lo siguiente:

```
npm init --yes
```

Y listo, tenemos nuestro `package.json` básico generado.

## Express

Lo que tenemos que hacer a continuación es incluir `express` como dependencia y empezar a codear nuestro server.

Ejecutamos:

```
npm install --save express body-parser
```

Esto debería agregar en nuestro `package.json` a `express` y `body-parser` en la entrada `dependencies`. Además se debería haber creado un directorio `node_modules`, que es donde las dependencias que vamos instalando se guardan.

Dicho esto, ya podemos codear un "hello world" de `express` y ver que todo marche bien. En el directorio raíz creamos un archivo `index.js` con el siguiente contenido:

```javascript
// index.js
const express = require('express')
const app = express()

app.get('/hello', function (req, res) {
  res.status(200).send('world!')
})

app.listen(3000, function () {
  console.log('Our Node server is up and running on port 3000! Try http://localhost:3000/hello')
})
```

Guardamos el archivo y de vuelta en la terminal ejecutamos:

```
node index
```

Si no hay errores, debería aparecer el mensaje que escribimos en el `console.log`. Esto significa que nuestra app de Node está escuchando requests HTTP en el puerto 3000.

En tu navegador escribí `http://localhost:3000/hello` en la barra de direcciones. Si aparece la palabra `world!` todo está funcionando correctamente.

:warning: **Hint**: En todo momento podés presionar <kbd>Ctrl+C</kbd> para detener el servidor.

## Ahora sí, GraphQL

En la terminal ejecutamos:

```
npm install --save graphql
```

La versión actual al momento de escribir este ejercicio es la 0.10.3.

Con eso ya tenemos `graphql`, el paquete que necesitamos para hacer correr nuestro servidor GraphQL con Node.

Antes de poder permitir a nuestro servidor aceptar y responder consultas GraphQL necesitamos definir un schema. Sin el schema los clientes no sabrían qué datos pueden consultar.

El schema se define en puro JavaScript, utilizando objetos literales. Arranquemos con algo simple:

```js
// schema.js
const { GraphQLObjectType, GraphQLSchema, GraphQLString } = require('graphql')

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: function () {
          return 'world'
        }
      }
    }
  })
})
```

¡Listo! Ya tenemos un schema.

![whoa whoa whoa whoa whoa whoa](https://media.giphy.com/media/RXKCMLmch5W2Q/giphy.gif)

¿Fui muy rápido? Muy bien, explicaré un poco qué es eso que acabamos de hacer.

El resultado final es un árbol que describe nuestro schema. Ese árbol tiene esta pinta:

```
+------------+
|   query    |
|  (Object)  |
+------------+
      |
      |
+------------+
|   hello    |
|  (String)  |
+------------+
```

Es decir que si yo quisiera consultar el nodo `hello` tendría que recorrer esa jerarquía en mi query:

```graphql
query {
  hello
}
```

`query` siempre es el nodo raíz y puedo no escribirlo:

```graphql
{
  hello
}
```

Usted estará pensando que el código en JavaScript que define el schema es demasiado complejo para definir una estructura tan simple.

Veamos el mismo código paso a paso. Después de entenderlo quizás el código no le parezca tan complejo ni la estructura tan simple.

```js
// schema.js
// Importamos las clases del paquete `graphql` que nos ayudarán a definir nuestro schema. Hay muchas más.
const { GraphQLObjectType, GraphQLSchema, GraphQLString } = require('graphql')

// El punto de entrada es crear una instancia de `GraphQLSchema`. Al constructor se le pasa un objeto literal.
module.exports = new GraphQLSchema({
  // Ese objeto literal tiene como única entrada a `query`, que es una
  // instancia de `GraphQLObjectType`.
  query: new GraphQLObjectType({
    // Query tiene un name y fields: un nombre que describe a este tipo
    // y los campos que puedo consultar.
    name: 'RootQueryType',
    fields: {
      // El único campo que definimos por ahora es `hello`, que es de tipo
      // String y tiene una función `resolve`...
      hello: {
        type: GraphQLString,
        // Hasta ahora no hablamos de las funciones `resolve`.
        // Básicamente son funciones que se ejecutan cuando el campo
        // al que pertenece es consultado. Si no se consulta, no se
        // ejecuta. El valor que devuelve la función es lo que devolverá
        // el campo. Estas funciones son centrales en lo que es la
        // potencia de GraphQL y las veremos en detalle más adelante.
        resolve: function () {
          return 'world'
        }
      }
    }
  })
})
```

## Juntando todo

Ya tenemos nuestro server y nuestro schema. Lo que tenemos que hacer ahora es que nuestro server utilice el schema para responder consultas GraphQL.

Volvemos a `index.js` y le hacemos un par de modificaciones. Tiene que quedar así:

```js
const express = require('express')
// Incluimos este middleware de `express`
const bodyParser = require('body-parser')
// ... y la función `graphql`
const { graphql } = require('graphql')
// Además importamos el schema que acabamos de definir
const schema = require('./schema')

const app = express()

// Este middleware nos va a facilitar el parsing del request
app.use(bodyParser.json())

// Le decimos a `express` que cuando llegue un request POST al endpoint /graphql
// utilice esta función para resolverlo. Nótese que la función es asincrónica.
app.post('/graphql', async function (req, res) {
  // Utilizamos la función `graphql` para ejecutar el query. El primer parámetro
  // es el schema y el segundo el query que viene en el request.
  const result = await graphql(schema, req.body.query)
  // Devolvemos el resultado del query (y lo formateamos para que el output sea
  // legible)
  res.send(JSON.stringify(result, null, 2))
})

app.listen(3000, function () {
  console.log('Our Node server is up and running on port 3000! Try http://localhost:3000/hello')
})
```

Volvemos a la terminal y escribimos `node index`.

Ahora nuestro server atiende consultas GraphQL, podemos hacerle una usando `curl`:

```
curl -XPOST -d '{"query": "{hello}"}' -H 'Content-Type: application/json' http://localhost:3000/graphql
```

Debería devolver esto:
```
{
  "data": {
    "hello": "world"
  }
}
```

Si así fue, ya puede poner en su currículum que sabe de GraphQL.

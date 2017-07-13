# Conectándose a una API externa

Vamos a suponer el caso en el que necesitamos _wrappear_ una API existente. Como dijimos en la introducción, GraphQL puede conectarse a prácticamente cualquier fuente de datos y, schema mediante, darle la posibilidad a un cliente de consultarlo.

Nuestro backend podría ser una combinación de una base de datos, archivos de texto, APIs REST... lo que se nos ocurra. El arte acá está en que toda esa información que yo puedo consultar desde múltiples orígenes y formatos debería poder representarla en un _schema_, es decir, en un árbol. Con lo cual tiene sentido que esos datos tengan algo que ver entre sí, conceptual y estructuralmente.

Dicho esto, vamos a empezar con algo sencillo. Hacker News publicó [una API](https://github.com/HackerNews/API) desde la que se puede consumir sus historias.
Esta API consiste en algunos endpoints HTTP, de los cuales mencionaré algunos.

## La API de Hacker News

### Stories

En `/v0/topstories.json` puedo consultar los "top stories" de Hacker News. Lo que me va a devolver este endpoint es un JSON parecido a este:

```json
[
  14754772,
  14757629,
  14752392,
  ...
]
```

(esto recortando el output, puede traer más de 300 items).

Cada uno de esos números representa el ID de un _item_. Cómo obtener el detalle de cada item lo explico a continuación.

### Items

En `/v0/item/{id}.json` puedo obtener un item (en el esquema de datos de HN una historia y un comentario son la misma cosa, un "item", pero cada item puede tener items hijos).
Este endpoint responderá con un JSON, que tiene esta pinta:

```json
{
  "by" : "tel",
  "descendants" : 16,
  "id" : 121003,
  "kids" : [ 121016, 121109, 121168 ],
  "score" : 25,
  "text" : "<i>or</i> HN: the Next Iteration<p>I get ...",
  "time" : 1203647620,
  "title" : "Ask HN: The Arc Effect",
  "type" : "story",
  "url" : ""
}
```

Nótese que `kids` es un array de IDs de otras historias, `by` es el ID del autor y `type` dice qué tipo de item es.

### Users

Por último, cada item (story, comment, etc.) tiene un autor, una persona que lo generó. La entidad que representa a esa persona es un `user` y se consulta en el endpoint `/v0/user/{id}.json` donde `id` es el ID del usuario, por ejemplo `tel` en el ejemplo de arriba.

La respuesta de ese endpoint tiene esta pinta:

```json
{
  "about" : "jspha.com &#x2F; @sdbo &#x2F; me@jspha.com &#x2F; joseph@reifyhealth.com<p>[ my public key: https:&#x2F;&#x2F;keybase.io&#x2F;tel; my proof: https:&#x2F;&#x2F;keybase.io&#x2F;tel&#x2F;sigs&#x2F;hy256UGUMMtc9NhfOsck4vuCiby6UYNLw7VXBj4fGR8 ]",
  "created" : 1187238300,
  "id" : "tel",
  "karma" : 9560,
  "submitted" : [ 14644912, 14628669, 14606196 ... ]
}
```

En el array `submitted` hay IDs de items. `created` tiene la fecha de creación en formato epoch.

## El cliente

Conocer la API que vamos a _wrappear_ es importante. Si esta es consistente, enseguida se nos va a ir ocurriendo cómo diseñar el schema, que es la pieza más importante del sistema que estamos creando.

En este caso, en una primera aproximación a la API de HN vimos que tenemos dos entidades importantes, que se relacionan entre sí: items y users. Los items pueden ser stories o comentarios. Los usuarios crean stories y además comentan stories de otros usuarios.

Lo que conviene antes de empezar a diseñar el schema es escribir un poco de código de plomería: necesitamos desde nuestra aplicación Node poder consultar la API de HN.
Esa consulta va a ser por HTTP, por lo tanto nos viene bien un cliente HTTP simple:

```
npm install --save request request-promise-native
```

Para mantener el boliche ordenado, vamos a crear un directorio `hnclient` y dentro un archivo `index.js`. Dentro de ese archivo escribiremos nuestros clientes:

```js
// hnclient/index.js
const request = require('request-promise-native')

const baseURL = 'https://hacker-news.firebaseio.com/v0'

module.exports.getItem = function (id) {
  return request.get(`${baseURL}/item/${id}.json`, { json: true })
}

module.exports.getTopStories = function () {
  return request.get(`${baseURL}/topstories.json`, { json: true })
}

module.exports.getUser = function (id) {
  return request.get(`${baseURL}/user/${id}.json`, { json: true })
}
```

Acá creé tres funciones que me van a ser de ayuda para consultar la API de HN. Vamos a arrancar con estas tres y si es necesario más adelante agregamos alguna más. Algo importante es que cada una de las funciones me devuelve una `Promise`.

Por otro lado, para probar rápidamente que las funciones andan bien, podemos crear un endpoint de prueba (también podríamos crear unit tests, lo recomiendo, pero para este proyecto nos alcanza con ver que no tenemos problemas conectándonos a la API).

```js
// index.js
//
// [ omito el resto del archivo por brevedad]

const { getTopStories, getItem, getUser } = require('./hnclient')

app.get('/test', async function (req, res, next) {
  try {
    // Como las funciones devuelven `Promise`s, tengo que anteponerles `await` a cada invocación.
    const stories = await getTopStories()
    // Tomo el ID de la primer story y obtengo todos sus datos
    const story = await getItem(stories[0])
    // y de esa story obtengo el autor y todos sus datos
    const author = await getUser(story.by)
    res.status(200).send({
      stories,
      story,
      author
    })
  } catch (e) {
    // Esto es un patrón de `express` que nos permite capturar un error, si hubiera, y mostrarlo en la respuesta
    next(e)
  }
})
```

Luego, reiniciando el server y conectándonos a `http://localhost:3000/test` deberíamos ver una respuesta en JSON (y no un error).

Si todo marcha bien, significa que nuestro código de plomería funciona y que tenemos conexión a la API que vamos a wrappear.

¿Qué sigue? Sí, adivinaron: crear el schema.

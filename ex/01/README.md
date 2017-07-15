# Introducción a GraphQL

GraphQL es un lenguaje y un _runtime_ para ejecutar consultas a orígenes de datos. Esos orígenes de datos pueden ser virtualmente cualquier cosa: bases de datos, APIs HTTP, archivos de texto, etc.

Las consultas se realizan usando el protocolo HTTP, es decir que GraphQL está diseñado para la comunicación entre aplicaciones Web o mobile nativas con sus APIs. Acá se verá una y otra vez un contrapunto con las APIs REST: es lógico, pues el caso de uso de ambos es prácticamente el mismo.

El lenguaje está estandarizado y [existen _runtimes_ en varias plataformas](http://graphql.org/code/), como Node, Ruby, Java y Go, entre otras. Nosotros en este taller vamos a usar [`graphql-js`](https://github.com/graphql/graphql-js), la librería hecha por Facebook para crear servidores GraphQL en Node.

## El lenguaje
Como mencioné antes, GraphQL es un lenguaje. Particularmente uno diseñado para consultar una estructura de datos que tiene pinta de árbol.

Veamos:

```graphql
{
  allStarships {
    totalCount
    starships {
      name
      id
    }
  }
}
```

Esto es una consulta. Acá estamos pidiendo una entidad que se llama `allStarships`, que sabemos que tiene _nodos hijos_ denominados `totalCount` y `starships`. A la vez `starships` tiene otros dos nodos hijos: `name` y `id`.

El servidor GraphQL va a responder con lo siguiente:

```json
{
  "data": {
    "allStarships": {
      "totalCount": 36,
      "starships": [
        {
          "name": "CR90 corvette",
          "id": "c3RhcnNoaXBzOjI="
        },
        {
          "name": "Star Destroyer",
          "id": "c3RhcnNoaXBzOjM="
        }
      ]
    }
  }
}
```

El servidor GraphQL devuelve un JSON que tiene una estructura similar a lo que fue la consulta, metido dentro de una propiedad `"data"`.

Si yo hubiera pedido más datos, el servidor me hubiera respondido con ellos. Y acá se ve una de las características importantes de GraphQL: sólo me trae los datos que le pido. Esto es algo bastante común en lenguajes de consulta a bases de datos como SQL, pero en consultas en el mundo de las aplicaciones Web no lo es tanto. En arquitecturas REST, una consulta a un endpoint siempre devuelve la misma estructura de datos, independientemente de si el cliente decide utilizar todos o algunos de ellos. Con lo cual usando GraphQL cada cliente puede controlar la cantidad de información que se transferirá.

## El _schema_

Uno podría preguntarse, entonces, ¿qué le puedo pedir a ese servidor GraphQL además de `starships`? Y de cada `starship`, ¿qué puedo saber además de su nombre y ID?

Desde ya que no es arbitraria la forma en la que puedo estructurar mis queries, así como no es arbitrario qué puedo poner en un `SELECT` de SQL. Los datos en el servidor están estructurados de una forma y las consultas que yo pueda hacer están determinadas por esa estructura. Dicha estructura es lo que llamamos _schema_.

Un _schema_ es una representación de los datos disponibles en mi servidor GraphQL. A diferencia de las bases de datos donde yo tengo tablas con campos y relaciones entre ellas, la estructura en GraphQL tiene forma de **grafo**. Cada uno de los nodos de ese grafo es algo que yo puedo consultar y tiene un **nombre**, **tipo** y una **descripción**, además de una relación con su nodo padre y sus hijos.

Afortunadamente, el _schema_ es algo que también le puedo consultar a un servidor GraphQL con lo que se llama [_introspection queries_](http://graphql.org/learn/introspection/). Como corolario, los servidores GraphQL son autodocumentados: con una simple consulta puedo obtener el schema completo, con el nombre de cada nodo, su tipo y descripción.

___

- [Siguiente](../02)

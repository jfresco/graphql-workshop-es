# _Caching_ y _batching_ con `dataloader`

Cuatro de los siete resolvers que escribimos llaman a `getItem`. Algunos lo hacen muchas veces. Entonces, resulta posible que en un mismo query se hagan llamadas iguales al backend, con lo cual, al ser una operación cara, estamos malgastando recursos.

Con otros resolvers puede pasar lo mismo. En principio no sabemos qué nos pueden consultar y algunas consultas pueden hacer que los resolvers se llamen muchas veces, y en ocasiones, con los mismos datos, con lo cual también estamos malgastando recursos ahí.

Una forma de solucionar este problema es agregando una capa de caching. Y acá es donde `dataloader` nos da una mano.

Para instalarlo, hay que correr esto en una Terminal:

```
npm install --save dataloader
```

`dataloader` tiene una API bastante simple: un método `load` y otro `loadMany`, donde se le pasan _keys_ que devuelven `Promise`s que resuelven a los valores que necesitamos. Cada loader que creamos debe wrappear una llamada al backend, que será cacheada durante el request.

Por ejemplo, para wrappear la llamada a `getItem`, la key debería ser el ID del item y lo que debería devolver es una `Promise` que resuelva en el `Item` que corresponda.

La forma de crear ese loader es la siguiente:

```js
const itemLoader = new DataLoader(ids => Promise.all(ids.map(id => getItem())))
```

Es decir, se llama al constructor de `DataLoader` pasándole un solo argumento, que es la función que será llamada por `load` y `loadMany` cuando le pasemos keys. Esa función recibirá un array de keys, aún cuando a la instancia se le llame a `load` y se le pida un solo ID.

Lo que devolverá es una sola `Promise`, que resolverá cuando todos los IDs hayan sido obtenidos.

Entonces ya podemos usar nuestro loader en el resolver:

```js
{
  // ...
  Query: {
    item (_, { id }) {
      return itemLoader.load(id)
    },
    // ...
  }
}
```

Ahora cada vez que se consulte `item`, se va a cachear el valor. Si ese `Item` vuelve a ser pedido en algún otro resolver, se usará la versión cacheada.

## Ejercicio

```js
/**
 * Devuelve todos los topstories, sin importar qué key se le pase
 */
const allTopStoriesLoader = new DataLoader(...)

/**
 * Devuelve los topstories paginados. Las keys son objetos con la forma { page, count }
 */
const topStoriesLoader = new DataLoader(...)

/**
 * Devuelve un usuario. Las keys son los IDs
 */
const userLoader = new DataLoader(...)
```

Escribir las funciones para los loaders planteados. Hacer las llamadas a los loaders en los resolvers que correspondan.

___

- [Siguiente](../06)
- [Código](src)

# cached-query

[![ci](https://github.com/FabienArcellier/cached-query/actions/workflows/main.yml/badge.svg)](https://github.com/FabienArcellier/cached-query/actions/workflows/main.yml) [![npm version](https://badge.fury.io/js/cached-query.svg)](https://badge.fury.io/js/cached-query)

powerful asynchronous data fetching management for vanillajs.

**This library is experimental**. Its API is likely to evolve between 2 versions. It covers one of my specific requirements.
I am not sure to maintain this library yet.

This library is inspired from :

* [React-query](https://tanstack.com/query/v4)
* [Apollo Graphql](https://www.apollographql.com/)

## Demo

* [Vanilla.js](https://fabienarcellier.github.io/cached-query/demo/vanilla/) / [[code](./demo/vanilla)]

## Motivation

I wanted to use a frontend library [Alpine.js](https://alpinejs.dev/), lighter than React or Vue.js, to make interactive interface.
I need a asynchronous state management module as [react-query](https://github.com/TanStack/query) to :

* declare query as independant code
* deduplicate REST requests if several widgets load the same data source
* update all widgets when the request is invalidated and run again
* regularly pull a data source and update all the widgets that use it
* mock REST requests easily to perform unit test
* process only the last request during cascading invalidations

As I couldn't find a library that match this requirement for vanillajs, I decide to implement `cached-query`

## Installation

### install in the browser

```html
<script src="https://unpkg.com/cached-query/dist/cached-query.min.js"></script>
```

### install with npm
```
npm install --save cached-query
```

## Code Example

the following examples can be played in the browser console when installing `cached-query` in the browser.

```javascript
preparedQuery("users", "https://randomuser.me/api/?seed=foobar&results=5")

function users() {
    useQuery("users", (data, loading, error, response) => {
        if (loading == false) {
            console.log(data.results)
        }
    })
}

function userByGender() {
    useQuery("users", (data, loading, error, response) => {
        if (loading == false) {
            results = {}
            for (key in data.results) {
                user = data.results[key]
                gender = user.gender
                if (!(gender in results)) {
                    results[gender] = [] 
                }
                results[gender].push(user)
                
            }
            
            // display the list in the dom element
            console.log(results)
        }
    })
}

users();
userByGender();

// run the query once, and execute the callback of users and userByFender.
invalidateQuery("users");
```

### Delayed query : Run the callback only after an invalidation has been performed

In some case, you have a query that is not ready. It requires an external argument that is not set yet.

```javascript
function users() {
    delayedQuery("users", (data, loading, error, response) => {
        if (loading == false) {
            console.log(data.results)
        }
    });
    
    users(); // nothing happens
    invalidateQuery("users");
}
```

### Recurring query : Run an api request every 5 seconds and refresh dependent widgets

```javascript
preparedQuery("users", "https://randomuser.me/api/?seed=foobar", {}, {interval: 5})

function users() {
    useQuery("users", (data, loading, error, response) => {
        if (loading == false) {
            console.log(data.results)
        }
    })
}

function userByGender() {
    useQuery("users", (data, loading, error) => {
        if (loading == false) {
            results = {}
            for (key in data.results) {
                user = data.results[key]
                gender = user.gender
                if (!(gender in results)) {
                    results[gender] = [] 
                }
                results[gender].push(user)
                
            }
            
            // display the list in the dom element
            console.log(results)
        }
    })
}

users();
userByGender();
```

### Mock query : Test your javascript code without calling your API

`cached-query` allows you to mock an external call in your automatic tests with the `mockQuery` method and 
bypass the request to the server by returning a pre-programmed response.

```javascript
preparedQuery("users", "https://randomuser.me/api/?seed=foobar&results=5")
mockQuery("users", {results: []})

function users() {
    useQuery("users", (data, loading, error, response) => {
        if (loading == false) {
            console.log(data.results)
        }
    })
}

/* use the mock instead of calling the api */
users();
```

### Forward parameter to fetch

The second argument of `preparedQuery` and `replaceQuery` contains the options for the fetch request.

```javascript
preparedQuery("users", "https://randomuser.me/api/?seed=foobar&results=5", {mode: 'cors'})

function users() {
    useQuery("users", (data, loading, error, response) => {
        if (loading == false) {
            console.log(data.results)
        }
    })
}

users();
```

### Trigger the callbacks for every invalidation

By default, `cached-query` only returns the result of the last invalidation when several successive invalidations have been executed. 
This behavior limits clipping by recovering incomplete data.

If you need to call the callbacks for all invalidations, use the `postponeInvalidation: false` option.

```javascript
preparedQuery("users", "https://randomuser.me/api/?seed=foobar&results=5", {}, {postponeInvalidation: false})

function users() {
    useQuery("users", (data, loading, error, response) => {
        if (loading == false) {
            console.log(data.results)
        }
    })
}

users();

// run the query once, and execute the callback of users and userByFender.
invalidateQuery("users");
```

### Change the behavior of an existing query

The `replaceQuery` method reconfigures an existing query. 
It is possible to make an existing query recurrent, for example to run it every 60 seconds.

```javascript
preparedQuery('users', "https://randomuser.me/api/?seed=foobar&results=5", {}, {});
replaceQuery('users', "https://randomuser.me/api/?seed=foobar&results=5", {}, {interval: 60});

function users() {
    useQuery("users", (data, loading, error, response) => {
        if (loading == false) {
            console.log(data.results)
        }
    })
}

users();
```

### Replace the default query engine, Fetch + json with Axios or Fetch + xml

To define a new engine, you must write a javascript function that takes a query object as a parameter.
An engine should always invoke the ``invokeSubscriptions`` function from the response it retrieves. 
This will trigger the execution of the subscriptions of this query.

The `replaceQueryDefaultEngine` function replaces the query engine for all queries.

```javascript
export function customAxiosEngine(query) {
    axios.get(query.url)
      .then(function (response) {
          invokeSubscriptions(query, response.data, null, response);
      })
      .catch(function (error) {
          invokeSubscriptions(query, null, error, null);
      })
}

replaceQueryDefaultEngine(customAxiosEngine)
```

``preparedQuery`` and ``replaceQuery`` accept also an ``engine`` option to specify 
a specific query engine for a specific query.

```javascript
preparedQuery('users', "https://randomuser.me/api/?seed=foobar&results=5", {}, {engine: customAxiosEngine});
```

``cached-query`` implements 2 engines that you can use for inspiration ``fetchJsonEngine`` and ``mockEngine``.

## The latest version

You can find the latest version to ...

```bash
git clone https://github.com/FabienArcellier/cached-query.git
```

### Tests

```javascript
npm test
```

### Contributing

If you propose hotfixes or new features, I will integrate them as a best effort.
As the library is experimental I would prefer discuss them on discord. [You can join me on it](https://discord.gg/nMn9YPRGSY).

## Contributors

* Fabien Arcellier

## License

MIT License

Copyright (c) 2022 Arcellier Fabien

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## References

# cached-query

powerful asynchronous data fetching management for vanillajs. 

**This library is experimental**. Its API is likely to evolve between 2 versions. It covers one of my specific requirements.
I am not sure to maintain this library yet.

This library is inspired from :

* [React-query](https://tanstack.com/query/v4)
* [Apollo Graphql](https://www.apollographql.com/)

## Motivation

I wanted to use a frontend library [Alpine.js](https://alpinejs.dev/), lighter than React or Vue.js, to make interactive interface.
I need a asynchronous state management module as [react-query](https://github.com/TanStack/query) to :

* declare query as independant code
* deduplicate REST requests if several widgets load the same data source
* update all widgets when the request is invalidated and run again
* regularly pull a data source and update all the widgets that use it (not implemented yet).
* mock REST requests easily to perform unit test

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
    useQuery("users", (data, loading, error) => {
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

// run the query once, and execute the callback of users and userByFender.
invalidateQuery("users");
```

### Run an api request every 60 seconds

```javascript
preparedQuery("users", "https://randomuser.me/api/?seed=foobar", {}, {interval: 60})

function users() {
    useQuery("users", (data, loading, error) => {
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

### Test your javascript code without calling your API

`cached-query` allows you to mock an external call in your automatic tests with the `mockQuery` method and 
bypass the request to the server by returning a pre-programmed response.

```javascript
preparedQuery("users", "https://randomuser.me/api/?seed=foobar&results=5")
mockQuery("users", {results: []})

function users() {
    useQuery("users", (data, loading, error) => {
        if (loading == false) {
            console.log(data.results)
        }
    })
}

/* use the mock instead of calling the api */
users();
```

## The latest version

You can find the latest version to ...

```bash
git clone https://github.com/FabienArcellier/cached-query.git
```

## Continuous integration

[soon]

### Tests

[soon]

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
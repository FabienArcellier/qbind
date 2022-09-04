# cached-query

**This library is experimental**. Its API is likely to evolve between 2 versions. It covers a need
immediate but I do not undertake to ensure its maintenance.

powerful asynchronous data fetching management for vanillajs. 

This library is inspired from :

* [React-query](https://tanstack.com/query/v4)
* [Apollo Graphql](https://www.apollographql.com/)

## Motivation

I wanted to use a frontend library [Alpine.js](https://alpinejs.dev/), lighter than React or Vue.js, to make interactive interface.

I was looking for an equivalent of [react-query](https://github.com/TanStack/query) to decouple data loading
from a remote API as query, deduplicate REST requests if several components load the same data source, update all components
when the request is invalidated, regularly pull a data source and update all the components that use it.

As I couldn't find a library for vanillajs, I implemented `cached-query`

## Installation

### in the browser

```html
<script src="https://unpkg.com/cached-query/dist/cached-query.min.js"></script>
```

### with npm
```
npm install --save @fabienarcellier/cached-query
```

## The latest version

You can find the latest version to ...

```bash
git clone https://github.com/FabienArcellier/cached-query.git
```

## Code Example

```javascript
preparedCquery("users", "https://randomuser.me/api/?seed=foobar&results=5")

function users() {
    cquery("users", (data, loading, error) => {
        if (loading == false) {
            console.log(data.results)
        }
    })
}

function user_by_gender() {
    cquery("users", (data, loading, error) => {
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
user_by_gender();

// run the query once, and execute the callback of users and user_by_gender.
invalidateCquery("users");
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
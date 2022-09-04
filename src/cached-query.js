export const cquery_cache = {};

export function preparedCquery(key, url, request_options = {}) {
    if (key in cquery_cache) {
        let query = cquery_cache[key];

        if (query.url !== url) {
            console.warn(`ignore the url: a query already exists with different url ${query.url}, you try to prepare for ${url}`);
        }
    }

    cquery_cache[key] = {
        callbacks: [],
        data: undefined,
        error: undefined,
        key: key,
        isLoading: false,
        mock: false,
        url: url,
        request_options: request_options
    };
}

export function cquery(key, callback) {
    const query = cquery_cache[key];

    if (query.data === undefined && query.isLoading === false && query.error === undefined) {
        _fetchFromQuery(query);

        query.callbacks.push(callback);
        callback(query.data, query.isLoading, query.error);
    } else {
        query.callbacks.push(callback);
        callback(query.data, query.isLoading, query.error);
    }
}

export function invalidateCquery(key) {
    const query = cquery_cache[key];
    if (query.data === undefined && query.isLoading === false) {
        return;
    }

    if (query.isLoading === false) {
        _fetchFromQuery(query);
    }
}

export function mockCquery(key, data, isLoading = false, error = undefined) {
    const query = cquery_cache[key];
    query.mock = true;
    query.data = data;
    query.isLoading = isLoading;
    query.error = error;
}

function _fetchFromQuery(query) {
    if (query.mock === true) {
        for (const _callback in query.callbacks) {
            query.callbacks[_callback](query.data, query.isLoading, query.error);
        }
        return;
    }

    query.data = undefined;
    query.isLoading = true;
    fetch(query.url, query.request_options)
        .then(res => res.json())
        .then(data => {
            query.isLoading = false;
            query.data = data;
            query.error = undefined;
            for (const _callback in query.callbacks) {
                query.callbacks[_callback](query.data, query.isLoading, query.error);
            }
        })
        .catch((error) => {
            query.isLoading = false;
            query.data = undefined;
            query.error = error;
            for (const _callback in query.callbacks) {
                query.callbacks[_callback](query.data, query.isLoading, query.error);
            }
      });
}
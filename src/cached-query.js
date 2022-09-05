export const cquery_cache = {};

/**
 * Prepare a new api request
 *
 * A prepared query is lazy.
 * It is not executed until the useQuery function has been called once with this query.
 *
 * @param key the key of the prepared query to replace
 * @param url the url of the request to replace
 * @param request_options the options of the request (see the options of the fetch method)
 */
export function preparedQuery(key, url, request_options = {}, options = {}) {
    if (key in cquery_cache) {
        let query = cquery_cache[key];

        if (query.url !== url) {
            console.warn(`ignore the url: a query already exists with different url ${query.url}, you try to prepare for ${url}`);
        }

        return;
    }

    let query = {
        callbacks: [],
        data: undefined,
        error: undefined,
        key: key,
        isLoading: false,
        mock: false,
        url: url,
        request_options: request_options,
        invalidationStop: undefined,
        invalidationInterval: undefined
    };

    if ('interval' in options) {
        _loopQuery(query, options.interval);
    }

    cquery_cache[key] = query;
}

/**
 * replaces the API call of an existing prepared request with a new url.
 *
 * @param key the key of the prepared query to replace
 * @param url the url of the request to replace
 * @param request_options the options of the request (see the options of the fetch method)
 */
export function replaceQuery(key, url, request_options = {}) {
    _assertQueryExists(key);

    let query = cquery_cache[key];
    query.url = url;
    query.request_options = request_options;
}

export function useQuery(key, callback) {
    _assertQueryExists(key);

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

/**
 * invalidates the data loaded by a request
 *
 * If the interval parameter is set, data for a request is
 * invalidated every X seconds.
 *
 * @param key the key of the prepared query
 * @param interval le nombre de seconde entre 2 invalidations
 */
export function invalidateQuery(key, interval = undefined) {
    _assertQueryExists(key);

    const query = cquery_cache[key];

    if (query.data === undefined && query.isLoading === false) {
        return;
    }

    if (query.isLoading === false) {
        _fetchFromQuery(query);
    }
}

export function mockQuery(key, data, isLoading = false, error = undefined) {
    _assertQueryExists(key);

    const query = cquery_cache[key];
    query.mock = true;
    query.data = data;
    query.isLoading = isLoading;
    query.error = error;
}

function _assertQueryExists(key) {
    if (!(key in cquery_cache)) {
        const queries = Object.keys(cquery_cache);
        throw `The query '${key}' does not exists - prepared queries : [${queries}]`;
    }
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

function _loopQuery(query, interval) {
    query.invalidationStop = setTimeout(() => _loopQuery(query, interval), interval * 1000);
    _fetchFromQuery(query);
}
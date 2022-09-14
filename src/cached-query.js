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
 * @param options the options for prepared query as interval
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
        response: undefined,
        mock: false,
        url: url,
        request_options: request_options,
        invalidationStop: undefined,
        invalidationInterval: undefined,
        invalidationCounter: 0, // this attribute allow to post-pone callback when there is several successive invalidation
        postponeInvalidation: options.postponeInvalidation || true // if invalidation happens during an invalidation, it wait for the last query to invoke the callbacks
    };

    if ('mock' in options) {
        query.mock = true;
        query.data = options.mock.data;
        query.isLoading = options.mock.isLoading;
        query.error = options.mock.error;
        query.response = options.mock.response;
    }

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
        callback(query.data, query.isLoading, query.error, query.response);
    } else {
        query.callbacks.push(callback);
        callback(query.data, query.isLoading, query.error, query.response);
    }
}

/**
 * invalidates the data loaded by a request
 *
 * If the interval parameter is set, data for a request is
 * invalidated every X seconds.
 *
 * @param key the key of the prepared query
 */
export function invalidateQuery(key) {
    _assertQueryExists(key);

    const query = cquery_cache[key];
    query.invalidationCounter += 1;

    if (query.data === undefined && query.isLoading === false) {
        return;
    }

    _fetchFromQuery(query, true);
}

export function mockQuery(key, data, isLoading = false, error = undefined, response = undefined) {
    _assertQueryExists(key);

    const query = cquery_cache[key];
    query.mock = true;
    query.data = data;
    query.isLoading = isLoading;
    query.error = error;
    query.response = response;
}

function _assertQueryExists(key) {
    if (!(key in cquery_cache)) {
        const queries = Object.keys(cquery_cache);
        throw `The query '${key}' does not exists - prepared queries : [${queries}]`;
    }
}

function _fetchFromQuery(query, invalidation = false) {
    if (query.mock === true) {
        for (const _callback in query.callbacks) {
            query.callbacks[_callback](query.data, query.isLoading, query.error, query.response);
        }
        return;
    }

    query.data = undefined;
    query.isLoading = true;
    query.response = undefined;
    query.error = undefined;

    for (const _callback in query.callbacks) {
        query.callbacks[_callback](query.data, query.isLoading, query.error, query.response);
    }

    fetch(query.url, query.request_options)
        .then(res => {
            query.response = res;
            return res.json();
        })
        .then(data => {
            if (invalidation === true && query.invalidationCounter > 0) {
                query.invalidationCounter -= 1;
            }

            if (query.invalidationCounter === 0 || query.postponeInvalidation === false) {
                query.isLoading = false;
                query.data = data;
                query.error = undefined;
                for (const _callback in query.callbacks) {
                    query.callbacks[_callback](query.data, query.isLoading, query.error, query.response);
                }
            }
        })
        .catch((error) => {
            query.isLoading = false;
            query.data = undefined;
            query.error = error;
            for (const _callback in query.callbacks) {
                query.callbacks[_callback](query.data, query.isLoading, query.error, query.response);
            }
      });
}

function _loopQuery(query, interval) {
    query.invalidationStop = setTimeout(() => _loopQuery(query, interval), interval * 1000);
    _fetchFromQuery(query);
}
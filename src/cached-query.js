export const cquery_cache = {};

export function clearQueries() {
    for (var member in cquery_cache) {
        delete cquery_cache[member];
    }
}

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
        data: null,
        error: null,
        key: key,
        isLoading: false,
        response: null,
        mock: false,
        url: url,
        request_options: request_options,
        invalidationStop: null,
        invalidationInterval: null,
        invalidationCounter: 0, // this attribute allow to post-pone callback when there is several successive invalidation
        postponeInvalidation: options.postponeInvalidation || true, // if invalidation happens during an invalidation, it wait for the last query to invoke the callbacks
        engine: options.engine || null
    };

    if ('mock' in options) {
        _mockQuery(query, options);
    }

    if ('interval' in options) {
        _loopQuery(query, options.interval);
    }

    cquery_cache[key] = query;
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
    if (query.data === null && query.isLoading === true) {
        return;
    }

    _fetchFromQuery(query, true);
}

/**
 * This method is used in the query engine to update subscriptions when data is loaded
 * or the query fails
 *
 * @param query
 * @param data
 * @param error
 * @param response
 */
export function invokeSubscriptions(query, data, error, response) {
    query.invalidationCounter -= 1;

    if (query.invalidationCounter === 0 || query.postponeInvalidation === false) {
        query.isLoading = false;
        query.data = data;
        query.error = error;
        query.response = response;
        for (const _callback in query.callbacks) {
            query.callbacks[_callback](query.data, query.isLoading, query.error, query.response);
        }
    }
}

export function fetchJsonEngine(query) {
    let response = null;
    fetch(query.url, query.request_options)
        .then(res => {
            response = res;
            return res.json();
        })
        .then(data => {
            invokeSubscriptions(query, data, null, response);
        })
        .catch((error) => {
            invokeSubscriptions(query, null, error, response);
        });
}

export function mockEngine(query) {
    invokeSubscriptions(query, query.data, query.error, query.response);
}

export function mockQuery(key, data, isLoading = false, error = null, response = null) {
    _assertQueryExists(key);

    const query = cquery_cache[key];
    query.mock = true;
    query.data = data;
    query.isLoading = isLoading;
    query.error = error;
    query.response = response;
}

/**
 * replaces the API call of an existing prepared request with a new url.
 *
 * @param key the key of the prepared query to replace
 * @param url the url of the request to replace
 * @param request_options the options of the request (see the options of the fetch method)
 * @param options the options for prepared query as interval
 */
export function replaceQuery(key, url, request_options = {}, options = {}) {
    _assertQueryExists(key);

    let query = cquery_cache[key];
    query.url = url;
    query.request_options = request_options;
    query.engine = options.engine || _defaultEngine

    if ('mock' in options) {
        _mockQuery(query, options);
    } else {
        _mockQueryStop(query);
    }

    if ('interval' in options) {
        _loopQuery(query, options.interval);
    } else {
        _loopQueryStop(query);
    }
}

export function replaceQueryDefaultEngine(engine) {
    _defaultEngine = engine;
}

/**
 * resets the internal state of the library to be able to run automatic tests.
 *
 * This function is not part of the public API.
 */
export function resetContext() {
    _defaultEngine = fetchJsonEngine;
    clearQueries();
}

export function useQuery(key, callback) {
    _assertQueryExists(key);

    const query = cquery_cache[key];
    if (query.data === null && query.isLoading === false && query.error === null) {
        query.callbacks.push(callback);
        _fetchFromQuery(query);

        // callback(query.data, query.isLoading, query.error, query.response);
    } else {
        query.callbacks.push(callback);
        callback(query.data, query.isLoading, query.error, query.response);
    }
}

/* Internal attributes */

let _defaultEngine = fetchJsonEngine;

/* Private functions */

function _assertQueryExists(key) {
    if (!(key in cquery_cache)) {
        const queries = Object.keys(cquery_cache);
        throw `The query '${key}' does not exists - prepared queries : [${queries}]`;
    }
}

function _fetchFromQuery(query, invalidation = false) {

    /* When the request is replaced by a mock, the loading step is skipped.
     * As the mock is already stored in the data, isLoading, response and error attributes,
     * it should not overload them.
     */
    query.invalidationCounter += 1;
    if (query.mock !== true) {
        query.data = null;
        query.isLoading = true;
        query.response = null;
        query.error = null;

        for (const _callback in query.callbacks) {
            query.callbacks[_callback](query.data, query.isLoading, query.error, query.response);
        }
    }

    if (query.mock === true) {
        mockEngine(query);
    } else if (query.engine !== null) {
        query.engine(query);
    } else {
        _defaultEngine(query);
    }
}

function _loopQuery(query, interval) {
    _loopQueryStop(query);

    query.invalidationStop = setTimeout(() => _loopQuery(query, interval), interval * 1000);
    _fetchFromQuery(query);
}

function _loopQueryStop(query) {
    if (query.invalidationStop) {
        clearTimeout(query.invalidationStop);
    }
}

function _mockQuery(query, options) {
    query.mock = true;
    query.data = options.mock.data;
    query.isLoading = options.mock.isLoading;
    query.error = options.mock.error;
    query.response = options.mock.response;
}

function _mockQueryStop(query) {
    query.mock = false;
    query.data = null;
    query.isLoading = false;
    query.error = null;
    query.response = null;
}

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!*****************************!*\
  !*** ./src/cached-query.js ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clearQueries": () => (/* binding */ clearQueries),
/* harmony export */   "cquery_cache": () => (/* binding */ cquery_cache),
/* harmony export */   "fetchJsonEngine": () => (/* binding */ fetchJsonEngine),
/* harmony export */   "invalidateQuery": () => (/* binding */ invalidateQuery),
/* harmony export */   "invokeSubscriptions": () => (/* binding */ invokeSubscriptions),
/* harmony export */   "mockEngine": () => (/* binding */ mockEngine),
/* harmony export */   "mockQuery": () => (/* binding */ mockQuery),
/* harmony export */   "preparedQuery": () => (/* binding */ preparedQuery),
/* harmony export */   "replaceQuery": () => (/* binding */ replaceQuery),
/* harmony export */   "replaceQueryDefaultEngine": () => (/* binding */ replaceQueryDefaultEngine),
/* harmony export */   "resetContext": () => (/* binding */ resetContext),
/* harmony export */   "useQuery": () => (/* binding */ useQuery)
/* harmony export */ });
const cquery_cache = {};

function clearQueries() {
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
function preparedQuery(key, url, request_options = {}, options = {}) {
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
function invalidateQuery(key) {
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
function invokeSubscriptions(query, data, error, response) {
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

function fetchJsonEngine(query) {
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

function mockEngine(query) {
    invokeSubscriptions(query, query.data, query.error, query.response);
}

function mockQuery(key, data, isLoading = false, error = null, response = null) {
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
function replaceQuery(key, url, request_options = {}, options = {}) {
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

function replaceQueryDefaultEngine(engine) {
    _defaultEngine = engine;
}

/**
 * resets the internal state of the library to be able to run automatic tests.
 *
 * This function is not part of the public API.
 */
function resetContext() {
    _defaultEngine = fetchJsonEngine;
    clearQueries();
}

function useQuery(key, callback) {
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

var __webpack_export_target__ = window;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
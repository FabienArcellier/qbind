var assert = require('assert');
const {preparedQuery, invalidateQuery, useQuery, replaceQuery, invokeSubscriptions, resetContext, replaceQueryDefaultEngine} = require("../src/cached-query");
const sinon = require('sinon');

describe('cached-query', function () {
    let clock;
    beforeEach(function () {
        resetContext();
        clock = sinon.useFakeTimers();
    });

    afterEach(function () {
        clock.restore();
    });

    describe('preparedQuery', function () {

        it('should overload the query engine with a new engine for a specific query', function () {
            /* Given */
            const engine = (query) => {
                invokeSubscriptions(query, {'hello': 'world'}, null, null);
            };

            preparedQuery('users', 'https://yolo', {}, {engine: engine});
            // preparedQuery('users', 'https://yolo', {}, {});

            /* When */
            let containsHello = false
            useQuery('users', (data, isLoading, error, response) => {
                if (data !== null) {
                    containsHello = "hello" in data
                }
            });

            /* Then */
            assert.equal(containsHello, true);
        });

        it('should run a new query on recurring basis (every 5 seconds)', function () {
            /* Given */
            preparedQuery('users', "https://yolo", {}, {interval: 5, mock: {data: {"hello": "world"}}});

            let count = 0;
            useQuery("users", (data) => {
                count += 1;
            });

            assert.equal(count, 1);
            /* When */
            clock.tick(6000);

            /* Then */
            assert.equal(count, 2);
        });
    });

    describe('replaceQuery', function () {

        it('should overload the query engine with a new engine for a specific query', function () {
            /* Given */
            const engine = (query) => {
                invokeSubscriptions(query, {'hello': 'world'}, null, null);
            };
            preparedQuery('users', 'https://yolo', {}, {mock: {data: {}}});

            let containsHello = false;
            useQuery('users', (data, isLoading, error, response) => {
                if (data !== null) {
                    containsHello = "hello" in data;
                }
            });

            /* When */
            replaceQuery('users', "https://yolo", {}, {engine: engine});
            invalidateQuery('users');

            /* Then */
            assert.equal(containsHello, true);
        });

        it('should run an existing query on recurring basis', function () {
            /* Given */
            preparedQuery('users', "https://yolo", {}, {mock: {data: {"hello": "world"}}});

            let count = 0;
            useQuery("users", (data) => {
                count += 1;
            });

            assert.equal(count, 1);
            clock.tick(6000);
            assert.equal(count, 1);

            /* When */
            replaceQuery('users', "https://yolo", {}, {interval: 5, mock: {data: {"hello": "world"}}});

            /* Then */
            assert.equal(count, 2);
            clock.tick(6000);
            assert.equal(count, 3);

        });
        it('should slow down a query (from every 5 seconds to every 1 minute)', function () {
            /* Given */
            preparedQuery('users', "https://yolo", {}, {interval: 5, mock: {data: {"hello": "world"}}});

            let count = 0;
            useQuery("users", (data) => {
                count += 1;
            });

            assert.equal(count, 1);
            clock.tick(27000);
            assert.equal(count, 6);

            /* When */
            replaceQuery('users', "https://yolo", {}, {interval: 60, mock: {data: {"hello": "world"}}});

            /* Then */
            assert.equal(count, 7);
            clock.tick(130000);
            assert.equal(count, 9);

        });
        it('should stop a query that stop on recurring basis', function () {
            /* Given */
            preparedQuery('users', "https://yolo", {}, {interval: 5, mock: {data: {"hello": "world"}}});

            let count = 0;
            useQuery("users", (data) => {
                count += 1;
            });

            assert.equal(count, 1);
            clock.tick(27000);
            assert.equal(count, 6);

            /* When */
            replaceQuery('users', "https://yolo", {}, {});

            /* Then */
            assert.equal(count, 6);
            clock.tick(130000);
            assert.equal(count, 6);
        });
    });

    describe('replaceQueryDefaultEngine', function () {
        it('should overload the query engine with a new engine for all queries', () => {
            /* Given */
            const engine = (query) => {
                invokeSubscriptions(query, {'hello': 'world'}, null, null);
            };
            replaceQueryDefaultEngine(engine);

            preparedQuery('users', 'https://yolo', {}, {});

            /* When */
            let containsHello = false;
            useQuery('users', (data, isLoading, error, response) => {
                if (data !== null) {
                    containsHello = "hello" in data;
                }
            });

            /* Then */
            assert.equal(containsHello, true);
        });
    });
});

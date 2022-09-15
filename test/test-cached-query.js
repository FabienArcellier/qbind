var assert = require('assert');
const {preparedQuery, mockQuery, cquery_cache, useQuery, replaceQuery, clearQueries} = require("../src/cached-query");
const sinon = require('sinon');

describe('cached-query', function () {
  let clock;
  beforeEach(function () {
      clearQueries()
      clock = sinon.useFakeTimers();
   });

  afterEach(function () {
      clock.restore();
  });

  describe('preparedQuery', function () {
    it('should run on recurring basis (every 5 seconds)', function () {
      /* Given */
      preparedQuery('users', "https://yolo", {}, {interval: 5, mock: { data: {"hello": "world"} }});

      let count = 0;
      useQuery("users", (data) =>{
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
      it('should run on recurring basis', function () {
        /* Given */
        preparedQuery('users', "https://yolo", {}, {mock: { data: {"hello": "world"} }});

        let count = 0;
        useQuery("users", (data) =>{
          count += 1;
        });

        assert.equal(count, 1);
        clock.tick(6000);
        assert.equal(count, 1);

        /* When */
        replaceQuery('users', "https://yolo", {}, {interval: 5, mock: { data: {"hello": "world"} }});

        /* Then */
        assert.equal(count, 2);
        clock.tick(6000);
        assert.equal(count, 3);

      });
      it('should slow down a query (from every 5 seconds to every 1 minute)', function () {
        /* Given */
        preparedQuery('users', "https://yolo", {}, {interval: 5, mock: { data: {"hello": "world"} }});

        let count = 0;
        useQuery("users", (data) =>{
          count += 1;
        });

        assert.equal(count, 1);
        clock.tick(27000);
        assert.equal(count, 6);

        /* When */
        replaceQuery('users', "https://yolo", {}, {interval: 60, mock: { data: {"hello": "world"} }});

        /* Then */
        assert.equal(count, 7);
        clock.tick(130000);
        assert.equal(count, 9);

      });
      it('should stop a query that stop on recurring basis', function () {
        /* Given */
        preparedQuery('users', "https://yolo", {}, {interval: 5, mock: { data: {"hello": "world"} }});

        let count = 0;
        useQuery("users", (data) =>{
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
});
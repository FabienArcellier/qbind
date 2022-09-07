var assert = require('assert');
const {preparedQuery, mockQuery, cquery_cache, useQuery} = require("../src/cached-query");
const sinon = require('sinon');

describe('cached-query', function () {
  let clock;
  beforeEach(function () {
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
});
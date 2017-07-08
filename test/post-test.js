const assert = require('chai').assert;
const request = require('request');
const app = require('../server');

describe('POST /api/v1/group', done => {
  before(done => {
    this.port = 9876;
    this.server = app.listen(this.port, (error, result) => {
      if (error) { done(error); }
      done();
    });
    this.request = request.defaults({
      baseUrl: 'http://localhost:9876/api/v1'
    })
  });

  after(() => {
    this.server.close();
  });

  const collection = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const options = {
    body: {
      collection: collection
    },
    json: true,
    url: '/group'
  };

  describe('Basic functionality', () => {
    it('Accepts an options hash containing the collection to be grouped', done => {
      this.request.post(options, (error, response, body) => {
        if (error) { done(error); }
        assert.ok(response);
        done();
      });
    });

    it('Responds with status 200', done => {
      this.request.post(options, (error, response, body) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('Responds with groups and history', done => {
      this.request.post(options, (error, response, body) => {
        if (error) { done(error); }
        assert.isObject(body);
        assert.isObject(body.history);
        assert.isArray(body.groups);
        done();
      });
    });

    it('Includes all of the original elements', done => {
      this.request.post(options, (error, response, body) => {
        if (error) { done(error); }
        const eles = [].concat.apply([], body.groups).sort();
        assert.deepEqual(collection, eles);
        done();
      });
    });
  })
});

const assert = require('chai').assert;
const request = require('request');
const app = require('../server');

describe('Groopr', () => {
  before(done => {
    this.port = 9876;
    console.log(this);
    this.server = app.listen(this.port, (error, result) => {
      if (error) { done(error); }
      done();
    });
    this.request = request.defaults({
      baseUrl: 'http://localhost:9876/'
    })
  });

  after(() => {
    this.server.close();
  });

  describe('Server', () => {
    it('Exists', () => {
      assert.ok(app);
    });

    it('Is named Groopr', () => {
      assert.equal('Groopr', app.locals.title);
    });
  });

  describe('GET /groop', done => {
    const collection = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const options = {
      body: {
        collection: collection
      },
      json: true,
      url: '/groop'
    };

    let response = null;

    it('Accepts an options hash containing the collection to be grouped', done => {
      this.request.get(options, (error, response, body) => {
        if (error) { done(error); }
        assert.ok(response);
        done();
      });
    });

    it('Responds with status 200', done => {
      this.request.get(options, (error, response, body) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('Responds with an object containing an array of groups', done => {
      this.request.get(options, (error, response, body) => {
        if (error) { done(error); }
        assert.isObject(response.body);
        assert.isArray(body.groups);
        done();
      });
    });

    it('Includes all of the original elements', done => {
      this.request.get(options, (error, response, body) => {
        if (error) { done(error); }
        const eles = [].concat.apply([], body.groups);
        assert.deepEqual(collection, eles);
        done();
      });
    });
  });
});

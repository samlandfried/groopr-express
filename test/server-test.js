const assert = require('chai').assert;
const request = require('request');
const app = require('../server');

describe('Groopr', () => {
  before(done => {
    this.port = 9876;
    this.request = request.defaults({
      baseUrl: 'http://localhost:9876/'
    })
    this.server = app.listen(this.port, (error, result) => {
      if (error) { done(error); }
      done();
    });
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

    it('Has a root path', done => {
      this.request('/', (request, response, body) => {
        assert.include(body, 'Hello, world!');
        done();
      });
    });
  });
});

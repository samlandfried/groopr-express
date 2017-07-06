const assert = require('chai').assert;
const request = require('request');
const app = require('../server');

describe('Groopr', () => {
  before(done => {
    this.port = 9876;
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
});

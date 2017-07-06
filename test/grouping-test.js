const assert = require('chai').assert;
const expect = require('chai').expect;
const request = require('request');
const Grouper = require('../grouper');

describe('Grouping', done => {
  it('Requires an options object', () => {
    const good = new Grouper({ collection: [] });

    assert.ok(good);
    expect(function() {new Grouper()}).to.throw('Options object containing a collection required');
  });

  it('Requires a collection property containing an array', () => {
    expect(function() {new Grouper({})}).to.throw('Array to be grouped must be present on collection property of options object. Something like this: {collection: []}');
  })
});

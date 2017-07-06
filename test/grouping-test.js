const assert = require('chai').assert;
const request = require('request');
const Grouper = require('../grouper');

describe('Grouping', done => {
  it('Requires an options hash with a collection property containing an array', () => {
    const good = new Grouper({ collection: [] });
    const noArray = new Grouper({ collection: 'Nope'});
    const noObject = new Grouper();

    assert.ok(good);
    assert.notOk(noArray);
    assert.noObject();
  });
});

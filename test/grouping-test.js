const assert = require('chai').assert;
const expect = require('chai').expect;
const request = require('request');
const Grouper = require('../grouper');

describe('Grouping', done => {
  describe('Initialization', () => {
    it('Requires an options object', () => {
      const good = new Grouper({ collection: [] });

      assert.ok(good);
      expect(function() { new Grouper() }).to.throw('Options object containing a collection required');
    });

    it('Requires a collection property containing an array', () => {
      expect(function() { new Grouper({}) }).to.throw('Array to be grouped must be present on collection property of options object. Something like this: {collection: []}');
    });
  });

  describe('Default behavior (No options hash provided)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const grouper = new Grouper({ collection: input })
    const response = grouper.makeGroups();
    const groups = response.groups;
    const history = response.history;

    it('Makes groups', () => {
      assert.ok(groups);
    });

    it('Returns an object containing an array containing arrays', () => {
      assert.isObject(response);
      assert.isArray(groups);
      groups.forEach(group => {
        assert.isArray(group);
      });
    });

    it('Returns all the original elements grouped', () => {
      const groupedEles = groups.reduce((memo, group) => {
        memo.concat(group);
        return memo;
      }, []);

      assert.deepEqual(groupedEles.sort(), input);
    });

    it('Returns pairs, except for the odd man out, which makes a group of 3', () => {
      const groupLengthFrequencies = groups.reduce((memo, group) => {
        memo[group.length] = memo[group.length] + 1 || 1;
        return memo;
      });

      assert.equal(group['2'], 4);
      assert.equal(group['3'], 1);
    });

    it("Returns a random configuration each time it's called", () => {
      const groups2 = grouper.makeGroups();

      assert.notDeepEqual(groups, groups2); // This test will fail 1 / 9! times
    });

    it('Returns a history object', () => {
      assert.isObject(history);
    })
  });
});

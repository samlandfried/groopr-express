const assert = require('chai').assert;
const expect = require('chai').expect;
const request = require('request');
const Grouper = require('../lib/grouper');

describe('Grouping', done => {
  describe('Unit tests', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const grouper = new Grouper({ collection: input });

    it('#randomize', () => {
      const randomized = Grouper.randomize(input);

      assert.notEqual(randomized, input);
      assert.notDeepEqual(randomized, input);
      assert.deepEqual(randomized.sort(), input);
    });

    it('#populateGroups(defaults to 2)', () => {
      const paired = grouper.populateGroups(input);

      assert.notEqual(paired, input);
      assert.equal(paired.length, 5);
      assert.deepEqual(paired[0], [1, 2]);
      assert.deepEqual(paired[4], [9]);
    });

    it('#populateGroups(input, 3)', () => {
      const paired = grouper.populateGroups(input, 3);

      assert.notEqual(paired, input);
      assert.equal(paired.length, 3);
      assert.deepEqual(paired[0], [1, 2, 3]);
      assert.deepEqual(paired[2], [7, 8, 9]);
    });

    it('#findOddMembers', () => {
      const grouped = grouper.populateGroups(input);
      const split = Grouper.findOddMembers(grouped);
      const groups = split.groups;
      const oddMembers = split.oddMembers;

      assert.isObject(split);
      assert.isArray(groups);
      assert.isArray(oddMembers);
      assert.equal(oddMembers[0], 9);
      assert.equal(groups.length, 4);
    })

    it('#makeBiggerGroupsWithOddMembers', () => {
      const grouped = grouper.populateGroups(input);
      const regrouped = Grouper.findOddMembers(grouped);
      const reassigned = Grouper.makeBiggerGroupsWithOddMembers(regrouped);

      assert.isArray(reassigned);
      assert.equal(reassigned.length, 4);
      assert.equal(reassigned[0].length, 3);
      assert.include(reassigned[0], 9);
    });

    it('#makeGroups', () => {
      const groups = grouper.makeGroups();

      assert.isArray(groups);
      groups.forEach(group => {
        assert.isArray(group);
        assert.isAbove(group.length, 1);
      });
    });

    it('#makeHistory(with no previous history)', () => {
      const groups = grouper.makeGroups();
      const member1 = groups[0][0];
      const member2 = groups[0][1];
      const member3 = groups[0][2];

      const hist = grouper.makeHistory(groups);
      const hist1 = hist[member1];
      const hist2 = hist[member2];
      const hist3 = hist[member3];

      assert.isObject(hist);

      assert.equal(hist1[member2], 1);
      assert.equal(hist1[member3], 1);
      assert.equal(hist2[member1], 1);
      assert.equal(hist2[member3], 1);
      assert.equal(hist3[member1], 1);
      assert.equal(hist3[member2], 1);

      assert.isUndefined(hist1[member1]);
      assert.isUndefined(hist2[member2]);
      assert.isUndefined(hist3[member3]);
    });

    it('#group', () => {
      const response = grouper.group();
      const groups = response.groups;
      const history = response.history;

      assert.isObject(response);
      assert.isObject(history);
      assert.isArray(groups);
    });
  });

  describe('Initialization', () => {
    it('Requires an options object', () => {
      const good = new Grouper({ collection: [1, 2, 3] });

      assert.ok(good);
      expect(function() { new Grouper() }).to.throw('Options object containing a collection required');
    });

    it('Requires a collection property containing an array', () => {
      expect(function() { new Grouper({}) }).to.throw('Array to be grouped must be present on collection property of options object. Something like this: {collection: []}');
    });
  });

  describe('Edge cases', () => {
    let input = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    it("Won't make groups of size 1", () => {
      const options = { size: 1 };
      const initSettings = {
        collection: input,
        options: options
      };

      expect(() => new Grouper(initSettings)).to.throw(RangeError);
    });

    it("Won't allow group sizes > collection size", () => {
      const options = { size: 10 };
      const initSettings = {
        collection: input,
        options: options
      };

      expect(() => new Grouper(initSettings)).to.throw(RangeError);
    });

    it("Can group any datatype", () => {
      const variedInput = [
        null,
        true,
        { greeting: 'hi!' },
        ['i', 'heard', 'you', 'like', 'arrays'],
        function() {
          throw new Error('This should never be thrown')
        },
        'Just a string, friend!',
        22
      ];

      expect(() => {
        const g = new Grouper({ collection: variedInput });
        g.group();
      }).to.not.throw();
    });

    it("Recommended grouping strategy without history", () => {
      input = [1, 2, 0];
      const options = {groupingStrategy: 'recommended'}
      const grouper = new Grouper({collection: input, options: options})

      expect(() => grouper.group()).to.not.throw();
    });
  });

  describe('Default behavior (No options hash provided)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const grouper = new Grouper({ collection: input });
    const response = grouper.group();
    const groups = response.groups;
    const history = response.history;

    it('Returns an object containing an array containing arrays', () => {
      assert.isObject(response);
      assert.isArray(groups);
      groups.forEach(group => {
        assert.isArray(group);
      });
    });

    it('Returns all the original elements grouped', () => {
      const groupedEles = groups.reduce((memo, group) => {
        return memo.concat(group);
      }, []);

      assert.deepEqual(groupedEles.sort(), input);
    });

    it('Returns pairs, except for the odd man out, which makes a group of 3', () => {
      const groupLengthFrequencies = groups.reduce((memo, group) => {
        memo[group.length] = memo[group.length] + 1 || 1;
        return memo;
      }, {});

      assert.equal(groupLengthFrequencies['2'], 3);
      assert.equal(groupLengthFrequencies['3'], 1);
    });

    it("Returns a random configuration each time it's called", () => {
      const groups2 = grouper.group();

      assert.notDeepEqual(groups, groups2); // This test will fail 1 / 9! times
    });
  });

  describe('Options selected', () => {
    it('Can vary group size', () => {
      const input = {
        options: { size: 4 },
        collection: [1, 2, 3, 4, 5, 6, 7, 8]
      }
      const grouper = new Grouper(input);
      const groups = grouper.group().groups;

      assert.equal(groups.length, 2)
      assert.equal(groups[0].length, 4)
      assert.equal(groups[1].length, 4)
    });

    it('Can make smaller groups', () => {
      const input = {
        collection: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        options: {
          oddMemberStrategy: 'small',
          size: 4
        }
      };

      const grouper = new Grouper(input);
      const groups = grouper.group().groups;


      assert.equal(groups.length, 4);
      assert.equal(groups[0].length, 3);
      assert.equal(groups[1].length, 3);
      assert.equal(groups[2].length, 3);
      assert.equal(groups[3].length, 4);
    });

    it('Can skip making history', () => {
      const input = {
        collection: [1, 2, 3],
        options: { skipHistory: true }
      };

      const grouper = new Grouper(input);
      const hist = grouper.group().history;

      assert.equal(hist, 'History recording and reporting was skipped with the skipHistory option.');
    });
  });

  describe('History', () => {
    it('Expands its history', () => {
      const originalHistory = {
        '1': { '4': 1 },
        '2': { '5': 1, '8': 1 },
        '3': { '7': 1 },
        '4': { '1': 1 },
        '5': { '2': 1, '8': 1 },
        '6': { '9': 1 },
        '7': { '3': 1 },
        '8': { '2': 1, '5': 1 },
        '9': { '6': 1 }
      };
      const input = {
        collection: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        history: originalHistory
      };

      const grouper = new Grouper(input);
      const modifiedHistory = grouper.group().history;
      let totalPairings = 0;

      for (member in modifiedHistory) {
        for (partner in modifiedHistory[member]) {
          totalPairings += modifiedHistory[member][partner];
        }
      }

      assert.equal(totalPairings, 24)
    });

    describe('Strategies', () => {
      it('Groups randomly by default', () => {
        const originalHistory = {
          '1': { '4': 1 },
          '2': { '5': 1, '8': 1 },
          '3': { '7': 1 },
          '4': { '1': 1 },
          '5': { '2': 1, '8': 1 },
          '6': { '9': 1 },
          '7': { '3': 1 },
          '8': { '2': 1, '5': 1 },
          '9': { '6': 1 }
        };
        const input = {
          collection: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          history: originalHistory
        };

        const grouper = new Grouper(input);
        let highestPairingCount = 1;
        let newHist = 1;
        for (let i = 0; i < 100; i++) {
          newHist = grouper.group().history;

          for (member in newHist) {
            for (partner in newHist[member]) {
              if (newHist[member][partner] > highestPairingCount)
                highestPairingCount = newHist[member][partner];
            }
          }
        }

        expect(highestPairingCount).to.be.above(28)
      });

      it("Can group by 'recommended' strategy", () => {
        const originalHistory = {
          '1': { '4': 1 },
          '2': { '5': 1, '8': 1 },
          '3': { '7': 1 },
          '4': { '1': 1 },
          '5': { '2': 1, '8': 1 },
          '6': { '9': 1 },
          '7': { '3': 1 },
          '8': { '2': 1, '5': 1 },
          '9': { '6': 1 }
        };
        const input = {
          collection: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          history: originalHistory
        };

        input.options = { groupingStrategy: 'recommended' };
        const grouper = new Grouper(input);
        let highestPairingCount = 1;
        let newHist = 1;
        for (let i = 0; i < 100; i++) {
          newHist = grouper.group().history;

          for (member in newHist) {
            for (partner in newHist[member]) {
              if (newHist[member][partner] > highestPairingCount)
                highestPairingCount = newHist[member][partner];
            }
          }
        }

        expect(highestPairingCount).to.be.below(28)
      });

      xit("Can group by 'perfect' strategy", () => {
        const originalHistory = {
          '1': { '4': 1 },
          '2': { '5': 1, '8': 1 },
          '3': { '7': 1 },
          '4': { '1': 1 },
          '5': { '2': 1, '8': 1 },
          '6': { '9': 1 },
          '7': { '3': 1 },
          '8': { '2': 1, '5': 1 },
          '9': { '6': 1 }
        };
        const input = {
          collection: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          history: originalHistory
        };

        input.options = { groupingStrategy: 'perfect' };
        const grouper = new Grouper(input);
        let highestPairingCount = 1;
        let newHist = 1;
        for (let i = 0; i < 100; i++) {
          newHist = grouper.group().history;

          for (member in newHist) {
            for (partner in newHist[member]) {
              if (newHist[member][partner] > highestPairingCount)
                highestPairingCount = newHist[member][partner];
            }
          }
        }

        assert.equal(highestPairingCount, 19);
      });
    });
  });
});

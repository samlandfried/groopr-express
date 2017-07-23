class Grouper {
  constructor(options) {
    if (typeof options !== 'object') {
      throw new Error('Options object containing a collection required');
    } else if (!Array.isArray(options.collection)) {
      console.log(options)
      throw new Error('Array to be grouped must be present on collection property of options object. Something like this: {collection: []}.');
    }

    const defaults = {
      skipHistory: false,
      size: 2,
      oddMemberStrategy: 'large',
      groupingStrategy: 'random'
    }

    const settings = Object.assign(defaults, options.options);

    if (settings.size < 2)
      throw new RangeError('Group size must be more than 1');
    if (settings.size > options.collection.length)
      throw new RangeError('Group size must be less than collection size');

    this.collection = options.collection;
    this.history = options.history || {};
    this.options = settings;
  }

  group() {
    const groups = this.makeGroups();
    const history = this.options.skipHistory ?
      'History recording and reporting was skipped with the skipHistory option.' :
      this.makeHistory(groups);

    return {
      groups: groups,
      history: history
    };
  }

  makeGroups() {
    const settings = this.options;
    const shuffled = Grouper.randomize(this.collection);
    const grouped = this.populateGroups(shuffled, settings.size);
    const oddMembersGrouped = Grouper.mixInOddMembers(grouped, settings.oddMemberStrategy);

    return oddMembersGrouped;
  }

  makeHistory(groups) {
    return groups.reduce((history, group) => {
      group.forEach((outerMember, outerI) => {
        this.history[outerMember] ?
          history[outerMember] = this.history[outerMember] :
          history[outerMember] = new Object();
        group.forEach((innerMember, innerI) => {
          if (outerI !== innerI) {
            history[outerMember][innerMember] = history[outerMember][innerMember] || 0;
            history[outerMember][innerMember]++;
          }
        });
      });
      return history;
    }, new Object());
  }


  populateGroups(arr, size = 2) {
    if (this.options.groupingStrategy === 'random')
      return makeRandomGroups(arr, size);
    if (this.options.groupingStrategy === 'recommended')
      return makeRecommendedGroups(arr, size, this.history);
    if (this.options.groupingStrategy === 'perfect')
      return makePerfectGroups(arr, size, this.history);
  }

  static mixInOddMembers(groups, strategy) {
    const groupsAndStragglers = Grouper.findOddMembers(groups);
    return strategy === 'small' ?
      Grouper.makeSmallerGroupsWithOddMembers(groupsAndStragglers) :
      Grouper.makeBiggerGroupsWithOddMembers(groupsAndStragglers);
  }

  static makeBiggerGroupsWithOddMembers(splitMembers) {
    const oddMembers = splitMembers.oddMembers;
    const groups = splitMembers.groups;

    let i = 0;

    while (oddMembers.length > 0) {
      groups[i].push(oddMembers.shift());
      i < (groups.length - 1) ? i++ : i = 0;
    }

    return groups;
  }

  static makeSmallerGroupsWithOddMembers(splitMembers) {
    const groups = splitMembers.groups;
    const groupSize = groups[0].length;
    const oddMembers = splitMembers.oddMembers;
    const newGroup = [].concat(oddMembers);

    let group = 0;

    while (newGroup.length < groupSize && group < groups.length) {
      newGroup.push(groups[group].shift());
      group++;
    }

    groups.push(newGroup);

    return groups;
  }

  static findOddMembers(arr) {
    if (!arr[0])
      throw new Error('You need groups!');
    const groupSize = arr[0].length;

    return arr.reduce((memo, group) => {
      if (group.length === groupSize) {
        memo.groups.push(group);
      } else {
        group.forEach(member => {
          memo.oddMembers.push(member);
        })
      }

      return memo;
    }, { groups: [], oddMembers: [] });
  }

  static randomize(arr) {
    return arr.slice().sort(() => .5 - Math.random());
  }
}

const makeRandomGroups = (arr, size) => {
  return arr.reduce((memo, ele) => {
    let last = memo.length - 1;
    if (!memo[last] || memo[last].length === size) {
      memo.push(new Array());
      last++;
    }
    memo[last].push(ele);
    return memo;
  }, new Array());
};

const makeRecommendedGroups = (arr, size, hist) => {
  const ungrouped = arr.slice();
  const groups = [];

  while (ungrouped.length > 0) {
    let currentEle = ungrouped.shift();
    let group = [currentEle];

    while (group.length < size && ungrouped.length > 0) {
      const fittest = ungrouped.pluckFittest(group, hist);
      group.push(fittest);
    }
    groups.push(group);
  }
  return groups;
};

const makePerfectGroups = (arr, size, hist) => {
  // Consider every possible arrangement
  throw new Error('I should probably make this');


  // Find arrangement with lowest overall fitness score
};

Array.prototype.pluckFittest = function(group, hist) {
  let score;
  let fittestI;

  const fittest = this.reduce((fittest, ele, index) => {
    const eleScore = hist.getFitnessScore(group.concat(ele));

    if (!score || eleScore < score) {
      score = eleScore;
      fittestI = index;
      return ele;
    } else {
      return fittest;
    }
  });

  this.splice(fittestI, 1);
  return fittest;
};

Object.prototype.getFitnessScore = function(group) {
  return group.reduce((score, member, memberIndex) => {
    group.forEach((partner, partnerIndex) => {
      if (partnerIndex !== memberIndex) {
        let groupedInPastCount = 0;
        groupedInPastCount = this[member] ?
          this[member][partner] || 0 :
          0;
        score += Math.pow((groupedInPastCount + 1), 2);
      }
    })
    return score;
  }, 0);
};

Object.defineProperty(Object.prototype, 'getFitnessScore', {
  enumerable: false
});

module.exports = Grouper;

const pry = require('pryjs')

class Grouper {
  constructor(options) {
    if (typeof options !== 'object') {
      throw new Error('Options object containing a collection required');
    } else if (!Array.isArray(options.collection)) {
      throw new Error('Array to be grouped must be present on collection property of options object. Something like this: {collection: []}');
    }

    const defaults = {
      skipHistory: false,
      size: 2,
      oddMemberStrategy: 'large',
      groupingStrategy: 'random'
    }

    const settings = Object.assign(defaults, options.options);

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
    const grouped = Grouper.populateGroups(shuffled, settings.size);
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
            history[outerMember][innerMember] ++;
          }
        });
      });
      return history;
    }, new Object());
  }


  static populateGroups(arr, size = 2) {
    return arr.reduce((memo, ele) => {
      let last = memo.length - 1;
      if (!memo[last] || memo[last].length === size) {
        memo.push(new Array());
        last++;
      }
      memo[last].push(ele);
      return memo;
    }, []);
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

module.exports = Grouper;

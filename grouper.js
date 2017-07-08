class Grouper {
  constructor(options) {
    if (typeof options !== 'object') {
      throw new Error('Options object containing a collection required');
    } else if (!Array.isArray(options.collection)) {
      throw new Error('Array to be grouped must be present on collection property of options object. Something like this: {collection: []}');
    }

    this.collection = options.collection;
    this.options = options.options;
  }

  group() {
    const groups = this.makeGroups();
    return {
      groups: groups,
      history: Grouper.makeHistory(groups)
    };
  }

  makeGroups() {
    let size;
    if (this.options) {
      size = this.options.size;
    }

    const shuffled = Grouper.randomize(this.collection);
    const grouped = size ?
      Grouper.populateGroups(shuffled, size) :
      Grouper.populateGroups(shuffled);
    const oddMemberGrouped = Grouper.makeBiggerGroupsWithOddMembers(grouped);

    return oddMemberGrouped;
  }

  static makeHistory(groups) {
    return groups.reduce((history, group) => {
      group.forEach((outerMember, outerI) => {
        history[outerMember] = new Object();
        group.forEach((innerMember, innerI) => {
          if (outerI !== innerI) {
            if (!history[outerMember][innerMember])
              history[outerMember][innerMember] = 0;
            history[outerMember][innerMember]++;
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

  static makeBiggerGroupsWithOddMembers(arr) {
    const groupsAndStragglers = this.findOddMembers(arr);
    const oddMembers = groupsAndStragglers.oddMembers;
    const groups = groupsAndStragglers.groups;

    let i = 0;

    while (oddMembers.length > 0) {
      groups[i].push(oddMembers.shift());
      i < (groups.length - 1) ? i++ : i = 0;
    }

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

Array.prototype.randomize = function(arr) {
  return arr.sort((a, b) => 0.5 - Math.random());
}

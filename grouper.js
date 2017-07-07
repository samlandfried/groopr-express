class Grouper {
  constructor(options) {
    if (typeof options !== 'object') {
      throw new Error('Options object containing a collection required');
    } else if (!Array.isArray(options.collection)) {
      throw new Error('Array to be grouped must be present on collection property of options object. Something like this: {collection: []}');
    }

    this.collection = options.collection;
  }

  makeGroups() {
    const shuffled = this.randomize(this.collection);
    const paired = this.pair(shuffled);
    const oddMemberGrouped = this.oddMembersMakeGroupsBigger(paired);

    return { groups: oddMemberGrouped, history: {} };
  }

  randomize(arr) {
    return arr.sort((a, b) => 0.5 - Math.random());
  }

  pair(arr) {
    return arr.reduce((memo, ele) => {
      let last = memo.length - 1;
      if (!memo[last] || memo[last].length === 2 ) {
        memo.push(new Array());
        last ++;
      }
      memo[last].push(ele);
      return memo;
    }, []);
  }

  oddMembersMakeGroupsBigger(arr) {
    const groupsAndStragglers = this.findOddMembers(arr);
  }

  findOddMembers() {

  }
}

module.exports = Grouper;
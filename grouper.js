class Grouper {
  constructor(options) {
    if (typeof options !== 'object') {
      throw new Error('Options object containing a collection required');
    } else if (!Array.isArray(options.collection)) {
      throw new Error('Array to be grouped must be present on collection property of options object. Something like this: {collection: []}');
    }
  }
}
module.exports = Grouper;
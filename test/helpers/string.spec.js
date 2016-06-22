require('../setup')
const StringHelper = require('../../helpers/string');

describe('String', () => {

  describe('#countNumberOfLines', () => {

    it('should correctly count number of lines when string is empty', () => {
      const result = StringHelper.countNumberOfLines('');
      expect(result).to.equal(0);
    });

    it('should correctly count number of lines when string is not empty', () => {
      const result = StringHelper.countNumberOfLines('xxx');
      expect(result).to.equal(1);
    });

    it('should correctly count number of lines when string contains new lines', () => {
      const result = StringHelper.countNumberOfLines('x\nx\nx');
      expect(result).to.equal(3);
    });

  });

});

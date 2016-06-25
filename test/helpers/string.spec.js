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

  describe('#parseEnv', () => {

    it('should return empty string when argument is undefined', () => {
      const result = StringHelper.parseEnv();
      expect(result).to.be.undefined;
    });

    it('should return parsed string when argument is valid env list', () => {
      const result = StringHelper.parseEnv('env1=one env2=two');
      expect(result).to.deep.equal({
        'variables[env1]': 'one',
        'variables[env2]': 'two'
      });
    });


  });

});

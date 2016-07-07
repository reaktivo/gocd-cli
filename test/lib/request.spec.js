const Request = require('../../lib/request');

describe('Request', () => {

  it('should return request method', () => {
    const options = {
      session: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
      endpoint: 'SOME_ENDPOINT',
    }

    const result = Request.call(stub, options);
    expect(result).to.be.a('function');
  });

  xit('should throw error when session is not specified', () => {
    const options = {
      endpoint: 'SOME_ENDPOINT',
    }

    const fn = () => Request.call(stub, options);
    expect(fn).to.throw(Error);
  });

});

const Request = require('../../lib/request');

xdescribe('Request', () => {

  describe('#constructor', () => {

    it('should parse session argument from options', () => {
      const sandbox = sinon.sandbox();
      const stub = {
        get: sinon.stub(),
        parseSessionId: sinon.stub()
      }

      const options = {
        session: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
        endpoint: 'SOME_ENDPOINT'
      }

      const result = Request.call(stub, options);
      expect(stub.parseSessionId).to.have.been.calledWith(options.session);
    });

    it('should create request property with default values', () => {


    });

  });

});

require('../setup')
const Logs = require('../../commands/logs');

describe('Logs', () => {

  describe('#normalizeOptions', () => {

    it('should save options to instance', () => {
      const stub = {};
      Logs.prototype.normalizeOptions.call(stub, {stage: 'a', startLineNumber: 10, interval: 2000});
      expect(stub.stage).to.equal('a');
      expect(stub.startLineNumber).to.equal(10);
      expect(stub.interval).to.equal(2000);
    });

    it('should create options when not included in options object', () => {
      const stub = {};
      Logs.prototype.normalizeOptions.call(stub, {});
      expect(stub.startLineNumber).to.be.a('number');
      expect(stub.startLineNumber).to.equal(0);
      expect(stub.interval).to.be.a('number');
      expect(stub.interval).to.be.above(0);
    });

    it('should resolve with correct promise', (done) => {
      const stub = {};
      const options = { startLineNumber: 1, interval: 1000 };
      const result = Logs.prototype.normalizeOptions.call(stub, options);
      expect(result).to.eventually.contain.keys('startLineNumber', 'interval').notify(done);
    });

  });

  describe('#loadHistory', () => {

    it('should request url with pipeline option', (done) => {
      const stub = {
        request: {
          get: sinon.stub().returns(Promise.resolve("{\"a\":1}"))
        }
      };
      const options = { pipeline: 'PIPELINE' };
      const result = Logs.prototype.loadHistory.call(stub, options);
      expect(stub.request.get).to.have.been.calledWith('/api/pipelines/PIPELINE/history');
      expect(result).to.eventually.deep.equal({a:1}).notify(done);
    });

  });

  describe('#parseHistory', () => {

    it('should resolve with pipeline and stage information', () => {
      const stub = {
        stage: 'MY_STAGE',
        findStage: sinon.spy((stages, stageName) => Promise.resolve({
          name: 'STAGE_NAME',
          counter: 'STAGE_COUNTER',
          jobs: [{name: 'JOB_NAME'}]
        }))
      };

      const options = {
        pipelines: [{
          name: 'PIPELINE_NAME',
          label: 'PIPELINE_LABEL',
          stages: []
        }]
      };

      const result = Logs.prototype.parseHistory.call(stub, options);
      expect(stub.findStage).to.have.been.calledWith(options.pipelines[0].stages, 'MY_STAGE');
      expect(result).to.eventually.deep.equal({
        pipeline: 'PIPELINE_NAME',
        pipelineLabel: 'PIPELINE_LABEL',
        stage: 'STAGE_NAME',
        stageCounter: 'STAGE_COUNTER',
        jobName: 'JOB_NAME'
      });
    });

    it('should reject promise', (done) => {
      const stub = {};
      const options = {};
      const fn = Logs.prototype.parseHistory.call(stub, options);
      expect(fn).to.eventually.be.rejected.notify(done);
    });

  });

  describe('#log', () => {

    let clock;
    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    it('should call request with url built from params', () => {

      const now = Date.now();

      const stub = {
        startLineNumber: 0,
        handleLog: sinon.stub(),
        request: {
          get: sinon.stub().returns(Promise.resolve('x'))
        }
      };

      const options = {
        pipeline: 'a',
        pipelineLabel: 'b',
        stage: 'c',
        stageCounter: 'd',
        jobName: 'e'
      };

      Logs.prototype.log.call(stub, options);
      expect(stub.request.get).to.have.been.calledWith({
        url: 'files/a/b/c/d/e/cruise-output/console.log',
        qs: {
          ms: `${now}_2`,
          startLineNumber: 0
        }
      });

    });

    it('should call handleLog after request promise resolves', (done) => {
      const stub = {
        startLineNumber: 0,
        handleLog: sinon.stub(),
        request: {
          get: sinon.stub().returns(Promise.resolve('x'))
        }
      };
      const options = {};
      Logs.prototype.log.call(stub, options).then(() => {
        expect(stub.handleLog).to.have.been.calledWith('x');
        done();
      });
    });

  });

  describe('#handleLog', () => {

    it('should write text to stdout', () => {
      const stub = {
        _stdoutWrite: sinon.stub(),
        checkJobStatus: sinon.stub(),
        startLineNumber: 0
      }

      const result = Logs.prototype.handleLog.call(stub, 'xxx');
      expect(stub._stdoutWrite).to.have.been.calledWith('xxx');
    });

    it('should update startLineNumber based on passed data', () => {
      const stub = {
        _stdoutWrite: sinon.stub(),
        checkJobStatus: sinon.stub(),
        startLineNumber: 0
      }

      const result = Logs.prototype.handleLog.call(stub, 'x\nx\nx');
      expect(stub.startLineNumber).to.equal(3);
    });

    it('should check job status after writing to stdout', () => {
      const stub = {
        _stdoutWrite: sinon.stub(),
        checkJobStatus: sinon.stub(),
        startLineNumber: 0
      }

      const result = Logs.prototype.handleLog.call(stub, 'x');
      expect(stub.checkJobStatus).to.have.been.calledOnce;
    });

  });

  describe('#findStage', () => {
    it('should return a promise', () => {
      const result = Logs.prototype.findStage([]);
      expect(result.then).to.be.a('function');
    });

    it('should resolve to stage with passed stageName', (done) => {
      const stages = [{name: 'A_STAGE'}, {name: 'MY_STAGE'}];

      const result = Logs.prototype.findStage(stages, 'MY_STAGE');
      expect(result).to.eventually.deep.equal(stages[1]).notify(done);
    });

    it('should reject when passed a name of stage that doesn\'t exist', (done) => {
      const stages = [{name: 'A_STAGE'}, {name: 'MY_STAGE'}];

      const result = Logs.prototype.findStage(stages, 'NON_EXISTING_STAGE');
      expect(result).to.eventually.be.rejectedWith(Error).notify(done);
    });

    it('should reject when passed stages length is 0', (done) => {
      const result = Logs.prototype.findStage([]);
      expect(result).to.eventually.be.rejectedWith(Error).notify(done);
    });

    it('should resolve with first stage when it\'s the only one available', (done) => {
      const stages = [{name: 'MY_STAGE'}];
      const result = Logs.prototype.findStage(stages);
      expect(result).to.eventually.deep.equal(stages[0]).notify(done);
    });

    it('should inquire the user to select stage when there\'s more than one option', () => {
      const stub = {
        inquire: sinon.stub().returns(Promise.resolve())
      }

      const stages = [{name: 'A_STAGE'}, {name: 'MY_STAGE'}];
      const result = Logs.prototype.findStage.call(stub, stages);
      expect(stub.inquire).to.have.been.calledOnce;
    });

    xit('should inquire and resolve with user selected stage', (done) => {
      sinon.stub(Logs.prototype, 'inquire', Promise.resolve('MY_STAGE'));
      sinon.spy(Logs.prototype, 'findStage');

      const stages = [{name: 'A_STAGE'}, {name: 'MY_STAGE'}];
      const result = Logs.prototype.findStage.call(stub, stages);
      expect(result).to.eventually.deep.equal(stages[1]).notify(done);
    });


  });

});

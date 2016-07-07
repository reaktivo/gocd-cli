const proxyquire = require('proxyquire');
let requestResolveTo = Promise.resolve();
const stdout = { write: sinon.stub(), rawWrite: sinon.stub() };
const Logs = proxyquire('../../commands/logs', {
  '../lib/arg': { pipeline: sinon.stub() },
  '../lib/inquire': { inquire: sinon.stub() },
  '../lib/request': options => requestOptions => requestResolveTo,
  '../helpers/stdout': stdout,
});

describe('Logs', () => {

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#run', () => {

    it('should eventually call log', (done) => {
      const options = {
        endpoint: '',
        pipeline: '',
        session: ''
      };
      const stub = {
        requireOption: (opts) => Promise.resolve(opts),
        normalizeOptions: (opts) => Promise.resolve(opts),
        loadHistory: (opts) => Promise.resolve(opts),
        parseHistory: (opts) => Promise.resolve(opts),
        pollJobStatus: (opts) => Promise.resolve(opts),
        log: (opts) => Promise.resolve(opts)
      }
      const result = Logs.prototype.run.call(stub, options);
      expect(result).to.eventually.be.fulfilled.notify(done);

    });

  });

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
        parseHistory: (options) => Promise.resolve(options)
      };
      requestResolveTo = Promise.resolve({
        body: {
          pipelines: 'PIPELINES'
        }
      });
      const options = {};
      const result = Logs.prototype.loadHistory.call(stub, options);
      expect(result).to.eventually.deep.equal({pipelines: 'PIPELINES'}).notify(done);
    });

  });

  describe('#parseHistory', () => {

    it('should resolve with pipeline and stage information', () => {

      const options = {
        pipelines: [{
          name: 'PIPELINE_NAME',
          label: 'PIPELINE_LABEL',
          stages: []
        }]
      };

      const stub = {
        stage: 'MY_STAGE',
        _findPipeline: sinon.stub().returns(options.pipelines[0]),
        findStage: sinon.spy((stages, stageName) => Promise.resolve({
          name: 'STAGE_NAME',
          counter: 'STAGE_COUNTER',
          jobs: [{name: 'JOB_NAME'}]
        }))
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

  });

  describe('#checkJobStatus', () => {

    it('should write status when job is finished', () => {
      stdout.write = sinon.stub();
      const stub = {
        jobStatus: {
          is_completed: 'true',
          result: 'Passed'
        },
        _exit: sinon.stub()
      }
      Logs.prototype.checkJobStatus.call(stub);
      expect(stdout.write).to.have.been.called;
    });

    it('should not write status when job is not finished', () => {
      const stub = {
        jobStatus: {
          is_completed: 'false',
          result: 'Unknown'
        },
        stdout: {
          write: sinon.stub(),
          rawWrite: sinon.stub()
        },
        _exit: sinon.stub()
      }
      Logs.prototype.checkJobStatus.call(stub);
      expect(stub.stdout.write).to.not.have.been.called;
    });

    it('should exit program with error status code when job did not succeed', () => {
      const stub = {
        jobStatus: {
          is_completed: 'true',
          result: 'Failed'
        },
        stdout: {
          write: sinon.stub(),
          rawWrite: sinon.stub()
        },
        _exit: sinon.stub()
      }
      Logs.prototype.checkJobStatus.call(stub);
      expect(stub._exit).to.have.been.calledWith(1);
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

    xit('should call request with url built from params', () => {

      requestResolveTo = Promise.resolve({
        body: 'BODY'
      });
      const now = Date.now();

      const stub = {
        startLineNumber: 0,
        handleLog: sinon.stub()
      };

      const options = {
        pipeline: 'a',
        pipelineLabel: 'b',
        stage: 'c',
        stageCounter: 'd',
        jobName: 'e'
      };

      Logs.prototype.log.call(stub, options);
      expect(stub.handleLog).to.eventually.equal('BODY')

    });

    xit('should call handleLog after request promise resolves', (done) => {
      const stub = {
        startLineNumber: 0,
        handleLog: sinon.stub(),
        request: sinon.stub().returns(Promise.resolve({ body: 'x' }))
      };
      const options = {};
      Logs.prototype.log.call(stub, options).then(() => {
        expect(stub.handleLog).to.have.been.calledWith('x');
        done();
      });
    });

  });

  describe('#handleLog', () => {

    xit('should write text to stdout', () => {
      const stub = {
        stdout: {
          write: sinon.stub(),
          rawWrite: sinon.stub()
        },
        checkJobStatus: sinon.stub(),
        startLineNumber: 0
      }

      const result = Logs.prototype.handleLog.call(stub, 'xxx');
      expect(stub.stdout.rawWrite).to.have.been.calledWith('xxx');
    });

    it('should update startLineNumber based on passed data', () => {
      const stub = {
        stdout: {
          write: sinon.stub(),
          rawWrite: sinon.stub()
        },
        checkJobStatus: sinon.stub(),
        startLineNumber: 0
      }

      const result = Logs.prototype.handleLog.call(stub, 'x\nx\nx');
      expect(stub.startLineNumber).to.equal(3);
    });

    it('should check job status after writing to stdout', () => {
      const stub = {
        stdout: {
          write: sinon.stub(),
          rawWrite: sinon.stub()
        },
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

    xit('should inquire the user to select stage when there\'s more than one option', () => {
      const stub = {
        inquire: sinon.stub().returns(Promise.resolve())
      }

      const stages = [{name: 'A_STAGE'}, {name: 'MY_STAGE'}];
      const result = Logs.prototype.findStage.call(stub, stages);
      expect(stub.inquire).to.have.been.calledOnce;
    });

    xit('should inquire and resolve with user selected stage', (done) => {
      const stages = [{name: 'A_STAGE'}, {name: 'MY_STAGE'}];
      const stub = {
        findStage: Logs.prototype.findStage,
        inquire: sinon.stub().returns(Promise.resolve('MY_STAGE'))
      };

      const result = stub.findStage(stages);
      expect(result).to.eventually.deep.equal(stages[1]).notify(done);
    });


  });

});

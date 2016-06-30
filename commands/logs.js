const { countNumberOfLines, toBool } = require('../helpers/string');
const { inquire } = require('../lib/inquire');
const chalk = require('chalk');
const Request = require('../lib/request');
const arg = require('../lib/arg');
const stdout = require('../helpers/stdout');
const extend = Object.assign.bind(Object);

class Logs {

  constructor(options) {
    this.run(options);
  }

  run(options) {
    return Promise.resolve(options)
      .then(options => this.normalizeOptions(options))
      .then(options => arg.pipeline(options))
      .then(options => this.loadHistory(options))
      .then(options => {
        this.pollJobStatus(options);
        this.log(options);
      });
  }

  normalizeOptions(options) {
    this.stage = options.stage;
    this.startLineNumber = parseInt(options.startLineNumber || 0, 10);
    this.interval = parseInt(options.interval || 1000, 10);

    return Promise.resolve(options);
  }

  loadHistory(options) {
    const url = `/api/pipelines/${options.pipeline}/history`;
    return Request(options)({ url, json: true })
      .then(response => this.parseHistory(
        extend(options, { pipelines: response.body.pipelines })
      ));
  }

  _findPipeline(pipelines) {
    if (!pipelines || !pipelines.length){
      throw new Error('No pipelines available');
    }

    return pipelines[0];
  }

  parseHistory(options) {
    const pipeline = this._findPipeline(options.pipelines);
    return this.findStage(pipeline.stages, this.stage)
      .then(stage => extend(options, {
        pipeline: pipeline.name,
        pipelineLabel: pipeline.label,
        stage: stage.name,
        stageCounter: stage.counter,
        jobName: stage.jobs[0].name,
        jobId: stage.jobs[0].id
      }));
  }

  pollJobStatus(options) {
    Request(options)({
      json: true,
      url: 'jobStatus.json',
      qs: {
        pipelineName: options.pipeline,
        stageName: options.stage,
        jobId: options.jobId
      }
    })
    .then(response => {
      /**
       * The idea of keepking more than the last building_info
       * response is to be able to compare when it changes
       */
      this.previousJobStatus = this.jobStatus;
      this.jobStatus = response.body[0].building_info;
    });

    this.jobStatusPoller = setTimeout(() => this.pollJobStatus(arguments[0]), this.interval);
  }

  checkJobStatus() {
    if (!this.jobStatus) {
      return;
    }

    const { is_completed, result } = this.jobStatus;
    const isSuccess = (result === 'Passed')
    const colorize =  isSuccess ? chalk.bold.green : chalk.bold.red;

    if (toBool(is_completed)) {
      clearTimeout(this.logPoller);
      clearTimeout(this.jobStatusPoller);
      stdout.write([
        chalk.bold.underline.cyan('\nJob status'),
        `Result: ${colorize(result)}`
      ]);
      isSuccess || this._exit(1);
    }

    // jobStatus.agent_uuid === null when agent has not been assigned

  }

  log(options) {
    const url = [
      'files',
      options.pipeline,
      options.pipelineLabel,
      options.stage,
      options.stageCounter,
      options.jobName,
      'cruise-output',
      'console.log'
    ].join('/');

    const qs = {
      ms: `${Date.now()}_2`,
      startLineNumber: this.startLineNumber
    }

    return Request(options)({ url, qs })
      .then(response => {
        this.logPoller = setTimeout(() => this.log(options), this.interval);
        return response;
      })
      .then(({ body }) => this.handleLog(body));
  }

  handleLog(body) {
    stdout.rawWrite(body);
    this.startLineNumber += countNumberOfLines(body);
    this.checkJobStatus();
  }

  findStage(stages, stageName) {
    return new Promise((resolve, reject) => {
      if (stageName) {
        const stage = stages.find(stage => stage.name === stageName);
        if (!stage) {
          throw new Error(`No stage by that name: ${stageName}`);
        };

        return resolve(stage);
      }

      if (stages.length === 0) {
        throw new Error('No stages available');
      }

      if (stages.length === 1) {
        return resolve(stages[0]);
      }

      return inquire('stage', stages.map(stage => stage.name))
        .then(stageName => resolve(
          this.findStage(stages, stageName))
        );
    });
  }

  _exit(code) {
    process.exit(code);
  }
}

module.exports = Logs;

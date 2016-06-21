module.exports = (options) => {
  const inquire = require('../lib/inquire')(options);
  const { request } = require('../lib/request')(options);
  const lodash = require('lodash');
  const chalk = require('chalk');
  const pretty = require('pretty-js');
  const extend = lodash.extend;
  const find = lodash.find;
  const map = lodash.map;

  options.startLineNumber = parseInt(options.startLineNumber || 0, 10);
  options.interval = parseInt(options.interval || 1000, 10);

  run();

  function run() {
    loadHistory()
      .then(parseHistory)
      .then(log)
      .catch(err => { throw new Error(err) });
  }

  function loadHistory() {
    return request(`/api/pipelines/${options.pipeline}/history`)
      .then(body => JSON.parse(body));
  }

  function parseHistory(json) {
    return new Promise((resolve, reject) => {
      if (!json.pipelines || !json.pipelines.length){
        throw new Error('No pipelines available');
      }

      const pipeline = json.pipelines.shift();
      return findStage(pipeline.stages, options.stage)
        .then(stage => {
          resolve(extend(options, {
            pipelineLabel: pipeline.label,
            stageCounter: stage.counter,
            stage: stage.name,
            jobName: stage.jobs[0].name
          }));
        });
    });
  }

  function log(options) {
    // files/Les.Miserables/92/build/1/build/cruise-output/console.log
    // files/Les.Miserables/94//1/build/cruise-output/console.log
    const url = [
      'files',
      options.pipeline, // Les.Miserables
      options.pipelineLabel, // 92
      options.stage, // build
      options.stageCounter, // 1
      options.jobName, // build
      'cruise-output',
      'console.log'
    ].join('/');

    return request({
      url,
      qs: {
        ms: `${Date.now()}_2`,
        startLineNumber: options.startLineNumber
      }
    }).then(handleLog);
  }

  function handleLog(body) {
    process.stdout.write(body);
    options.startLineNumber += getNumberOfLines(body);
    setTimeout(() => log(options), options.interval);
  }

  function findStage(stages, stageName) {
    if (!Array.isArray(stages)) {
      throw new Error('Expected Array got something else');
    }

    return new Promise((resolve, reject) => {
      if (stageName) {
        const stage = find(stages, { name: stageName });
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

      return inquire('stage', map(stages, 'name')).then(stageName => stages[stageName]);
    });
  }

  function getNumberOfLines(str) {
    str = String(str).trim();
    return str.length ? str.split(/\r\n|\r|\n/).length : 0;
  }
}


require('babel-register');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(chaiAsPromised);
chai.use(sinonChai);

global.sandbox = null;
global.expect = chai.expect;
global.sinon = sinon;
global.spy = sinon.spy;
global.stub = sinon.stub;

'use strict';

var url = location.origin + jQuery('.console-action-bar a').filter((i, el) => el.href.indexOf('console.log') > -1).attr('href');
var jSessionId = (document.cookie.match(/JSESSIONID=(.+?);/)||[])[1];
var resultObj = {
  url: url,
  jSessionId: jSessionId
};
alert("echo '" + JSON.stringify(resultObj) + "' | node index.js");

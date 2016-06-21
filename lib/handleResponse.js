const handleRawRequest = (callback) => {
  return (err, response, body) => {
    if (err || !response) {
      callback(new Error('Unexpected error fetching ...'));
    }

    if (response && response.statusCode === 401) {
      callback(new Error('Please check if session parameter is valid'));
    }

    return callback(undefined, body);
  }
}

const handleJsonRequest = (callback) => {
  handleRawRequest((err, body) => callback(err, JSON.parse(body)));
}


module.exports = {
  raw: handleRawRequest,
  json: handleJsonRequest
}


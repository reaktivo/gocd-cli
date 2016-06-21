const inquirer = require('inquirer');

module.exports = options => {

  function saveResponse() {

  }

  function inquire(key, choices) {
    return new Promise((resolve, reject) => {
      if (choices.length === 0) {
        throw new Error(`No options available for ${key}`);
      }

      if (choices.length === 1) {
        resolve(choices[0]);
      }

      inquirer.prompt([{
        choices,
        type: 'list',
        name: key,
        message: `Please pick a ${key}`
      }]).then(answers => resolve(answers[key]));
    });
  }

  return { inquire, saveResponse }
}

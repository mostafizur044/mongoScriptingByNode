const inquirer = require('inquirer');

module.exports = {
  askDBname: () => {
    const questions = [
      {
        name: 'name',
        type: 'input',
        message: 'Enter your DB name: ',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your DB name.';
          }
        }
      },
      {
        name: 'check',
        type: 'input',
        message: 'Are you sure ? Your DB name is right. please press y/n: ',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your DB name.';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },
  askMongoversion: () => {
    const questions = [
      {
        name: 'fname',
        type: 'input',
        message: 'Enter your pc mongo folder (Please check here C:\\Program Files\\MongoDB\\Server): ',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter mongo folde.';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },
  askForExport: () => {
    const questions = [
      {
        name: 'check',
        type: 'input',
        message: 'Do you want to export all collection in your current BD? Please press y/n: ',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter y/n.';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  }
};
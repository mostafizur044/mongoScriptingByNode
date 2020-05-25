const CLI = require('clui'),
Spinner = CLI.Spinner;


module.exports = {
    mongoPath: 'C:\\Program Files\\MongoDB\\Server\\', // your mongo files
    status: new Spinner('your request is on processing, please wait...'),
    host: 'localhost:27017', // change your host
}
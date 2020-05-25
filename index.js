const chalk = require('chalk'),
clear = require('clear'),
figlet = require('figlet'),
files = require('./lib/files'),
inquirer  = require('./lib/inquirer'),
cmd = require('node-run-cmd'),
{host, mongoPath, status} = require('./lib/config');


let dbName = '', dumpCommand = ''; 
const originalPath = files.getCurrentDirectoryPath();
let mongoCmdpath = '', data = {};


const run = async () => {
    // clear();
    console.log(files.directoryExists(originalPath +'/assets/data.json'))
    if(files.directoryExists(originalPath +'/assets/data.json')) {
        const d = files.getJSONFileData(originalPath +'/assets/data.json');
        data = JSON.parse(d);
        console.log(JSON.parse(d));
    } else {
        files.createDir(originalPath +'/assets');
        files.writeJSONData(originalPath +'/assets/data.json', data);
    }
    
    console.log(chalk.yellow(figlet.textSync('Mongo Export', { horizontalLayout: 'full' })));
    const dirName = files.getParentDirectory().toString();
    data = {...data, dirName};
    await takingInputData();
    await mongoDumpingOrExporting();
};

async function takingInputData() {
    console.log('Current directory: ' + originalPath);
    console.log('\n**************** Input section ****************\n ');
    await takingDBname();
    await takingMongoVersion();

    return new Promise(resolve => resolve('resolved'));
}

async function takingDBname() {
    if(data.dbName) {
        console.log('\nYour DB name: ' + data.dbName);
        const {check} = await inquirer.askForUseExistingOne();
        if(check.toString().toLowerCase() === 'y') {
            formatDbName(data.dbName);
        } else await manpulateDBName();
    } else await manpulateDBName();
}

async function manpulateDBName() {
    const {name, check} = await inquirer.askDBname();
    dbName = name.toString().trim();
    if(check.toString().toLowerCase() === 'y') {
        formatDbName(dbName);
    } else {
        await manpulateDBName();
    } 
}

function formatDbName(dbName) {
    dumpCommand = '.\\mongodump.exe --host ' + host +' --db '+ dbName +' --out '+ data.dirName +'\\all-seed\\bson\\';
    data = {...data, dbName};
    files.writeJSONData(originalPath +'/assets/data.json', data);
    console.log('\nYour DB name: ' + dbName);
}

async function takingMongoVersion() {
    if(data.fname) {
        console.log('Your Mongo folder: ' + data.fname);
        const {check} = await inquirer.askForUseExistingOne();
        if(check.toString().toLowerCase() === 'y') {
            manpulateFName(data.fname);
        } else await formatFName();
    } else await formatFName();
    
}

async function formatFName() {
    let {fname} = await inquirer.askMongoversion();
    if(fname) {
        // console.log(files.directoryExists(mongoPath + fname));
        fname = fname.toString().trim();
        if(files.directoryExists(mongoPath + fname)) {
            manpulateFName(fname);
        } else {
            console.log('Sorry wrong folder name');
            await formatFName();
        }
    }
}

function manpulateFName(fname) {
    mongoCmdpath = mongoPath  + fname + '\\bin';
    data = {...data, fname};
    files.writeJSONData(originalPath +'/assets/data.json', data);
    console.log('Your Mongo folder: ' + fname);
}


async function mongoDumpingOrExporting () {
    console.log('\n**************** Exporting section ****************\n ');

    if(data.filenames && data.filenames.length > 0) {
        console.log('Your Entity Names: ');
        console.log(data.filenames);
        const {check} = await inquirer.askForUseExistingOne();
        if(check.toString().toLowerCase() === 'y') {
            status.start();
            exportMongocollection();
        } else callMongoDump();
    } else callMongoDump();
}

function callMongoDump() {
    files.changeCurrentDirectoryPath(mongoCmdpath);
    console.log(dumpCommand, '\nNew directory Path: ' + files.getCurrentDirectoryPath());
    status.start();
    cmd.run(dumpCommand).then(
        res => {
            console.log(res);
            onDumpingDone();
        },
        err => onError(err)
    );
}

function onError(err) {
    console.log(err);
    process.exit();
}

function onDumpingDone () {
    files.changeCurrentDirectoryPath(originalPath);
    console.log('\nOriginal directory: ' + files.getCurrentDirectoryPath());
    console.log(files.directoryExists('../all-seed/bson/' + data.dbName));

    manpulateExport();
    exportMongocollection();
   
};

function manpulateExport() {
    const filePath = data.dirName + '\\all-seed\\bson\\' + data.dbName;
    data['filenames'] = files.getFileList(filePath).map( m => m.split('.')[0]).filter((item, i, arr) => arr.indexOf(item) === i);
    files.writeJSONData(originalPath +'/assets/data.json', data);
    files.removeDir(data.dirName + '\\all-seed\\bson');
}

function exportMongocollection() {
    const exportCommands = data.filenames.map( m => '.\\mongoexport.exe --host ' + host +' --db '+ data.dbName +' --collection ' + m + ' --out '+ data.dirName +'\\all-seed\\json\\' + data.dbName +'\\'+ m +'.json');
    files.changeCurrentDirectoryPath(mongoCmdpath);
    console.log(exportCommands, '\nNew directory Path: ' + files.getCurrentDirectoryPath());
    
    cmd.run(exportCommands, { mode: 'parallel' }).then(
        res => {
            console.log(res);
            onExportingDone();
        },
        err => onError(err)
    );
    
}

function onExportingDone() {
    files.changeCurrentDirectoryPath(originalPath);
    console.log('\nOriginal directory: ' + files.getCurrentDirectoryPath());
    console.log(files.directoryExists('../all-seed/json/' + dbName));
    console.log(chalk.yellow(figlet.textSync('Done !!!')));
    status.stop();
    process.exit();
};

run();

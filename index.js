const chalk = require('chalk'),
clear = require('clear'),
figlet = require('figlet'),
files = require('./lib/files'),
inquirer  = require('./lib/inquirer'),
cmd = require('node-run-cmd'),
{host, mongoPath, status} = require('./lib/config');


let dbName = '', mongoFolderName = '4.2', dumpCommand = ''; 
const originalPath = files.getCurrentDirectoryPath();
let mongoCmdpath = '';


const run = async () => {
    clear();
    console.log(chalk.yellow(figlet.textSync('Mongo Dumping', { horizontalLayout: 'full' })));
    await takingData();
    await mongoDumping();
};

async function takingData() {
    console.log('Current directory: ' + originalPath);
    console.log('\n**************** Input section ****************\n ');
    await takingDBname();
    await takingMongoVersion();

    console.log('\nYour DB name: ' + dbName);
    console.log('Your Mongo folder: ' + mongoFolderName);

    return new Promise(resolve => resolve('resolved'));
}

async function takingDBname() {
    const {name, check} = await inquirer.askDBname();
    dbName = name.toString().trim();
    console.log(check);
    if(check.toString().toLowerCase() === 'y') {
        const dirName = files.getParentDirectory().toString();
        dumpCommand = '.\\mongodump.exe --host ' + host +' --db '+ dbName +' --out '+ dirName +'\\all-seed\\bson\\';
        
    } else {
        await takingDBname();
    }
    
}

async function takingMongoVersion() {
    let {fname} = await inquirer.askMongoversion();
    if(fname) {
        // console.log(files.directoryExists(mongoPath + fname));
        fname = fname.toString().trim();
        if(files.directoryExists(mongoPath + fname)) {
            mongoFolderName = fname;
            mongoCmdpath = mongoPath  + mongoFolderName + '\\bin';
        } else {
            console.log('Sorry wrong folder name');
            await takingMongoVersion();
        }
    }
}


function mongoDumping () {
    console.log('\n**************** Dumping section ****************\n ');
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

async function onDumpingDone () {
    files.changeCurrentDirectoryPath(originalPath);
    status.stop();
    console.log('\nOriginal directory: ' + files.getCurrentDirectoryPath());
    console.log(files.directoryExists('../all-seed/bson/' + dbName));
    status.stop();
    let {check} = await inquirer.askForExport();
    if(check.toString().toLowerCase() === 'y') {
        exportMongocollection();
    } else {
        console.log(chalk.yellow(figlet.textSync('Done !!!')));
        process.exit();
    }
};

function exportMongocollection() {
    console.log('\n**************** Exporting section ****************\n ');
    const dirName = files.getParentDirectory().toString();
    const filePath = dirName + '\\all-seed\\bson\\' + dbName;
    const filenames = files.getFileList(filePath).map( m => m.split('.')[0]).filter((item, i, arr) => arr.indexOf(item) === i);
    console.log(filenames);
    const exportCommands = filenames.map( m => '.\\mongoexport.exe --host ' + host +' --db '+ dbName +' --collection ' + m + ' --out '+ dirName +'\\all-seed\\json\\' + dbName +'\\'+ m +'.json');
    status.start();
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

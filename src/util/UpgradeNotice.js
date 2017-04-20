const spawn = require('child_process').spawn;
const LogStyle = require('../../common/LogStyle');

let version = require('../../package.json').version;
exports.run = function () {
    let npm = spawn(process.platform==='win32'?'npm.cmd':'npm', ['show', 'jud-devtool', 'version']);
    npm.stdout.on('data', (data) => {
        let latestVersion = data.toString().trim();
        if (getVersionValue(version) < getVersionValue(latestVersion)) {
            console.log(LogStyle.dressUp('New version['+latestVersion+'] of Jud debugger detected! Please update.(npm install -g jud-toolkit)', LogStyle.FG_RED))
        }
    });
}
function getVersionValue(version) {
    let sum = 0;
    version.split('.').filter(n=>isFinite(n)).forEach((n, i, arr)=> {
        sum += Math.pow(10, (arr.length - i - 1) * 4) * n;
    });
    return sum;
}

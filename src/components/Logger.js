var Config = require('./Config');
var LogStyle = require('../../common/LogStyle');
var traceLevel = {
    'debug': true,
    'error': true
};
function _log(level, args) {
    if (Config.verbose || level == 'error'||level=='warn') {
        args.unshift(LogStyle.LEVEL_COLOR[level]);
        args.push(LogStyle.LEVEL_COLOR['#end']);
        if (traceLevel[level]) {
            let e = new Error();
            let stack = e.stack.split('\n')[3].split('(');
            args.push('\n' + LogStyle.LEVEL_COLOR['#underline'] + '@(' + (stack[1] || stack[0]) + LogStyle.LEVEL_COLOR['#end']);
        }
        (console[level] || console.log).apply(console, args);
    }
}
exports.log = function (...args) {
    _log('log', args);
};
exports.error = function (...args) {
    _log('error', args);
};
exports.debug = function (...args) {
    _log('debug', args);
};
exports.warn=function(...args){
    _log('warn',args)
}
exports.printMessage = function (message, prefix) {
    if (message.method == 'JudDebug.callJS') {
        exports.log(`[${prefix}] callJS:`, message.params.method);
    }
    else if (message.method == 'JudDebug.callNative') {
        exports.log(`[${prefix}] callNative:(${message.params.instance}`, message.params.tasks.map(task=>task.module + '.' + task.method), ')');
    }
    else if (message.method == 'JudDebug.registerDevice') {
        exports.log(`[${prefix}]`, message);
    }
    else {
        if (message.method) {
            if (message.method != 'Page.screencastFrame')
                exports.log(`[${prefix}]`, message.method);
        }
        else {
            exports.log(`[${prefix}]`, message);
        }
    }
};
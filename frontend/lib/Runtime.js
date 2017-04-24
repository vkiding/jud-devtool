"use strict";
self.$$frameworkFlag={};
var sessionId;
var injectedGlobals = [
    'Promise',
    // W3C
    'window',
    'jud',
    'service',
    'Rax',
    'services',
    'global',
    'screen',
    'document',
    'navigator',
    'location',
    'fetch',
    'Headers',
    'Response',
    'Request',
    'URL',
    'URLSearchParams',
    'setTimeout',
    'clearTimeout',
    'setInterval',
    'clearInterval',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'alert',
    // ModuleJS
    'define',
    'require',
    // Jud
    'bootstrap',
    'register',
    'render',
    '__d',
    '__r',
    '__DEV__',
    '__jud_define__',
    '__jud_require__',
    '__jud_viewmodel__',
    '__jud_document__',
    '__jud_bootstrap__',
    '__jud_options__',
    '__jud_data__',
    '__jud_downgrade__',
    '__jud_require_module__',
    'Vue'
];
let cachedSetTimeout=this.setTimeout;
Object.defineProperty(this,'setTimeout',{
    get:function(){
        return cachedSetTimeout;
    },
    set:function(){

    }
});
Object.defineProperty(navigator,'product',{get:function(){return 'jud'}});
Object.defineProperty(navigator,'appCodeName',{get:function(){return 'jud'}});
function EventEmitter() {
    this._handlers = {};
}
importScripts('/lib/EventEmitter.js');
function createJudBundleEntry(sourceUrl){
    var code='';
    if(self.$$frameworkFlag[sourceUrl]||self.$$frameworkFlag['@']){
        code+=(self.$$frameworkFlag[sourceUrl]||self.$$frameworkFlag['@'])+'\n';
    }
    code+='"use strict";\n__jud_bundle_entry__(';
    injectedGlobals.forEach(function(g,i){
        if(false&&g==='navigator'){
            code+='typeof '+g+'==="undefined"||'+g+'===self.'+g+'?undefined:'+g;
        }
        else{
            code+='typeof '+g+'==="undefined"?undefined:'+g;
        }

        if(i<injectedGlobals.length-1){
            code+=',';
        }

    });
    code+=');';
    return code;
}
var origConsole=self.console;
var clearConsole=self.console.clear.bind(self.console);
self.__JUD_DEVTOOL__=true;
var eventEmitter = new EventEmitter();
onmessage = function (message) {
    eventEmitter.emit(message.data.method, message.data)
};
self.callNativeModule=function(){
    var message={
        method:'JudDebug.syncCall',
        params:{
            method:'callNativeModule',
            args:Array.prototype.slice.call(arguments)
        },
        sessionId:sessionId
    }
    var result=  syncRequest(message);
    if(result.error){
        throw new Error(result.error);
    }
    else return result.ret;
}
self.callNativeComponent=function(){
    var message={
        method:'JudDebug.syncCall',
        params:{
            method:'callNativeComponent',
            args:Array.prototype.slice.call(arguments)
        },
        sessionId:sessionId
    }
    var result= syncRequest(message);
    if(result.error){
        throw new Error(result.error);
    }

    else return result.ret;
};
self.callNative = function (instance, tasks, callback) {
    for(var i=0;i<tasks.length;i++){
        var task=tasks[i];
        if(task.method=='addElement'){
            for(var key in task.args[1].style){
                if(Number.isNaN(task.args[1].style[key])){
                    console.error('invalid value [NaN] for style ['+key+']',task);
                    //task.args[1].style[key]=0;
                }
            }
        }
    }
    var payload={
        method: 'JudDebug.callNative',
        params: {
            instance: instance,
            tasks: tasks,
            callback: callback
        }
    };
    postData(payload);
};
function postData(payload){
    try {
        postMessage(payload);
    }catch(e){
        console.warn('callNative with some non-json data:',payload);
        payload=JSON.parse(JSON.stringify(payload));
        postMessage(payload);
    }
}
self.callAddElement=function(instance, ref, dom, index, callback){
    var payload={
        method: 'JudDebug.callAddElement',
        params: {
            instance: instance,
            ref: ref,
            dom:dom,
            index:index,
            callback: callback
        }
    };
    postData(payload);
};
self.__logger = function (level, msg) {
    console[level]('native:', msg);
};
self.nativeLog = function (text) {
    console.log(text);
};
var _rewriteLog=function (){
    var LEVELS = ['error', 'warn', 'info', 'log', 'debug'];
    var backupConsole={
        error:origConsole.error,
        warn:origConsole.warn,
        info:origConsole.info,
        log:origConsole.log,
        debug:origConsole.debug

    };
    function resetConsole(){
        self.console.error=backupConsole.error;
        self.console.warn=backupConsole.warn;
        self.console.info=backupConsole.info;
        self.console.log=backupConsole.log;
        self.console.debug=backupConsole.debug;
        self.console.time=origConsole.time;
        self.console.timeEnd=origConsole.timeEnd;
    }
    function noop(){}
    return function(logLevel){
        resetConsole();
        LEVELS.slice(LEVELS.indexOf(logLevel)+1).forEach(function(level){
            self.console[level]=noop;
        })
    }
}();

eventEmitter.on('JudDebug.initJSRuntime', function (message) {
    sessionId=message.sessionId;
    for (var key in message.params.env) {
        if(message.params.env.hasOwnProperty(key)) {
            self[key] = message.params.env[key];
        }

    }
    importScripts(message.params.url);
    _rewriteLog(message.params.env.JUDEnvironment.logLevel);
});
eventEmitter.on('JudDebug.changeLogLevel', function (message) {
    self.JUDEnvironment.logLevel = message.params;
});
eventEmitter.on('Console.messageAdded', function (message) {
    console.error('[Native Error]', message.params.message.text);
});
var instanceMap = {};
eventEmitter.on('JudDebug.importScript',function(data){
    console.log(data);
    if(data.params.sourceUrl) {
        importScripts(data.params.sourceUrl);
    }else{
        new Function('',data.params.source)();
    }
})
eventEmitter.on('JudDebug.callJS', function (data) {
    var method = data.params.method;
    if (method === 'createInstance') {

        var url = data.params.sourceUrl;
        postMessage({
            method: 'JudRuntime.clearLog',
        });
        importScripts(url);
        self.createInstance(data.params.args[0], createJudBundleEntry(url), data.params.args[2], data.params.args[3]);
        instanceMap[data.params.args[0]] = true;
    }
    else if (method === 'destroyInstance') {
        if (instanceMap[data.params.args[0]]) {
            self.destroyInstance(data.params.args[0]);
            delete instanceMap[data.params.args[0]];
        }
        else {
            console.warn('invalid destroyInstance[' + data.params.args[0] + '] because runtime has been refreshed(It does not impact your code. )');
        }
    }
    else if(self[data.params.method]){
        self[data.params.method].apply(null, data.params.args);
    }
    else{
        console.warn('callJS['+data.params.method+'] error: jsframework has no such api');
    }
});

function dump(id) {
    postMessage({
        method: 'JudRuntime.dom',
        params: getRoot(id)
    })

}

function syncRequest(data){
    var request = new XMLHttpRequest();
    request.open('POST', '/syncApi', false);  // `false` makes the request synchronous
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));
    if (request.status === 200) {
        return JSON.parse(request.responseText);
    }
    else{
        throw Error('sync request failed:['+request.status+']'+request.responseText);
    }
}
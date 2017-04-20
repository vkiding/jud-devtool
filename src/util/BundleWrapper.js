var injectedGlobals = [
    // ES
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
const bundleWrapper = 'function __jud_bundle_entry__('+injectedGlobals.join(',')+'){"use strict";';
const rearRegexp = /\/\/#\s*sourceMappingURL(?!.*?\s+.)|$/;
module.exports = function (code,sourceUrl) {
    var match=/^\s*(\/\/.+)\n/.exec(code);
    var anno='';
    if(match){
        anno='$$frameworkFlag["'+(sourceUrl||'@')+'"]="'+match[1].replace(/"/g,'\\"')+'";';
    }
    return anno+bundleWrapper + code.replace(rearRegexp, '}\n$&');
}


function log() {
    try {
        let logStr = "";
        if (arguments.length > 0) {
            for(let i = 0 ; i < arguments.length; i ++) {
                let logObj = arguments[i];
                logStr += " " + (typeof logObj != "string" ? JSON.stringify(logObj) : logObj);
            }
        }
        console.log((new Date()).toJSON() + " " + logStr);
    } catch (e) {
        // pass
    }
}

function debug() {
    if(global.isDebug) {
        log.apply(log, arguments);
    }
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// 合并两个object的属性
function extendObj(obj1, obj2, overWrite) {
    for(var key in obj2){
        if(obj1.hasOwnProperty(key) && !overWrite) {
            continue;
        }
        obj1[key]=obj2[key];
     }
     return obj1;
}

//ASCII码转16进制
function strToHex(str) {
    if (str === "") {
        return [];
    } else {
        var hex = [];
        for (var i = 0; i < str.length; i++) {
            hex.push((str.charCodeAt(i)));
        }
        return hex;
    }
}

//十六进制转ASCII码
function hexCharCodeToStr(hexCharCodeStr) {
    var trimedStr = hexCharCodeStr.trim();
    var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
    var len = rawStr.length;
    if (len % 2 !== 0) {
        alert("存在非法字符!");
        return "";
    }
    var curCharCode;
    var resultStr = [];
    for (var i = 0; i < len; i = i + 2) {
        curCharCode = parseInt(rawStr.substr(i, 2), 16);
        resultStr.push(String.fromCharCode(curCharCode));
    }
    return resultStr.join("");
}




module.exports.log = log;
module.exports.debug = debug;
module.exports.deepCopy = deepCopy;
module.exports.extendObj = extendObj;

module.exports.strToHex = strToHex;
module.exports.hexCharCodeToStr = hexCharCodeToStr;
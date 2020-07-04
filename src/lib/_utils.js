'use strict';

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



module.exports.strToHex = strToHex;
module.exports.hexCharCodeToStr = hexCharCodeToStr;
var bytenode = require('bytenode');
var JavaScriptObfuscator = require('javascript-obfuscator');
var fs = require('fs');
var path = require("path");

var ignores = [
    // ".git",
    // ".idea",
    // "dist",
    // "logs",
    // "compile.js",
    // "build.js",
    // "node_modules",
    // "node_modules_",
    // "test",
    // ".gitignore",
    // "1.txt",
    // "2.txt",
    // "Mbslave1.mbs",
    // "package-lock.json",
    // "mantunsci_T30_服务器通讯协议第一套V1.4.pdf",
    // "T30S使用说明.html",
    // "README.md",
    // "yarn.lock",
    "prod.json",
];
var basePath = "./src"
var buildPath = "./dist";


 
// 清理dist目录
function clearDist() {
    console.log("清理dist目录");
    fs.exists(buildPath, exist => {
        if (exist) {
            delDir(buildPath);
        }
        fs.mkdirSync(buildPath);
    });
}

// 拷贝目录到 dist 下
function copyApp() {
    console.log("拷贝目录到 dist 下");
    fs.readdir(basePath, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }
        for (var i = 0; i < files.length; i++) {
            var stat = fs.statSync(basePath + "/" + files[i]);
            console.log(files[i]);
            if(ignores.indexOf(files[i]) >= 0) {
                continue;
            }
            if (stat.isFile()) {
                fs.writeFileSync(buildPath + '/' + files[i], fs.readFileSync(basePath + '/' + files[i]));
            } else if (stat.isDirectory()) {
                createDocs(basePath + '/' + files[i], buildPath + '/' + files[i], function () {
                    console.log("copy finished.");
                });
            }
        }
    });
}

// 遍历目录, 拿到所欲文件路径
function getFiles(dir) {
    // 编译 js 文件为字节码
    var stat = fs.statSync(dir);
    if (stat.isFile() && dir.slice(dir.length-3, dir.length) == '.js') {
        // 文件，直接转换
        paths.push(dir);
    } else if (stat.isDirectory()) {
        // 目录，列出文件列表，循环处理
        var files = fs.readdirSync(dir);
        files.map(function(f) {
            var file = dir + '/' + f;
            getFiles(file);
        });
    } else {
    }
}

function obfuscateFiles(dir) {
    // 编译 js 文件为字节码
    var stat = fs.statSync(dir);
    if (stat.isFile() && dir.slice(dir.length-3, dir.length) == '.js') {
        var newDir = dir+".bak";
        // 文件，直接转换
        console.log("混淆:", dir);
        fs.writeFileSync(newDir, JavaScriptObfuscator.obfuscate(
            fs.readFileSync(dir,"utf-8"),
            {
                compact: false,
                controlFlowFlattening: true,
                stringArrayEncoding: "rc4",
            }
        ).toString(), {encoding : "utf-8"});
        fs.renameSync(newDir, dir);
    } else if (stat.isDirectory()) {
        // 目录，列出文件列表，循环处理
        var files = fs.readdirSync(dir);
        files.map(function(f) {
            var file = dir + '/' + f;
            obfuscateFiles(file);
        });
    } else {
    }
};

function compileFile(dir) {
    console.log("编译:", dir);
    var stat = fs.statSync(dir);
    if (stat.isFile() && dir.slice(dir.length-3, dir.length) == '.js') {
        // 文件，直接转换
        bytenode.compileFile({
            filename: dir
        });
        fs.unlinkSync(dir);
    } else if (stat.isDirectory()) {
        // 目录，列出文件列表，循环处理
        var files = fs.readdirSync(dir);
        for (var i = 0; i < files.length; i++) {
            var file = dir + '/' + files[i];
            compileFile(file);
        }
    }
}
 
//递归创建目录 同步方法  
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            console.log("mkdirsSync = " + dirname);
            fs.mkdirSync(dirname);
            return true;
        }
    }
}
 
function _copy(src, dist) {
    var paths = fs.readdirSync(src)
    paths.forEach(function (p) {
        var _src = src + '/' + p;
        var _dist = dist + '/' + p;
        var stat = fs.statSync(_src)
        if (stat.isFile()) {// 判断是文件还是目录
            fs.writeFileSync(_dist, fs.readFileSync(_src));
        } else if (stat.isDirectory()) {
            copyDir(_src, _dist)// 当是目录是，递归复制
        }
    })
}
 
/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
function copyDir(src, dist) {
    var b = fs.existsSync(dist)
    console.log("dist = " + dist)
    if (!b) {
        console.log("mk dist = ", dist)
        mkdirsSync(dist);//创建目录
    }
    console.log("_copy start")
    _copy(src, dist);
}

function createDocs(src, dist, callback) {
    console.log("createDocs...")
    copyDir(src, dist);
    console.log("copyDir finish exec callback")
    if (callback) {
        callback();
    }
}

function delDir(path) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                delDir(curPath); //递归删除文件夹
            } else {
                console.log("删除", curPath);
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);
    }
}


function main() {
    clearDist();
    setTimeout(function(){
        copyApp();
    }, 2000);
    setTimeout(function() {
        obfuscateFiles(buildPath);
    }, 4000);
    setTimeout(function() {
        //compileFile(buildPath);
    }, 8000);
}

var paths = [];
var param = process.argv[2];
main(param);
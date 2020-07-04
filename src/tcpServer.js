'use strict';

const util = require('util');
const EventEmitter = require('events');
const net = require('net');

const helper = require('./helper');
const DataParser = require("./dataParser");
const Db = require("./mydb");

// options 指 conf/collector_config.js 中当前(ind对应)点表的模板
function TcpServer(options, callback) {
    this.options = options;
    this.sockets = {};
    this.server = null;
    this.started = false;

    this.packagStart = "{";
    this.packagEnd = "}";
    this.callback = callback;

    this._init_();
}
util.inherits(TcpServer, EventEmitter);

// 启动服务
TcpServer.prototype._init_ = function() {
    let that = this;
    if(this.server || !this.started) {
        this.server = net.createServer(function (socket) {
            helper.log('connect collector: ' + socket.remoteAddress + ':' + socket.remotePort);
            var connection = socket.remoteAddress + ':' + socket.remotePort;
            that.sockets[connection] = socket;
            socket.connection = connection;

            // 缓存数据, 防止黏包
            socket.dataBuffer = "";

            socket.on('data', function(data) {
                socket.dataBuffer += data;
                that.dealData(socket);
            });

            socket.on('close', function() {
                // clear connectionMap info
                if (that.sockets.hasOwnProperty(connection)) {
                    helper.log('#', connection, 'disconnect, update map');
                    delete that.sockets[connection];
                }
            });

            socket.on('end', function() {
                helper.log('# on end');
            });

            socket.on('error', function(error) {
                helper.log('# on error:', error.message);
            });

            socket.setKeepAlive(true, 30000000);
        });

        var host = that.options.host;
        var port = that.options.port;
        helper.log('listening ' + host + ' port ' + port);
        this.server.listen(port, host);
        return true;
    }
    return true;
};

// 处理黏包的情况
TcpServer.prototype.dealData = function(socket) {
    var that = this;
    var buf = socket.dataBuffer;
    if(buf.length > 2 && buf.indexOf("{") >= 0 && buf.indexOf("}") >= 0) {
        var start = buf.indexOf("{");
        var end = buf.indexOf("}");
        var data = buf.slice(start, end+1);
        socket.dataBuffer = buf.slice(end+1, buf.length);
        // 解析正确, 发送数据
        if(data.length > 2) {
            if(typeof that.callback == "function") {
                that.callback(socket, data);
            }
        }
    }
}

module.exports = TcpServer;

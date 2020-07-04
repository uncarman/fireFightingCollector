"use strict";

const bytenode = require('bytenode');
const util = require("util");
const EventEmitter = require("events");

const TcpServ = require("./tcpServer");
const helper = require("./helper");
const CollectorConf = require("./conf/collectorConfig").collectorConfig();

// ind 指 conf/collector_config.js 中第几个点表模板
function AppServer(options, callback) {
	this.options = options;
    this.callback = callback;
    this._connect_();
}
util.inherits(AppServer, EventEmitter);

AppServer.prototype._connect_ = function() {
    if(!this.tcpServ) {
        this.tcpServ = new TcpServ(this.options.local, this.callback);
    } else {
        helper.log("tcpserver has inited");
    }
};

module.exports = AppServer;

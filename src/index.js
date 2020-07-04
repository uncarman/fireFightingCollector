'use strict';

process.env.TZ = 'Asia/Shanghai';

let collectorId = process.argv[2];
global.isDebug = process.argv[3] == "debug" ? true : false;

const config = require('./conf/sysConfig').sysConfig();
const helper = require("./helper");
const Db = require("./mydb");
var TcpServ = require("./tcpServer");
const AppServer = require('./appServer');

let app = null;
let db = null;
// 所有设备列表
let items = {};

function main() {
	try {
		if(collectorId > 0) {
			db = new Db(config.mysql);
			Promise.all([db.getItems(collectorId)]).then(data => {
		        // 更新设备信息
		        updateDeviceList(data[0]);
		        // 启动服务
		        app = new AppServer(config, callback);
				helper.log("服务启动成功", collectorId);
		    });
		} else {
			helper.log("请输入采集器ID");
		}

		// 获取最新设备信息
		setTimeout(function() {
			Promise.all([db.getItems(collectorId)]).then(data => {
				// 更新设备信息
		        updateDeviceList(data[0]);
			});	
		}, 5*60*1000);
	} catch(e) {
		console.trace(e);
	}
}

function updateDeviceList(data) {
	items = data;
    data.map(function(it) {
    	items[it.code] = it;
    });
    helper.log("更新待采集设备", data.length, "个");
}

// 处理业务逻辑
// 设备类型：
//     C 室外消火栓
//     D 管道压力
//     E 水箱液位压力
//     F 灭火器压力
//     G 水浸报警
//     H 温湿度
const types = ["C", "D", "E", "F", "G", "H"];
function callback(socket, data) {
	// 移除两头的{}
	data = data.slice(1, data.length-1);
	// 获取最后两位的校验码
	var checkSum = data.slice(data.length-2, data.length);
	// 计算当前数据的校验码
	var strCheck = data.slice(0, data.length-2);
	var fullSum = helper.strToHex(strCheck).reduce(function(prev, next, index, array) {
        return prev + next;
    }).toString(16);
    var checkVal = fullSum.slice(fullSum.length-2, fullSum.length);
	if(checkSum == checkVal) {
		// 数据正确
		// 尝试拿到设备类型, 单数据包模式
		var type = data.slice(0, 1);
		if(types.indexOf(type) >= 0) {
			analyticalData(socket, type, strCheck);
		} else {
			// TODO: MU 多数据包模式
		}
	} else {
		helper.log("checkSum error:", data, checkSum, checkVal);
	}
}

// 根据数据类型, 解析数据, eg: D867726037787860:0900KPA:3.6V:0000
// 不同type对应不同固定数据格式
function analyticalData(socket, type, data) {
	var dl = data.split(":");
	var msg = {};
	if(type == "D") { 
		var sn = dl[0].slice(1, dl[0].length);
		msg["设备类型"] = data.slice(0, 1);
		msg["设备SN"] = sn;
		msg["id"] = items[sn].id;
		msg["ind"] = msg["水压"] = dl[1];
		msg["电池电压"] = dl[2];
		// 告警相关
		msg["告警1"] = dl[3].slice(0, 1);
		msg["告警2"] = dl[3].slice(1, 2);
		msg["告警3"] = dl[3].slice(2, 3);
		msg["告警4"] = dl[3].slice(3, 4);
		// 应答设备
		var str = "{A"+dl[1]+":"+dl[2]+":"+dl[3]+"}";
		helper.debug("send msg:", str);
		socket.write(str);
		// 保存数据
		helper.debug("get object", msg);
		if(msg.id && msg.id > 0) {
			db.updateData(msg);
			checkWarning(msg);
		}
	}
}

// 解析报警信息
function checkWarning(msg) {
	try {
		var item = items[msg["设备SN"]];
        var rules = item.rules;
        var itemId = item.id;
        if(typeof rules == "string") {
        	helper.debug(rules);
            rules = JSON.parse(rules);
        }
        if(Array.isArray(rules) && rules.length > 0) {
        	// 遍历rule, 检查是否需要报警
	        rules.map(function(rule) {
	            var key = rule.key;
	            var val = rule.val;
	            var compare = rule.compare;
	            if(msg.hasOwnProperty(key)) {
	                var compareStr = msg[key]+compare+val;
	                var compareArr = JSON.stringify([key, msg[key],compare,val]);
	                if(eval(compareStr)) {
	                    // 尝试报警
	                    db.updateWarning({
	                        item_id: itemId,
	                        compare: compareArr,
	                        warning_category: rule.warning_category,
	                        severity: rule.severity,
	                        err_msg: rule.err_msg,
	                        solution_ref: rule.solution_ref,
	                        reported_at: new Date(),
	                    });
	                } else {
	                    // 尝试修复
	                    db.updateWarning({
	                        item_id: itemId,
	                        warning_category: rule.warning_category,
	                        has_fixed: 1,
	                        reported_at: new Date(),
	                    });
	                }
	            }
	        });
        }
    } catch(e) {
        console.trace(e);
    }
}

// 扩展array的indexOf方法
Array.prototype.indexOf = function(el) {
    for (var i = 0, n = this.length; i < n; i++) {
        if (this[i] === el) {
            return i;
        }
    }
    return -1;
}


// 执行程序
main();


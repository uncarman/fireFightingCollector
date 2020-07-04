


function warningType() {
	// 消防报警错误码, a_item_rule
	return  {
		// "D": {
		// 	"0" : {
		// 		"0": "正常",
		// 		"1": "漏水",
		// 		"2": "放水阀动作",
		// 		"8": "放水传感器故障",
		// 	},
		// 	"1" : {
		// 		"0": "正常",
		// 		"1": "撞击报警",
		// 		"2": "开盖报警",
		// 		"8": "撞击传感器故障",
		// 	},
		// 	"2" : {
		// 		"0": "压力正常",
		// 		"1": "压力低于下限阀值",
		// 		"2": "压力高于上限阀值",
		// 		"4": "压力传感器故障",
		// 	},
		// 	"3" : {
		// 		"0": "正常",
		// 		"1": "电池电压低",
		// 		"4": "子设备失联",
		// 	}
		// }
	}
}

function collectorConfig() {
    return []; 
};


module.exports.warningType = warningType;
module.exports.collectorConfig = collectorConfig;

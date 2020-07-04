'use strict';

var net = require('net');

// 指定连接的tcp server ip，端口
var options = {
	 host : '47.100.196.152',
	 port : 7000,
}

var tcp_client = net.Socket();
var isConnected = false;

connect();

// 连接 tcp server
function connect() {
	tcp_client.connect(options, function(){
		console.log('connected to Server');
		isConnected = true;
		var buff = "{D860411040185892:0900KPA:3.6V:124471}";
		console.log("send", buff);
		setInterval(function() {
			if(isConnected) {
				tcp_client.write(buff);
			}
		}, 3000);
	});
}


// 接收数据
tcp_client.on('data',function(data){
	console.log('----- received data:', data.toString("utf-8"));
})

tcp_client.on('end',function(){
	console.log('data end!');
	isConnected = false;
	setTimeout(function() {
		connect();
	}, 3000);
})

tcp_client.on('error', function () {
	console.log('tcp_client error!');
	isConnected = false;
	setTimeout(function() {
		connect();
	}, 3000);
})

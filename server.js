var http = require('http');
var express = require('express');
var Path = require('path');
var logger = require('morgan');
var mdns = require('mdns');


function createListener(port){
	return function(){
		console.log('start listing on', port);
	}	
}

function advertiseService(name, port, path){
	var txtRecord = {	'celfCloud' : 'true'};
	if (path) {
		txtRecord['path'] = path;
	}

	var ad = mdns.createAdvertisement('_http._tcp', port, 
		{ 	'name': name,
		  	'txtRecord': txtRecord }	 );
	console.log('start advertising for "' + name + '" on', port)
	ad.start();	
}

function createServer(port){
	this.app = express();
	this.port = port;
	var server = http.createServer(this.app);
	server.listen(port, createListener(this.port));

	this.app.use(logger('dev'));
	return this; 
}

createServer.prototype.addStaticPath = function (serviceName, folder, path){
	this.app.use(path, express.static(Path.join(__dirname, folder)));

	advertiseService(serviceName, this.port, path !== '/' ? path : undefined );
	return this; 
}


/* create two spearate servers*/ 
var server_a = new createServer(3000).addStaticPath('A Store', '/site-a', '/');
var server_b = new createServer(3001).addStaticPath('B True', '/site-b', '/');


/* create one server width to services on different paths  */ 
var server_c = new createServer(3002).addStaticPath('celf', '/site-c', '/c')
				.addStaticPath('Demo', '/site-d', '/d')
				.addStaticPath('Embrace', '/site-e', '/');

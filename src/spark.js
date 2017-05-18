'use strict';

var path = require('path'),
	shelljs = require('shelljs'),
	Q = require('q'),
	AppServer = require('totvs-platform-helper/appserver'),
	TDS = require('totvs-platform-helper/tdscli');

const
	GENERATED_SRC_DIR = path.join(__dirname, '..', 'build', 'generated'),
	ABL_SRC_DIR = path.join(__dirname, '..', 'resources', 'abl'),
	INCLUDES_DIR = path.join(__dirname, '..', 'resources', 'includes'),
	APPSERVER_DIR = path.join(__dirname, '..', 'resources', 'appserver'),
	APPSERVER_EXE = process.platform === 'win32' ? 'appserver.exe' : 'appserver';


class Spark {
	constructor() {
		this.appserver = new AppServer({
			target: path.join(APPSERVER_DIR, APPSERVER_EXE),
			silent: true
		});

		this.tds = new TDS({
			silent: true
		});

		this.tdsOptions = {
			serverType: "4GL",
			server: "127.0.0.1",
			port: -1,
			build: "7.00.150715P",
			environment: "ENVIRONMENT"
		};
	}

	get files() {
		return shelljs.ls(ABL_SRC_DIR);
	}

	start() {
		shelljs.rm('-rf', GENERATED_SRC_DIR);
		shelljs.mkdir('-p', GENERATED_SRC_DIR);

		return this.appserver.start()
			.then(() => {
				this.tdsOptions.port = this.appserver.tcpPort;
				this.tdsOptions.build = this.appserver.build;
			});
	}

	stop() {
		return this.appserver.stop();
	}

	generate() {
		shelljs.cp('-Rf', path.join(ABL_SRC_DIR, '*.*'), GENERATED_SRC_DIR);

		return Q();
	}

	compile(file) {
		var options = Object.assign({
			recompile: true,
			program: [
				path.join(GENERATED_SRC_DIR, file)
			],
			includes: [
				GENERATED_SRC_DIR,
				INCLUDES_DIR
			]
		}, this.tdsOptions);

		return this.tds.compile(options);
	}

}

/*
		tdsOptions = {
			serverType: "4GL",
			server: "127.0.0.1",
			port: -1,
			build: "",
			environment: "ENVIRONMENT"
		};


 */
/*
let deferred = Q.defer();

console.log('BEFORE!');

setTimeout(() => {
	console.log('BEFORE RESOLVED!');
	deferred.resolve();
}, 1900);

return deferred.promise;
*/

module.exports = Spark;

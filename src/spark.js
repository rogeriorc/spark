'use strict';

var path = require('path'),
	shelljs = require('shelljs'),
	Q = require('q'),
	AppServer = require('totvs-platform-helper/appserver'),
	SmartClient = require('totvs-platform-helper/smartclient'),
	TDS = require('totvs-platform-helper/tdscli'),
	spawn = require('totvstec-tools/src/util/spawn');

const
	GENERATED_SRC_DIR = path.join(__dirname, '..', 'build', 'generated'),
	ABL_SRC_DIR = path.join(__dirname, '..', 'resources', 'abl'),
	INCLUDES_DIR = path.join(__dirname, '..', 'resources', 'includes'),
	APPSERVER_DIR = path.join(__dirname, '..', 'resources', 'appserver'),
	APPSERVER_EXE = process.platform === 'win32' ? 'appserver.exe' : 'appserver',
	SMARTCLIENT_DIR = path.join(__dirname, '..', 'resources', 'smartclient'),
	SMARTCLIENT_EXE = process.platform === 'win32' ? 'smartclient.exe' : 'smartclient';


class Spark {
	constructor() {
		this.appserver = new AppServer({
			target: path.join(APPSERVER_DIR, APPSERVER_EXE),
			silent: true
		});

		this.smartclient = new SmartClient({
			target: path.join(SMARTCLIENT_DIR, SMARTCLIENT_EXE),
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
		var files = shelljs.ls(path.join(ABL_SRC_DIR, '*.p'));

		files = files.map((file) => path.basename(file));

		return files;

		//return shelljs.ls(path.join(ABL_SRC_DIR));
		/*.map((file) => {
			var ext = path.extname(file);
			return path.basename(file, ext);
		});
		*/
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

	generate(filename) {
		/*filename = path.join(
			path.dirname(filename),
			path.basename(filename, '.p') + '.prw'
		);*/
		filename = path.basename(filename, '.p') + '.prw';

		var from = path.join(ABL_SRC_DIR, filename),
			to = path.join(GENERATED_SRC_DIR, filename);

		//TODO: Chamar o parser
		shelljs.cp('-Rf', from, to);

		return Q();
	}

	/*
		generate(filename) {
			var from = path.join(ABL_SRC_DIR, filename),
				to = path.join(GENERATED_SRC_DIR, filename);

			//TODO: Chamar o parser
			shelljs.cp('-Rf', from, to);

			return Q();
		}
	*/

	compile(file) {
		file = path.basename(file, '.p') + '.prw';

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

	runAbl(file, extraArgs) {
		var command = path.join(process.env.DLC, 'bin', '_progres.exe'),
			args = ['-b', '-p', path.join(ABL_SRC_DIR, file)],
			options = {
				/*cwd: directory,*/
				stdio: ['ignore', 'pipe', 'pipe']
			};

		if (extraArgs) {
			args.push('-param');
			args.push('"' + extraArgs.join(',') + '"');
		}

		return spawn(command, args, options)
			.then((result) => result.replace(/\r\n/igm, '\n'));
	}

	runAdvpl(file, extraArgs) {
		file = path.basename(file, '.p');

		this.appserver.stdout = "";

		return this.smartclient.run({
			program: 'U_' + file,
			communication: {
				address: "localhost",
				port: this.appserver.tcpPort
			}
		})
			.then(() => {
				var out = this.appserver.stdout.replace(/\r\n/igm, '\n');
				var lines = out.split('\n');
				lines.pop();
				lines.pop();
				lines.pop();
				lines.shift();
				lines.shift();

				return lines.join('\n');
			});
		//return Q("xyz");
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

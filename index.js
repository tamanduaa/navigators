var server = require('node-http-server'),
	portNum = 8000;

server.deploy({
  port: portNum,
});

console.log('Server listening on localhost:' + portNum);

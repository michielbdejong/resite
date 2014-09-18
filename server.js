process.umask(077);
process.env.DEBUG = true;

var http = require('http'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    reStore = require('./vendor/restore'),
    store   = new reStore.FileTree({path: '/data/resite/storage'}),
    userName = 'me',
    sitepath = '/public/www/',
    inboxpath = '/data/resite/inbox/post-me-anything/';

function postMeAnything(req, res) {
  console.log('hit postMeAnything ', req.url);
  var str = '';
  req.on('data', function(chunk) {
    console.log('chunk', chunk.toString());
    str += chunk.toString();
  });
  req.on('end', function() {
    var msgPath = inboxpath+(new Date()).getTime().toString();
    fs.writeFile(msgPath, new Buffer(str), function(err) {
      console.log('saved as', msgPath, str, err);
      res.writeHead(202, {
	'Access-Control-Allow-Origin': req.headers.origin || '*'
      });
      res.end('');
    });
  });
}
function handle(req, res, port) {
  console.log('request port 80', req.url);
  var contentPath = 'content:' + sitepath + port + req.url.split('?')[0];
  if (contentPath.substr(-1) === '/') {
    contentPath += 'index.html';
  }
  if (contentPath.substr(-5) === '.html') {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*' 
    });
  } else if (req.url.split('?')[0] === '/.well-known/webfinger') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
  }
  console.log('getting', contentPath);
  store.getItem(userName, contentPath, function(err, content) {
    res.end(content);
  });
}

mkdirp(inboxpath, function(err1) {
  console.log(err1);
  function startServer(portStr, portNo) {
    http.createServer(function(req, res) {
      return handle(req, res, portStr);
    }).listen(portNo);
  }
  startServer('default', 80);
  for (var i=8000; i<8010; i++) {
    startServer(i.toString(), i);
  }
  http.createServer(postMeAnything).listen(7678);
  console.log('port 80 running');
});

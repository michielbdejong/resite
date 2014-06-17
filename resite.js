process.umask(077);
process.env.DEBUG = true;

var http = require('http'),
    https = require('https'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    reStore = require('./vendor/restore'),
    store   = new reStore.FileTree({path: '../data/restore/storage'}),
    userName = 'michiel',
    sitepath = '/public/www/michielbdejong.com',
    certpath = '/tls/michielbdejong.com',
    inboxpath = '/data/inbox/post-me-anything/';

function postMeAnything(req, res) {
  console.log('hit', req.url);
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
      res.end('https://michielbdejong.com/blog/7.html#webmentions');
    });
  });
}
function handle(req, res) {
  console.log('request port 443', req.url);
  var contentPath = 'content:' + sitepath + req.url.split('?')[0];
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
  store.getItem(userName, 'content:'+certpath+'/tls.key', function(err2, key) {
    store.getItem(userName, 'content:'+certpath+'/tls.cert', function(err3, cert) {
      store.getItem(userName, 'content:'+certpath+'/chain.pem', function(err4, chain) {
        console.log(err1, err2, err3, err4);
        https.createServer({
          key: key,
          cert: cert,
          ca: chain
        }, postMeAnything).listen(7678);
        console.log('port 7678 running');
        https.createServer({
          key: key,
          cert: cert,
          ca: chain
        }, handle).listen(443);
        console.log('port 443 running');
      });
    });
  });
});

http.createServer(function(req, res) {
  console.log('request port 80', req.url);
  res.writeHead(302, {
    Location: 'https://michielbdejong.com'+req.url
  });
  res.end();
}).listen(80);
console.log('port 80 running');

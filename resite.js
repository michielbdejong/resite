process.umask(077);
process.env.DEBUG = true;

var http = require('http'),
    https = require('https'),
    reStore = require('./vendor/restore'),
    store   = new reStore.FileTree({path: '../data/restore/storage'}),
    userName = 'michiel',
    sitepath = '/public/www/michielbdejong.com',
    certpath = '/tls/michielbdejong.com';

function handle(req, res) {
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

store.getItem(userName, 'content:'+certpath+'/tls.key', function(err1, key) {
  store.getItem(userName, 'content:'+certpath+'/tls.cert', function(err2, cert) {
    store.getItem(userName, 'content:'+certpath+'/chain.pem', function(err3, chain) {
      console.log(err1, err2, err3);
      https.createServer({
        key: key, 
        cert: cert,
        ca: chain
      }, handle).listen(443);
    });
  });
});

http.createServer(function(req, res) {
  res.writeHead(302, {
    Location: 'https://michielbdejong.com'+req.url
  });
  res.end();
}).listen(80);

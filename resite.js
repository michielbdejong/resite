process.umask(077);
process.env.DEBUG = true;

var http = require('http'),
    https = require('https'),
    reStore = require('./vendor/restore'),
    store   = new reStore.FileTree({path: '../restore/storage'}),
    userName = 'michiel',
    sitepath = '/public/www/michielbdejong.com',
    certpath = '/tls/michielbdejong.com';

//store.putItem(userName, 'content:/public/www/michielbdejong.com/test', 'It worked!', function(err) {
//  console.log(err);
//});

http.createServer(function(req, res) {
  if (req.url.substr(-1) === '/') {
    req.url += 'index.html';
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
  }
  console.log('store.getItem', userName, 'content:'+sitepath+ req.url);
  store.getItem(userName, 'content:'+sitepath+ req.url, function(err, content) {
    res.end(content);
  });
}).listen(80);

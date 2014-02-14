process.umask(077);
process.env.DEBUG = true;

var fs = require('fs'),
    path = require('path'),
    reStore = require('./vendor/restore'),
    store   = new reStore.FileTree({path: '../restore/storage'}),
    userName = 'michiel',
    sitepath = '/public/www/michielbdejong.com',
    contentDir = '/root/michielbdejong.com/';

function importFile(_path) {
  fs.readFile(_path, function(err, buf) {
    store.putItem(userName, 'content:/public/www/michielbdejong.com/'
	+ _path.substring(contentDir.length), buf, function(err) {
      console.log(err);
    });
  });
}

function importDir(currentDir) {
  fs.readdir(currentDir, function(err, items) {
    var i, _path;
    for(i=0; i<items.length; i++) {
      _path = path.join(currentDir, items[i]);
      fs.stat(_path, (function(capturePath) {
       return function(err, stats) {
	 console.log(capturePath, stats.isDirectory());
         if (stats.isDirectory()) {
           importDir(capturePath);
         } else {
           importFile(capturePath);
         }
       };
      })(_path));
    }  
  });
}
importDir(contentDir);

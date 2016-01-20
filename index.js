var cheerio         = require('cheerio');
var Crawler         = require("simplecrawler").Crawler;
var StringDecoder   = require('string_decoder').StringDecoder;

var plugin          = require('./plugins/topmommyblogs');
var myCrawler       = new Crawler(plugin.rootUrl);
var DEBUG           = false;

myCrawler.interval                                = 200;
myCrawler.maxConcurrency                          = 4;
myCrawler.timeout                                 = 1000;
myCrawler.fetchWhitelistedMimeTypesBelowMaxDepth  = false;
myCrawler.initialPath                             = plugin.initialPath;

if (DEBUG) {
  var originalEmit = myCrawler.emit;
  myCrawler.emit = function(evt, q) {
    console.log(evt, q && q.url || "No URL");
    originalEmit.apply(myCrawler, arguments);
  }
}

myCrawler.addFetchCondition (function (url) {
    return ! url.path.match( /\.png|\.css|\.jpeg|\.js|\.jpg|\.ico|\.gif|\.zip|\.mp3|\.pdf/i );
});

myCrawler.addFetchCondition (function (url) {
  if (plugin.fetchExclude) {
    return ! url.path.match(plugin.fetchExclude);
  }
});

myCrawler.on("fetcherror", function(queueItem, response) {
  console.log(queueItem);
});

myCrawler.on("fetchstart", function(queueItem, requestOptions) {
  //console.log(queueItem.url);
});

myCrawler.on("fetchcomplete", function(queueItem, data, response) {
    
    console.log("%s (%d bytes)", queueItem.url, data.length); 

    if(response.headers['content-type'].indexOf('text/html') >= 0) {
      var decoder = new StringDecoder('utf8');
      rawHtml = decoder.write(data);
      $ = cheerio.load(rawHtml);
      plugin.process(queueItem.url);
    }
});

myCrawler.on("complete", function() {
  console.log('We be Done!!!!');
});

myCrawler.start();


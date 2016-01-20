var knex      = require('../db').knex;
var Promise   = require("bluebird");
var fs        = Promise.promisifyAll(require("fs"));
var exports   = module.exports = {};

exports.rootUrl       = 'topmommyblogs.com';
exports.initialPath   = '/pages/index.php';
exports.fetchExclude  = /\/mom-blogger-forum|\/directory\/rate|\/user|\/trackback|\/node/i;

exports.process = function(url) {
  
  if (url.match(/directory\/comments\.php/)) {

    var site = $('#leftcolumn > table > tr').eq(1).find('a').text();
    
    console.log(site);

    fs.appendFileAsync('output/momblogs.txt', site + '\n', 'utf8')
    .then(function (results) {
      console.log(results);
    })
    .catch(function (error) {
      console.log(error);
    });

  }
};
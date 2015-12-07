var pg = require('pg');
var conString = "postgres://russelltaylor:@localhost:5432/hostels";
var knex = require('knex')({
  client: 'pg',
  connection: conString,
});

var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));

var exports = module.exports = {};

exports.rootUrl = 'topmommyblogs.com';
exports.initialPath = '/pages/index.php';
exports.fetchExclude = /\/mom-blogger-forum|\/directory\/rate|\/user|\/trackback|\/node/i;


exports.process = function(url) {
  

  if (url.match(/directory\/comments\.php/)) {
    console.log('this is one', url);

    var site = $('#leftcolumn > table > tr').eq(1).find('a').text();
    console.log(site);


  fs.appendFileAsync('momblogs.txt', site + '\n', 'utf8')
  .then(function (results) {
    console.log(results);
  })
  .catch(function (error) {
    console.log(error);
  });


  }

};
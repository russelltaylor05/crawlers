var pg = require('pg');
var conString = "postgres://russelltaylor:@localhost:5432/hostels";
var knex = require('knex')({
  client: 'pg',
  connection: conString,
});
var countries = require('countries-list');

var exports = module.exports = {};

exports.rootUrl = 'hostelguide.de';
exports.initialPath = '';
exports.fetchExclude = [
/\/blog|\/forum|\/user|\/trackback|\/node/i
];


//http://www.hostelman.com/
exports.process = function() {

  $('#maintable a').each(function (index, element) {

    if ($(this).attr('href').indexOf('mailto:') >= 0) {

      var hostel = {};
      var rawAddress = $(this).closest('.form_dot').find('.bg_light table').text().trim().replace(/[\t\n]/gi, ' ').toLowerCase();

      hostel.email = $(this).text().trim();
      hostel.name = $(this).closest('.form_dot').find('td b')[0];
      hostel.name = $(hostel.name).text().trim();
      hostel.website = $(this).closest('.form_dot').find('.bg_light a').text().trim();
      for(var i in countries.countries) {
        if (rawAddress.indexOf(countries.countries[i].name.toLowerCase()) >= 0) {
          hostel.country = countries.countries[i].name;
        };
      }
      hostel.date_created = new Date();
      hostel.source = 'hostelguide.de';

      knex('hostels')
      .where({
        'email' : hostel.email
      })
      .orWhere({
        'website': hostel.website
      })
      .select('id')
      .then(function (results) {
        if(!results.length) {
          return knex('hostels').insert(hostel);
        }
      })
      .then(function (results) {
        if (results) {
          console.log(results);
        }
      })
      .catch(function (error) {
        console.log(error);
      })

    }

  });
};
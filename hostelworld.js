var pg = require('pg');
var conString = "postgres://russelltaylor:@localhost:5432/hostels";
var knex = require('knex')({
  client: 'pg',
  connection: conString,
});
var countries = require('countries-list');

var exports = module.exports = {};

exports.rootUrl = 'hostelworld.com';
exports.initialPath = '/hostels';
exports.fetchExclude =  /\/news-and-events|\/forum|\/guides|\/blog|\/hotels|\/bed-and-breakfasts|\/videos|\/podcasts|\/myworld|reviews$|directions$/i;

exports.process = function (url) {

  if(url.match(/hosteldetails\.php/ig) && !url.match(/reviews$/gi) && !url.match(/directions$/gi)) {

    var hostel = {};

    hostel.name = $('.main h1').text().trim();
    hostel.country = $('#hbg_country').val();
    hostel.city = $('#hbg_city').val();
    hostel.rating = parseInt($('.microratingpanel h3').text().replace(/\%Rating/gi, ''));
    hostel.reviews = parseInt($('.numreviews a').text().trim().replace(/\sTotal\sReviews?/gi, ''));
    hostel.date_created = new Date();
    hostel.source = 'hostelworld.com';
    hostel.hostelworld_link = url;

    console.log(hostel);

    knex('hostelworld')
    .where({
      'name' : hostel.name
    })
    .select('id')
    .then(function (results) {
      if(!results.length) {
        return knex('hostelworld').insert(hostel);
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



  };
};
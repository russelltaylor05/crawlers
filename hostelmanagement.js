var pg = require('pg');
var conString = "postgres://russelltaylor:@localhost:5432/hostels";
var knex = require('knex')({
  client: 'pg',
  connection: conString,
});

var exports = module.exports = {};

exports.rootUrl = 'hostelmanagement.com';
exports.initialPath = '/hostels';
exports.fetchExclude = /\/blog|\/forum|\/user|\/trackback|\/node/i;


exports.process = function() {

  if($('.group-contact-information').text()) {
    var hostel = {
      name    : $('.group-contact-information .field-field-accommodation').text().replace(/\n/g,'').trim().replace(/Hostel name:\s+/g, ''),
      country : $('.group-contact-information .field-field-country').text().replace(/\n/g,'').trim().replace(/Country:\s+/g, ''),
      city    : $('.group-contact-information .field-field-city').text().replace(/\n/g,'').trim().replace(/City:\s+/g, ''),
      address : $('.group-contact-information .field-field-address').text().replace(/\n/g,'').trim().replace(/Address:\s+/g, ''),
      email : $('.group-contact-information .field-field-email').text().replace(/[\s\n]/g, '').replace(/Email:/g, ''),
      website : $('.group-contact-information .field-field-web-site').text().replace(/[\s\n]/g, '').replace(/WebSite:/g, ''),
      phone : $('.group-contact-information .field-field-telephone').text().replace(/[\s\n]/g, '').replace(/Telephone:/g, ''),
      booking_page : $('.group-contact-information .field-field-booking-url').text().replace(/[\s\n]/g, '').replace(/BookingPage:/g, ''),
      facebook_page : $('.group-contact-information .field-field-facebook').text().replace(/[\s\n]/g, '').replace(/Facebook:/g, '')
    }
    console.log(hostel);
    knex('hostels')
    .where({
      'name' : hostel.name
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

};
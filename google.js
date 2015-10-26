var Bluebird      = require('bluebird');
var request       = Bluebird.promisify(require('request'));
var cheerio       = require('cheerio');
var StringDecoder = require('string_decoder').StringDecoder;
var Crawler       = require("simplecrawler").Crawler;
var url            = require('url');

var pg = require('pg');
var conString = "postgres://russelltaylor:@localhost:5432/hostels";
var knex = require('knex')({
  client: 'pg',
  connection: conString,
});

var proxies     = require('./proxy');

function extractAllEmails (text){
  return text.match(/([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)/gi);
}

function isEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

var travelSites = [
  'expedia',
  'wikipedia',
  'facebook',
  'tripadvisor',
  'twitter',
  'ebay',
  'reddit',
  'live',
  'cnn.com',
  'yelp.com',
  'youtube.com',
  'bing.com',
  'orbitz.com',
  'hotwire.com',
  'yahoo.com',
  'forbes.com',
  'airbnb.com',
  'booking',
  'bookers',
  'imdb.com',
  'greekhotel.com',
  'focusgreece.com',
  'merriam-webster',
  'www.apartments.com',
  'wikitravel.org',
  'hostelworld.com',
  'kayak.com',
  'trivago.com',
  'www.hostelz.com',
  'www.hostels.com',
  'lonelyplanet.com',
  'hihostels.ca',
  'hiusa.ca',
  'dictionary.reference.com',
  'usahostels.com',
  'www.worldbesthostels.com',
  'www.hotelscombined.com',
  'hostelbookers.com',
  'www.hostelseverywhere.com',
  'www.realadventures.com',
  'www.hotels.com',
  'www.agoda.com',
  'travelocity.com',
  'businesshotelaccommodation.co.za',
  'bedandbreakfastworld.com',
  'www.albania-hotel.com',
  'bestwestern',
  'hotelscombined',
  'urbandictionary',
  'yha.com.au'
];

var fetchCnt = 5000;
var resultLimit = 3;

/*
 * - Grab the hostels from the hostelworld table.
 * - Search bing for the first 5 results, query = hostelname + city + country
 * - Find the results that isn't one of the travel websites
 * - Crawl the hostel website for email addresses
 */

knex('hostelworld')
.select('*')
.whereNull('email')
//.where('country', '=', 'Brazil')
.where('checked_for_site', false)
.limit(fetchCnt)
.orderBy('reviews', 'desc')
.map(function (hostel) {
  //console.log(hostel);
  var searchString = hostel.name + '+' + hostel.city + '+' + hostel.country;
  searchString = searchString.replace(/\s+/gi, '+');
  var reqUrl = 'https://www.bing.com/search?q=' + searchString;
  var reqOpts = {
    url: reqUrl,
    method: "GET",
    headers: {"Cache-Control" : "no-cache"},
    proxy: proxies.select()
  };
  //console.log('-->' + reqUrl);

  var delay = Math.floor((Math.random() * fetchCnt * 1) + 1) * 500;
  request(reqOpts)
  .delay(delay)
  .spread(function (response, body) {

    $ = cheerio.load(body);
    var serpLinks = [];
    var hostelWebsite = '';
    var blacker = false;
    var cnt = 0;

    /* Loop through first 5 bing search results */
    $('li.b_algo').each(function (index, element) {

      var link = $(element).find('h2 >  a').attr('href');
      var host = url.parse(link).host;
      var blackListed = false;

      for (var i in travelSites) {
        if(host.indexOf(travelSites[i]) >= 0) {
          blackListed = true;
        }
      }

      if (!hostelWebsite &&
          !blackListed &&
          cnt < resultLimit) {

        hostelWebsite = host;
      }
      cnt++;

    });

    /* We found a unique hostel website!!! */
    if (hostelWebsite) {

      console.log('Crawling:\t' + hostelWebsite + ' for ' + hostel.name + ', ' + hostel.country)
      var myCrawler = new Crawler(hostelWebsite);
      myCrawler.interval = 200;
      myCrawler.maxConcurrency = 4;
      myCrawler.timeout = 3000;
      var emails = [];

      myCrawler.addFetchCondition (function (url) {
        return ! url.path.match( /\.png|\.css|\.jpeg|\.js|\.jpg|\.ico|\.gif|\.zip|\.mp3|\.pdf|\.swf/i );
      });

      myCrawler.on("fetchcomplete", function(queueItem, data, response) {
          //console.log("%s (%d bytes)", queueItem.url, data.length);

          if(response.headers['content-type'] && response.headers['content-type'].indexOf('text/html') >= 0) {
            var decoder = new StringDecoder('utf8');
            rawHtml = decoder.write(data);

            var pageEmails = extractAllEmails(rawHtml)
            for (var i in pageEmails) {
              if (emails.indexOf(pageEmails[i]) < 0 &&
                  isEmail(pageEmails[i]) &&
                  !pageEmails[i].match(/\.png$|\.jpeg$|\.gif$|\.pdf$/gi)) {
                emails.push(pageEmails[i]);
              }
            };
          }
      });

      myCrawler.on("complete", function() {

        var hostelUpdate = {};
        hostelUpdate.email = (emails[0]) ? emails[0] : null;
        hostelUpdate.email2 = (emails[1]) ? emails[1] : null;
        hostelUpdate.website = hostelWebsite;
        hostelUpdate.checked_for_site = 'TRUE';

        if (hostelUpdate.email || hostelUpdate.website) {

          knex('hostelworld')
          .where('id','=', parseInt(hostel.id, 10))
          .update(hostelUpdate)
          .then(function (results) {
            console.log('Update:\t\t' + hostelUpdate.email + ' --> '  + hostelUpdate.website + ' --> ' + hostel.name + ' --> ' + hostel.city + ', ' + hostel.country)
          });
        }

      });

      myCrawler.start();

    } else {
      console.log('Not Found:\t' + hostel.name + ' --> ' + hostel.city  + ', ' + hostel.country);
      knex('hostelworld')
      .where('id','=', parseInt(hostel.id, 10))
      .update({ checked_for_site : 'TRUE' })
      .then(function (results) {
        //console.log(results);
      });
    }

  })
  .catch(function (error) {
    console.log(error);
    console.log(reqOpts);
  });


})





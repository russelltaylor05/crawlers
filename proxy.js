var exports = module.exports = {};

exports.select = function () {
  var proxies = [
    'http://23.19.34.215:8800',
    'http://89.47.28.59:8800',
    'http://173.234.194.226:8800',
    'http://173.234.59.171:8800',
    'http://173.234.59.67:8800',
    'http://89.47.28.6:8800',
    'http://89.47.28.172:8800',
    'http://23.19.34.37:8800',
    'http://173.234.194.175:8800',
    'http://89.47.28.1:8800'
  ];
  var random = Math.floor((Math.random() * proxies.length) + 1);
  return proxies[random];
}
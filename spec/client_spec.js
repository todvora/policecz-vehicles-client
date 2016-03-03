const client = require('../index');
const nock = require('nock');
const path = require('path');
const assert = require('assert');

describe(__filename, function () {

  before(function() {

    nock.disableNetConnect();

    nock('http://aplikace.policie.cz')
      .filteringPath(path => path.indexOf('/patrani-vozidla/default.aspx') === 0 ? '/list' : path)
      .get('/list')
     .replyWithFile(200, path.join(__dirname, 'resources', 'list.html'));

    nock('http://aplikace.policie.cz')
       .filteringPath(path => path.indexOf('NONSENSE') > -1 ? '/list' : path)
       .get('/list')
      .replyWithFile(200, path.join(__dirname, 'resources', 'no-results.html'));

    nock('http://aplikace.policie.cz')
       .filteringPath(path => path.indexOf('/patrani-vozidla/default.aspx') === 0 ? '/list' : path)
       .get('/patrani-vozidla/Detail.aspx?id=987654321')
      .replyWithFile(200, path.join(__dirname, 'resources', 'detail.html'));
  });

  it('should parse stolen vehicles page', function() {
    return client.search('WUAMMM4F58N901800')
        .then(results => {
          assert.equal(results.count, 1);
          assert.equal(results.results[0].class, 'osobní vozidlo');
          assert.equal(results.results[0].manufacturer, 'AUDI');
          assert.equal(results.results[0].type, 'RS 6');
          assert.equal(results.results[0].color, 'červená metalíza');
          assert.equal(results.results[0].regno, '9Q91234');
          assert.equal(results.results[0].rpw, 'CZ');
          assert.equal(results.results[0].vin, 'WUAMMM4F58N901800');
          assert.equal(results.results[0].engine, 'ABC123DEF');
          assert.equal(results.results[0].productionyear, '2008');
          assert.equal(results.results[0].stolendate, '1.3.2012');
          assert.equal(results.results[0].url, 'http://aplikace.policie.cz/patrani-vozidla/Detail.aspx?id=987654321');
        });
  });

  it('should handle page without results', function() {
    return client.search('NONSENSE')
        .then(results => {
          assert.equal(results.count, 0);
          assert.equal(results.results.length, 0);
        });
  });
});

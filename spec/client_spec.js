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
       .get('/patrani-vozidla/Detail.aspx?id=987654321')
       .times(2) // mock 2 times the same request
      .replyWithFile(200, path.join(__dirname, 'resources', 'detail.html'));
  });

  it('should parse stolen vehicles page', function() {
    return client.search('WUAMMM4F58N901800')
        .then(results => {
          assert.equal(results.count, 1);
          var item = results.results[0];
          assert.equal(item.class, 'osobní vozidlo');
          assert.equal(item.manufacturer, 'AUDI');
          assert.equal(item.type, 'RS 6');
          assert.equal(item.color, 'červená metalíza');
          assert.equal(item.regno, '9Q91234');
          assert.equal(item.rpw, 'CZ');
          assert.equal(item.vin, 'WUAMMM4F58N901800');
          assert.equal(item.engine, 'ABC123DEF');
          assert.equal(item.productionyear, '2008');
          assert.equal(item.stolendate, '1.3.2012');
          assert.equal(item.url, 'http://aplikace.policie.cz/patrani-vozidla/Detail.aspx?id=987654321');
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

## API/client to the official Czech police database of stolen vehicles
[![Build Status](https://travis-ci.org/todvora/policecz-vehicles-client.svg?branch=master)](https://travis-ci.org/todvora/policecz-vehicles-client)
[![codecov.io](https://codecov.io/github/todvora/policecz-vehicles-client/coverage.svg?branch=master)](https://codecov.io/github/todvora/policecz-vehicles-client?branch=master)
[![npm version](https://badge.fury.io/js/policecz-vehicles-client.svg)](https://badge.fury.io/js/policecz-vehicles-client)
[![Dependency Status](https://david-dm.org/todvora/policecz-vehicles-client.svg)](https://david-dm.org/todvora/policecz-vehicles-client)

### Install

```
npm install --save policecz-vehicles-client
```

### Usage

The client library provides following methods and returns always a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) instance.

- ```search(string)``` finds vehicle by either *VIN* or *Registration Number*.

Example usage:

```js
var client = require('policecz-vehicles-client');

client.search('WUAMMM4F58N901800')
    .then(response => {
      assert.equal(response.count, 1);

      // do something with results

      var item = response.results[0];
      assert.equal(item.id, 987654321);
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
```

### Response format

Response contains three components:

- *results* - array of found entries
- *count* - number of entries
- *time* - when the request was processed / iso format

```js
{ results:
   [ { id: 987654321
       class: 'osobní vozidlo',
       manufacturer: 'AUDI',
       type: 'RS 6',
       color: 'červená metalíza',
       regno: '9Q91234',
       rpw: 'CZ',
       vin: 'WUAMMM4F58N901800',
       engine: 'ABC123DEF',
       productionyear: '2008',
       stolendate: '1.3.2012',
       url: 'http://aplikace.policie.cz/patrani-vozidla/Detail.aspx?id=987654321' } ],
  count: 1,
  time: '2016-03-07T09:37:41.668Z' }

```

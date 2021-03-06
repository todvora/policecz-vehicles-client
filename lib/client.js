'use strict';

const request = require('request-promise');
const cheerio = require('cheerio');
const translations = require('./translations.json');

const APP_BASE_URL = 'http://aplikace.policie.cz/patrani-vozidla/';

/** The police website provides dates in czech human readable form,
    like 7.ledna 2015 (ledna == january).
    Let's transform them to D.M.YYYY format.
*/
const getStandardizedDateStr = function(date) {
  return date
    .replace('ledna', '1.')
    .replace('února', '2.')
    .replace('března', '3.')
    .replace('dubna', '4.')
    .replace('května', '5.')
    .replace('června', '6.')
    .replace('července', '7.')
    .replace('srpna', '8.')
    .replace('září', '9.')
    .replace('října', '10.')
    .replace('listopadu', '11.')
    .replace('prosince', '12.')
    .replace(/\s/g, '');
};

/** create search url on the police website.
    It contains all the MS ASP trash (__EVENTTARGET, __VIEWSTATE, ...) .
    The only two interesting params are txtSPZ and txtVIN. We set both of them
    to the search query, ignoring, if the query itself is VIN or reg.no.
*/
function constructSearchUrl(query) {
  return APP_BASE_URL + 'default.aspx?__EVENTTARGET=&__EVENTARGUMENT=&__VIEWSTATE=%2FwEPDwULLTEzNzIzMjY0MDMPZBYCZg9kFgICBw9kFgICAQ9kFgoCBA8PZBYCHgpvbmtleXByZXNzBTZyZXR1cm4gb25LZXlwcmVzcyhldmVudCwnY3RsMDBfQXBwbGljYXRpb25fY21kSGxlZGVqJylkAgYPD2QWAh8ABTZyZXR1cm4gb25LZXlwcmVzcyhldmVudCwnY3RsMDBfQXBwbGljYXRpb25fY21kSGxlZGVqJylkAhQPDxYEHgRUZXh0BRxDZWxrb3bDvSBwb8SNZXQgesOhem5hbcWvOiAxHgdWaXNpYmxlZ2RkAhUPDxYCHwJoZGQCGQ8PFgIfAQU%2FRGF0YWLDoXplIGJ5bGEgbmFwb3NsZWR5IGFrdHVhbGl6b3bDoW5hIDxiPjYuIHByb3NpbmNlIDIwMTI8L2I%2BZGRkE2qlXWNJcxoc8%2FLZOQEi5oKrGzs%3D&__EVENTVALIDATION=%2FwEWBQL80qOCBwLQsb3%2BBgK9peeFDwLv%2BPyjBAL4oIjjDVvi8FJppOBh8gjuF1u%2Ft7viEDtA&ctl00%24Application%24txtSPZ='
        + query + '&ctl00%24Application%24txtVIN=' + query
        + '&ctl00%24Application%24cmdHledej=Vyhledat&ctl00%24Application%24CurrentPage=1';
}

/** Parse vehicle ID from the search results table */
function parseVehicleID($, item) {
  let fields = $(item).find('td');
  let id = $(fields[1]).find('a').attr('href').replace('Detail.aspx?id=', '');
  return id;
}

/** Add current timestamp and results count to the output object */
function formatDetails(details) {
  let result = {
    results: details,
    count: details.length,
    time: new Date().toISOString()
  };
  return result;
}

/** Read all possible information about desired vehicle. Loads vehicle details page */
function getByID(id) {
  var url = `${APP_BASE_URL}Detail.aspx?id=${id}`;
  return request(url)
    .then(function(body) {
      let $ = cheerio.load(body);

      let info = {
        url: url,
        id: id
      };

      $('table#searchTableResults tr').each((i, item) => {
        let span = $(item).find('span');
        let key = $(span).attr('id').replace('ctl00_Application_lbl', '').toLowerCase();
        let value = $(span).text().trim();
        info[translations[key] || key] = value;
      });
      info.stolendate = getStandardizedDateStr(info.stolendate);
      return info;
    });
}

/** The main and only method of the client, search. It takes searchQuery,
    either VIN or registration number. Returns object in the following form:
    {"results":[...],"count":1,"time":"2016-03-03T07:10:55.213Z"}
*/
const search = function(searchQuery) {
  return request(constructSearchUrl(searchQuery))
    .then(function(body){
      let $ = cheerio.load(body);
      let rows = $('table#celacr tr');
      let promises = rows
      .filter(idx => idx >= 1) // skip header row (index=0)
      .map((idx, el) => parseVehicleID($, el))
      .get()  // convert cheerio object to plain array
      .map(getByID);
      return Promise.all(promises);
    })
    .then(formatDetails);
};

module.exports = {
  search: search
};

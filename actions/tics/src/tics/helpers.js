const http = require('http');
const https = require('https');
const { ticsConfig } = require('../github/configuration');

const doHttpRequest = (url) => {
  return new Promise((resolve, reject) => {
    const client = (url.protocol === 'https') ? https : http;

    const optionsInit = {
      followAllRedirects: true
    }

    let options = ticsConfig.ticsAuthToken ? {...optionsInit, headers: {'Authorization': 'Basic' + ticsConfig.ticsAuthToken } } : optionsInit

    let req = client.get(url, options, (res) => {

      let body = [];
      res.on('data', (chunk) => {
        body += chunk;
      })

      res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(body));
          }
      })
    });

    req.on('error', error => {
      console.error("HTTP request error: ", error)
      reject(error.message);
    })

    req.end();
  });
}

const getSubstring = (value, del1, del2) => {

  const sub_position_1 = value.indexOf(del1);
  const sub_position_2 = value.indexOf(del2);

  return value.substring(sub_position_1, sub_position_2);
}

module.exports = {
    doHttpRequest: doHttpRequest,
    getSubstring: getSubstring
}
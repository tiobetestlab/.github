//const http = require('http');
const https = require('https');
const { ticsConfig } = require('../github/configuration');

const doHttpRequest = (url) => {
  return new Promise((resolve, reject) => {
    //const client = (url.protocol === 'https') ? https : http;

    const optionsInit = {
      followAllRedirects: true
    }

    let options = ticsConfig.ticsAuthToken ? {...optionsInit, headers: {'Authorization': 'Basic' + ticsConfig.ticsAuthToken } } : optionsInit

    let req = https.get(url, options, (res) => {

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

module.exports = {
    doHttpRequest: doHttpRequest
}
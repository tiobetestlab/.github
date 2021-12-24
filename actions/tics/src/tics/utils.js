const core = require('@actions/core');
const http = require('http');
const https = require('https');
const { ticsConfig } = require('../github/configuration');// FIX ME, import does not work

const doHttpRequest = (url) => {

  return new Promise((resolve, reject) => {
    const client = (url.protocol === 'http') ? http : https; //FIX ME

    const optionsInit = {
      followAllRedirects: true
    }
    
    let authToken = core.getInput('ticsAuthToken');
    let options = authToken ? {...optionsInit, headers: {'Authorization': 'Basic ' + authToken } } : optionsInit

    let req = https.get(url, options, (res) => {
      let body = [];
      
      res.on('data', (chunk) => {
        body += chunk;
      })
      
      res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(body));
          } else {
            core.setFailed("HTTP request failed with status ", res.statusCode, ". Please try again by setting a ticsAuthToken in your configuration.")
          }
      })
    });

    req.on('error', error => {
      core.setFailed("HTTP request error: ", error)
      reject(error.message);
    })

    req.end();
  });
}

/* Work-around should be removed */
const doHttpRequestNoAuth = (url) => {
  return new Promise((resolve, reject) => {

    let req = https.get(url, (res) => {

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
    doHttpRequestNoAuth: doHttpRequestNoAuth,
    doHttpRequest: doHttpRequest,
    getSubstring: getSubstring
}

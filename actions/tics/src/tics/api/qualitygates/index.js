 const core = require('@actions/core');
 const { doHttpRequest, getSubstring } = require('../../helpers');
 const { ticsConfig } = require('../../../github/configuration');
 const { execCommands } = require('../../../github/configuration');

 const getAPIEndpoint = (link) => {
    let qgBaseAPI = `${ticsConfig.ticsViewerUrl}api/private/qualitygate/Status?`;
    qgBaseAPI += getSubstring(link, "axes", "Window");
    
    return qgBaseAPI;
 }

 const getQualityGates = async(link) => {
    try {
     
        console.log("Retrieving quality gates for ", getAPIEndpoint(link))
        let qualityGates = await doHttpRequest(getAPIEndpoint(link)).then((data) => {
            let response = {
                statusCode: 200,
                body: JSON.stringify(data),
            };
            console.log("Quality Gate response ", response);
            return response;
        });

        let qualityGateObj = JSON.parse(qualityGates.body);

        if(qualityGateObj.passed === false) {
            core.setFailed('Quality gate failed');
        }
        
        return qualityGateObj;

    } catch (error) {
        core.setFailed(error);
    }
}

module.exports = {
    getQualityGates: getQualityGates
}

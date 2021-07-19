 const core = require('@actions/core');
 const { doHttpRequest, getSubstring } = require('../../utils');
 const { ticsConfig } = require('../../../github/configuration');
 const { execCommands } = require('../../../github/configuration');

 const getAPIEndpoint = (link) => {
    let qgBaseAPI = `${ticsConfig.ticsViewerUrl}api/private/qualitygate/Status?`;
    qgBaseAPI += getSubstring(link, "axes", "Window");
    
    return qgBaseAPI;
 }

 const getQualityGates = async(link) => {
    try {
     
        console.log("\u001b[35m > Trying to retrieve quality gates from ", getAPIEndpoint(link))
        let qualityGates = await doHttpRequest(getAPIEndpoint(link)).then((data) => {
            let response = {
                statusCode: 200,
                body: JSON.stringify(data),
            };
            return response;
        });

        let qualityGateObj = JSON.parse(qualityGates.body);

        if(qualityGateObj.passed === false) {
            core.setFailed('Quality gate failed');
        }
        
        return qualityGateObj;

    } catch (error) {
        core.setFailed("An error occured when trying to retrieve quality gates ", error);
    }
}

module.exports = {
    getQualityGates: getQualityGates
}

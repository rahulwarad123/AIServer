

var GoogleHome = function () { };

GoogleHome.prototype.processResponse = function (body, respData) {
    if (body.result && body.result.metadata && body.result.metadata.intentName) {
        var intentName = body.result.metadata.intentName;
        switch (intentName.toUpperCase()) {
            case "AOS-RENTERS-CURADDR-LOC":
                var permission_object = getCurrentLocationPermissionObject(respData);
                respData.data = permission_object;
                if (!respData.contextOut) {
                    respData.contextOut = [];
                }
                respData.contextOut.push({ "name": "GET-LOCATION-PERMISSION", "parameters": {} });
                break;
            default:
                break;
        }
        var repromts_Object = getreprompObject(respData);
        respData.data = repromts_Object;


    }
}


function getCurrentLocationPermissionObject(respData) {
    var permission_object = {
        "google": {
            "expect_user_response": true,
            "is_ssml": true,
            "permissions_request": {
                "opt_context": respData.speech,
                "permissions": [
                    "DEVICE_PRECISE_LOCATION"
                ]
            }
        }
    }
    return permission_object;
}
function getreprompObject(respData) {
    var repromts_Object = {
        "google": {
            "expect_user_response": true,
            "is_ssml": true,
            "no_input_prompts": [            
            { 
                text_to_speech: "sorry! i missed that please try again!"
            }           
        ]
        }
        
          
}
return repromts_Object;

}



module.exports = new GoogleHome();



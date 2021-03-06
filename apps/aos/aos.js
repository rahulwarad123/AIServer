var SpeechResponse = require('./../../shared/data-models/speechResponse.js');
var Speech = require('./../../shared/data-models/speech');
var Utilities = require('./../../shared/utilities/utilities.js');
var DateUtil = require('./../../shared/utilities/dateUtil.js');
var agents = require('./../../shared/data-models/agent.js');
var Session = require('./../../shared/data-models/session.js');
var Agent = require('./../../shared/data-models/agent.js');
var Address = require('./../../shared/data-models/address.js');
var Resident = require('./../../shared/data-models/resident.js');
var ContactInfo = require('./../../shared/data-models/contactInfo.js');
var RetrieveQuote = require('./../../shared/data-models/retrieveQuote.js');

var q = require('q');
var request = require('request');

var AOS = function () { };

var AOSTranData = [];

//#region CONSTANTS
var URL_COMMON = "https://purchase-stest.allstate.com/onlinesalesapp-common/";
var URL_RENTERS_SESSIONID = URL_COMMON + "api/transaction/RENTERS/sessionid";
var URL_GETAGENTS = URL_COMMON + "api/common/agents";
var URL_AUTO_SESSIONID = URL_COMMON + "api/transaction/AUTO/sessionid";
var URL_GETSTATE = URL_COMMON + "api/location/{0}/state";
var URL_RENTERS_BASE = "https://purchase-stest.allstate.com/onlinesalesapp-renters/api";
var URL_RENTERS_SAVECUSTOMER = URL_RENTERS_BASE + "/renters/customer";
var URL_RENTERS_RENTERSINFO = URL_RENTERS_BASE + "/renters/renter-information";
var URL_RENTERS_CONFIRMPROFILE = URL_RENTERS_BASE + "/renters/renter-information/confirm-profile";
var URL_RENTERS_SAVEANDEXIT = URL_RENTERS_BASE + "/renters/save-and-exit";
var URL_RENTERS_QUOTEREPOSITORY = URL_COMMON + "api/quote-repository";
var URL_RENTERS_SAVEEXPLICIT = URL_RENTERS_BASE + "/renters/save-explicit";
var URL_RENTERS_RESIDENCEINFO = URL_RENTERS_BASE + "/renters/residence-information";
var URL_RENTERS_ORDERQUOTE = URL_RENTERS_BASE + "/renters/quote";
var URL_RETRIEVEQUOTE = URL_COMMON + "api/quote-repository";

var FROM_EMAIL_ID = "pgoud@gmail.com";
var EMAILRESP = [
    "Sure. what's your email id?",
    "Please provide the email id",
    "Email id please",
    "What's the email id?",
    "please provide email id"
];
var EMAILSENTRESPAGENT = [
    "Email sent.",
    "We have sent an email to you.",
    "We have sent an email to you with agent details.",
    "Agent details has been sent to your mailbox.",
];
var AGENTFINDRESP = [
    "Sure. what's your zip code?",
    "I can help you with that. What's your zip?",
    "Please provide the zip?",
];
//#endregion

//#region PUBLIC AGENT
AOS.prototype.handleAgentFindRequest = function (sessionAttrs) {
    var deferred = q.defer();
    var agentFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.zip) {
        getFinalAgentFindResponse(sessionAttrs)
            .then(function (agentSpeechOutput) {
                agentFindSpeechResp.speechOutput = agentSpeechOutput;
                agentFindSpeechResp.repromptOutput = null;
                agentFindSpeechResp.sessionAttrs = sessionAttrs;
                deferred.resolve(agentFindSpeechResp);
            });
    } else {
        speechOutput.text = Utilities.GetRandomValue(AGENTFINDRESP);
        repromptOutput.text = Utilities.GetRandomValue(AGENTFINDRESP);
        agentFindSpeechResp.speechOutput = speechOutput;
        agentFindSpeechResp.repromptOutput = repromptOutput;
        deferred.resolve(agentFindSpeechResp);
    }

    return deferred.promise;
};

AOS.prototype.handleAgentFindByZipIntent = function (sessionAttrs) {
    var deferred = q.defer();
    var agentFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();


    getFinalAgentFindResponse(sessionAttrs)
        .then(function (agentSpeechOutput) {
            agentFindSpeechResp.speechOutput = agentSpeechOutput;
            agentFindSpeechResp.repromptOutput = agentSpeechOutput;
            agentFindSpeechResp.sessionAttrs = sessionAttrs;
            deferred.resolve(agentFindSpeechResp);
        });

    return deferred.promise;
}

AOS.prototype.handleAgentFindEmailYesIntent = function (sessionAttrs) {
    var deferred = q.defer();
    var agentFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.email) {
        getFinalAgentFindSendEmailResponse(sessionAttrs)
            .then(function (agentSpeechOutput) {
                agentFindSpeechResp.speechOutput = agentSpeechOutput;
                agentFindSpeechResp.repromptOutput = null;
                deferred.resolve(agentFindSpeechResp);
            });
    } else {
        speechOutput.text = Utilities.GetRandomValue(EMAILRESP);
        repromptOutput.text = Utilities.GetRandomValue(EMAILRESP);
        agentFindSpeechResp.speechOutput = speechOutput;
        agentFindSpeechResp.repromptOutput = repromptOutput;
        deferred.resolve(agentFindSpeechResp);
    }


    return deferred.promise;
};

AOS.prototype.handleAgentFindEmailNoIntent = function (sessionAttrs) {
    var deferred = q.defer();
    var agentFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();

    speechOutput.text = "Thank you for chosing Allstate. You are in Good Hands.";
    agentFindSpeechResp.speechOutput = speechOutput;
    agentFindSpeechResp.repromptOutput = null;
    deferred.resolve(agentFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handleAgentFindEmailSendIntent = function (sessionAttrs) {
    var deferred = q.defer();
    var agentFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    getFinalAgentFindSendEmailResponse(sessionAttrs)
        .then(function (agentSpeechOutput) {
            agentFindSpeechResp.speechOutput = agentSpeechOutput;
            agentFindSpeechResp.repromptOutput = null;
            deferred.resolve(agentFindSpeechResp);
        });


    return deferred.promise;

};
//#endregion

//#region PUBLIC RENTERS METHODS

AOS.prototype.handleRentersInsuranceStart = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    speechOutput.text = "Sure thing! I'll just need some basic contact info first. Please tell me your full name.";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
}

AOS.prototype.handleRentersInsuranceName = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.lastName) {
        speechOutput.text = "Hi " + sessionAttrs.firstName + "! What is your birthday.";
        rentersFindSpeechResp.speechOutput = speechOutput;
        rentersFindSpeechResp.repromptOutput = speechOutput;
    } else {
        speechOutput.text = sessionAttrs.firstName + ", please provide last name.";
        rentersFindSpeechResp.speechOutput = speechOutput;
        rentersFindSpeechResp.repromptOutput = speechOutput;
    }
    rentersFindSpeechResp.sessionAttrs = sessionAttrs;
    deferred.resolve(rentersFindSpeechResp);



    return deferred.promise;
}
//Now what's your street address?, or say current location to take current address
AOS.prototype.handleRentersInsuranceDOB = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    speechOutput.text = " And what is your phone number? 10-digits please.";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    rentersFindSpeechResp.sessionAttrs = sessionAttrs;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersEmailAddress = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    rentersFindSpeechResp.contextOut = [];
    speechOutput.text = "Okay, great! Now I need some info on where you live. Please tell me your current street address.";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    rentersFindSpeechResp.sessionAttrs = sessionAttrs;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handleRentersInsuranceCityZip = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.zip.length !== 5) {
        speechOutput.text = "Hmm, let's try that again. Make sure you're entering a valid 5-digit ZIP code.Remember, you can type \"help\" at any time! ";
        rentersFindSpeechResp.speechOutput = speechOutput;
        rentersFindSpeechResp.repromptOutput = speechOutput;
    } else if (sessionAttrs.zip && !sessionAttrs.city) {
        speechOutput.text = sessionAttrs.firstName + ", please provide city.";
        rentersFindSpeechResp.speechOutput = speechOutput;
        rentersFindSpeechResp.repromptOutput = speechOutput;
    } else if (!sessionAttrs.zip && sessionAttrs.city) {
        speechOutput.text = sessionAttrs.firstName + ", please provide zip.";
        rentersFindSpeechResp.speechOutput = speechOutput;
        rentersFindSpeechResp.repromptOutput = speechOutput;
    }
    else if (sessionAttrs.zip && sessionAttrs.city) {
        speechOutput.text = "Is this the address you'd like to insure? ";
        rentersFindSpeechResp.speechOutput = speechOutput;
        rentersFindSpeechResp.repromptOutput = speechOutput;
    }

    rentersFindSpeechResp.sessionAttrs = sessionAttrs;
    deferred.resolve(rentersFindSpeechResp);
    return deferred.promise;
};

AOS.prototype.handleRentersInsuranceInsuredAddrSame = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.IsInsuredAddrSame) {
        getRentersSaveCustomerResponse(sessionAttrs)
            .then(function (saveCustSpeechOutput) {
                rentersFindSpeechResp.speechOutput = saveCustSpeechOutput;
                rentersFindSpeechResp.repromptOutput = speechOutput;
                rentersFindSpeechResp.sessionAttrs = sessionAttrs;
                deferred.resolve(rentersFindSpeechResp);

            });
    } else {
        speechOutput.text = "Is this the address you'd like to insure?";
        rentersFindSpeechResp.speechOutput = speechOutput;
        rentersFindSpeechResp.repromptOutput = speechOutput;
        rentersFindSpeechResp.sessionAttrs = sessionAttrs;
        deferred.resolve(rentersFindSpeechResp);
    }

    return deferred.promise;
};

AOS.prototype.handlerRentersPhoneNumber = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.phoneNumber.length == 10) {
        speechOutput.text = "Before we go any further, I need you to agree to the following: I agree that Allstate can call me at the provided phone number regarding my insurance quote request. I understand the call may be automatically dialed, that my consent is not a condition of any purchase, and that I can revoke my consent at any time. Say OK to authorize.";
    }
    else {
        speechOutput.text = "I don’t think that’s a valid phone number. Please tell me a valid, 10-digit phone number.";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    rentersFindSpeechResp.sessionAttrs = sessionAttrs;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersPhoneNumberAuthorize = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.isAuthorize === "true") {
        speechOutput.text = "Thanks " + sessionAttrs.firstName + "! Please tell me your email address.";
    }
    else {
        speechOutput.text = "you need to authorize to move further so say \"authorize\"";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    rentersFindSpeechResp.sessionAttrs = sessionAttrs;
    deferred.resolve(rentersFindSpeechResp);
    return deferred.promise;
};

AOS.prototype.handleRentersInsuranceAddr = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (!sessionAttrs.addrLine1) {
        speechOutput.text = "Sorry, something didn't quite make sense to me. Make sure you're entering the full street address.Remember, you can type \"help\" at any time!  ";
    }
    else {
        speechOutput.text = "What's the city and ZIP code of your current address? ";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    rentersFindSpeechResp.sessionAttrs = sessionAttrs;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersInsuranceInsuredAddrDiff = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    rentersFindSpeechResp.contextOut = [];
    speechOutput.text = "I see. Would you mind typing the city and ZIP code of the residence you'd like to insure?";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersNewCityZip = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.newzip.length !== 5) {
        speechOutput.text = "Hmm, let's try that again. Make sure you're entering a valid 5-digit ZIP code.Remember, you can type \"help\" at any time! ";
    }
    else {
        speechOutput.text = "Now what is the street address to insure? ";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersDiffAddress = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.IsInsuredAddrSame == false) {
        getRentersSaveCustomerResponse(sessionAttrs)
            .then(function (saveCustSpeechOutput) {
                rentersFindSpeechResp.speechOutput = saveCustSpeechOutput;
                rentersFindSpeechResp.repromptOutput = null;
                rentersFindSpeechResp.sessionAttrs = sessionAttrs;
                deferred.resolve(rentersFindSpeechResp);
            });
    }
    else if (sessionAttrs.IsInsuredAddrSame == false) {
        getRentersSaveCustomerResponse(sessionAttrs)
            .then(function (saveCustSpeechOutput) {
                rentersFindSpeechResp.speechOutput = saveCustSpeechOutput;
                rentersFindSpeechResp.repromptOutput = null;
                rentersFindSpeechResp.sessionAttrs = sessionAttrs;
                deferred.resolve(rentersFindSpeechResp);
            });
    } else {
        speechOutput.text = "Is this the address you'd like to insure?";
        rentersFindSpeechResp.speechOutput = speechOutput;
        rentersFindSpeechResp.repromptOutput = speechOutput;
    }

    return deferred.promise;
};

AOS.prototype.handlerCreditHistoryAuthorize = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.state != "KS") {
        speechOutput.text = "Great! Next I'll need to know a little about your employment status. Are you employed, self employed, unemployed, student, retired, home maker or military";
    }
    else {
        speechOutput.text = "Thanks. Would you like to add a spouse to your quote?";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);
    return deferred.promise;
};

AOS.prototype.handlerRentersEmpStatus = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var sessionInfo = new Session();

    var repromptOutput = new Speech();
    if (sessionAttrs.transactionToken) {
        sessionInfo.sessionId = sessionAttrs.transactionToken.sessionID;
        sessionInfo.state = sessionAttrs.transactionToken.state;
        sessionInfo.zip = sessionAttrs.transactionToken.zipCode;
        getAgents(sessionInfo)
            .then(function (agentDetails) {
                if (agentDetails && agentDetails.length > 0) {
                    sessionAttrs.agentDetails = agentDetails;
                }
                if (sessionAttrs.state != "FL") {
                    speechOutput.text = "What is your gender? ";
                }
                else {
                    speechOutput.text = "Thanks! Have you lived in your residence for more than two years?";
                }
                rentersFindSpeechResp.speechOutput = speechOutput;
                rentersFindSpeechResp.repromptOutput = speechOutput;
                rentersFindSpeechResp.sessionAttrs = sessionAttrs;
                deferred.resolve(rentersFindSpeechResp);
            });
    }
    return deferred.promise;
};

AOS.prototype.handlerRentersGender = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.state != "CA" && sessionAttrs.state != "CT" && sessionAttrs.state != "MD" && sessionAttrs.state != "OR" && sessionAttrs.state != "PA" && sessionAttrs.state != "NY") {
        speechOutput.text = "Thanks. Would you like to add a spouse to your quote? ";
    }
    else {
        speechOutput.text = "Thanks. Now Tell me about your marital status like single, married and lived with spouse, divorced, legally married but separated, widowed, domestic partnership";
    }


    // speechOutput.text = "Thanks. Would you like to add a spouse to your quote? ";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    rentersFindSpeechResp.sessionAttrs = sessionAttrs;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersMeritalStatus = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.maritalstatus == "02" || sessionAttrs.maritalstatus == "08") {
        speechOutput.text = "Thanks. Please give your spouse name ";
    }
    else {
        speechOutput.text = "Thanks! Have you lived in your residence for more than two years? ";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    rentersFindSpeechResp.sessionAttrs = sessionAttrs;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};
AOS.prototype.handlerRentersLivedMoreThanTwoYrsYes = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.transactionToken) {
        getRentersInfoResponse(sessionAttrs)
            .then(function (rentersInfoSpeechOutput) {
                rentersFindSpeechResp.speechOutput = rentersInfoSpeechOutput;
                rentersFindSpeechResp.repromptOutput = null;
                rentersFindSpeechResp.sessionAttrs = sessionAttrs;
                deferred.resolve(rentersFindSpeechResp);
            });
    } else {
        speechOutput.text = "Please login to retrieve quote to see your saved quote. Login details are sent to your registered email id.";
        rentersFindSpeechResp.speechOutput = speechOutput;
        rentersFindSpeechResp.repromptOutput = speechOutput;
    }

    return deferred.promise;
};

AOS.prototype.handlerRentersResidence = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.transactionToken) {
        confirmProfileResponse(sessionAttrs)
            .then(function (confProfileSpeechOutput) {
                rentersFindSpeechResp.speechOutput = confProfileSpeechOutput;
                rentersFindSpeechResp.repromptOutput = null;
                rentersFindSpeechResp.sessionAttrs = sessionAttrs;
                deferred.resolve(rentersFindSpeechResp);
            });
    } else {
        speechOutput.text = "Please login to retrieve quote to see your saved quote. Login details are sent to your registered email id.";
        rentersFindSpeechResp.speechOutput = speechOutput;
        rentersFindSpeechResp.repromptOutput = speechOutput;
    }

    return deferred.promise;
};

AOS.prototype.handlerRentersLivedMoreThanTwoYrsNo = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    speechOutput.text = "Okay, What's the CITY and ZIP code of your previous address?";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersPrevCityZip = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.prevzip && sessionAttrs.transactionToken) {
        getStateFromZip(sessionAttrs.transactionToken.sessionID, sessionAttrs.prevzip)
            .then(function (state) {
                sessionAttrs.prevstate = state;
                speechOutput.text = "Got it. Could you type your previous address below? ";
                rentersFindSpeechResp.speechOutput = speechOutput;
                rentersFindSpeechResp.repromptOutput = speechOutput;
                rentersFindSpeechResp.sessionAttrs = sessionAttrs;
                deferred.resolve(rentersFindSpeechResp);
            });
    }
    else {
        speechOutput.text = "Prevous address is not valid. Please provide valid city and zipcode";
        rentersFindSpeechResp.speechOutput = speechOutput;
        rentersFindSpeechResp.repromptOutput = speechOutput;
        deferred.resolve(rentersFindSpeechResp);
    }
    return deferred.promise;
};

AOS.prototype.handlerRentersPrevStreetAddrs = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.transactionToken) {
        getRentersInfoResponse(sessionAttrs)
            .then(function (rentersInfoSpeechOutput) {
                rentersFindSpeechResp.speechOutput = rentersInfoSpeechOutput;
                rentersFindSpeechResp.repromptOutput = null;
                rentersFindSpeechResp.sessionAttrs = sessionAttrs;
                deferred.resolve(rentersFindSpeechResp);
            });
    } else {
        speechOutput.text = "Please login to retrieve quote to see your saved quote. Login details are sent to your registered email id.";
        rentersFindSpeechResp.speechOutput = speechOutput;
        rentersFindSpeechResp.repromptOutput = speechOutput;
    }

    return deferred.promise;
};

AOS.prototype.handlerAOSRentersIsSpouseYes = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    speechOutput.text = "Sure thing! I'll just need some basic info first. Please give your spouse's full name.";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);
    return deferred.promise;
};

AOS.prototype.handleRentersSpouseInsuranceName = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.spouselastName) {
        speechOutput.text = "What is " + sessionAttrs.spouseName + "'s birthday?";
        rentersFindSpeechResp.speechOutput = speechOutput;
        rentersFindSpeechResp.repromptOutput = speechOutput;
    } else {
        speechOutput.text = sessionAttrs.spouseName + ", please provide your spouse's last name.";
        rentersFindSpeechResp.speechOutput = speechOutput;
        rentersFindSpeechResp.repromptOutput = speechOutput;
    }
    deferred.resolve(rentersFindSpeechResp);
    return deferred.promise;
};

AOS.prototype.handleRentersSpouseInsuranceDOB = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    speechOutput.text = "Great! I would need to know a little about your spouse's employment status. Like employed, self employed, unemployed, student, retired, home maker or military";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersSpouseEmpStatus = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    speechOutput.text = "Your spouse’s gender? ";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersSpouseGender = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    speechOutput.text = "Thanks! Have you lived in your residence for more than two years? ";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerAOSRentersIsSpouseNo = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    speechOutput.text = "OK! Have you lived in your residence for more than two years? ";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersIsPrimaryResYes = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    speechOutput.text = "Sounds good! I'll just need a few more details. Are you located in a dorm, military barracks, farm or assisted living facility? ";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersIsPrimaryResNo = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs && sessionAttrs.agentDetails) {
        speechOutput.text = "Okay! Sounds like this may be a job for one of our agents. Here are a few agents close to you: ";
    }
    else {
        speechOutput.text = "Okay! Sounds like this may be a job for one of our agents. ";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersResidenceLocYes = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs && sessionAttrs.agentDetails) {
        speechOutput.text = "Okay! Sounds like this may be a job for one of our agents. Here are a few agents close to you: ";
    }
    else {
        speechOutput.text = "Okay! Sounds like this may be a job for one of our agents. ";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersResidenceLocNo = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    speechOutput.text = "Alright. Do you operate a business out of your residence? ";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersIsBusinessOperatedYes = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs && sessionAttrs.agentDetails) {
        speechOutput.text = "Okay! Sounds like this may be a job for one of our agents. Here are a few agents close to you: ";
    }
    else {
        speechOutput.text = "Okay! Sounds like this may be a job for one of our agents. ";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersIsBusinessOperatedNo = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    speechOutput.text = "Great. Now, what type of residence are we talking about? You can choose from Apartment, Townhouse, Condo, House, Manufactured/Mobile Home ";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersResidenceType = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    speechOutput.text = "Are there more than 4 units in the building? ";
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersResidenceHomeType = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    speechOutput = stateSPecificQuestionOne(sessionAttrs, speechOutput);
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersIsFiveOrMoreUnitsYes = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    speechOutput = stateSPecificQuestionOne(sessionAttrs, speechOutput);
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersIsFiveOrMoreUnitsNo = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    speechOutput = stateSPecificQuestionOne(sessionAttrs, speechOutput);
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersStSpecQuestionOne = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.state === "CA") {
        speechOutput.text = "Ok. Is your residence regularly unoccupied for 24 hours or more? ";
    }
    else if (sessionAttrs.state === "CT") {
        if (sessionAttrs && sessionAttrs.agentDetails && sessionAttrs.stateSpecQOneAns === "true") {
            speechOutput.text = "Okay! Sounds like this may be a job for one of our agents. Here are a few agents close to you: ";
        }
        else {
            speechOutput.text = "Alright do you have any dogs? ";
        }
    }
    else if (sessionAttrs.state === "AL" || sessionAttrs.state === "LA" || sessionAttrs.state === "SC") {
        sessionAttrs.withInCityLimit = sessionAttrs.stateSpecQOneAns;
        speechOutput.text = "Does your property have any of the protective devices like Smoke Detectors, Fire Extinguishers, Deadbolt Locks, Central Fire Alarm, Fire Sprinklers, 24-Hour Manned Security, Central Burglar Alarm that reports to a monitoring center, Burglar Alarm that sounds in the home";
    }
    else if (sessionAttrs.state === "CO" || sessionAttrs.state === "GA" || sessionAttrs.state === "ID" || sessionAttrs.state === "ME" || sessionAttrs.state === "MD" ||
        sessionAttrs.state === "NV" || sessionAttrs.state === "NH" || sessionAttrs.state === "WI") {
        speechOutput.text = "Have you had property insurance for at least 1 year?";
    }
    else if (sessionAttrs.state === "AR" || sessionAttrs.state === "IN" || sessionAttrs.state === "IA" || sessionAttrs.state === "MI" || sessionAttrs.state == "NE" ||
        sessionAttrs.state === "RI" || sessionAttrs.state === "UT" || sessionAttrs.state === "VA" || sessionAttrs.state === "WV" || sessionAttrs.state === "MS" || sessionAttrs.state === "DE" ||
        sessionAttrs.state == "VT" || sessionAttrs.state === "NM" || sessionAttrs.state === "NY" || sessionAttrs.state === "NC" || sessionAttrs.state === "TN" || sessionAttrs.state === "OK") {
        speechOutput.text = "Got it, have you filed any claims in the last 3 years?";
    }
    else if (sessionAttrs.state == "MA" || sessionAttrs.state == "AK" || sessionAttrs.state == "DC" || sessionAttrs.state == "ND" ||
        sessionAttrs.state == "SD" || sessionAttrs.state == "HI" || sessionAttrs.state == "MT") {
        sessionAttrs.propertyInsuranceClaims = sessionAttrs.stateSpecQOneAns.toUpperCase();
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            speechOutput.text = "Okay. I need to know date and type of the claim. Claim can be Fire, Theft, Liability, Vandalism, Water or other. "
        }
        else if (sessionAttrs.state == "MA" || sessionAttrs.state == "AK" || sessionAttrs.state == "DC" || sessionAttrs.state == "ND" ||
            sessionAttrs.state == "SD" || sessionAttrs.state == "HI" || sessionAttrs.state == "MT") {
            speechOutput.text = "Alright! Do you have any dogs? "
        }
    }
    else if (sessionAttrs.state == "WY" || sessionAttrs.state === "DE") {
        sessionAttrs.isResidenceWithinThousandFtFromCoast = sessionAttrs.stateSpecQOneAns;
        if (sessionAttrs.isResidenceWithinThousandFtFromCoast === "false" && sessionAttrs.state === "DE") {
            speechOutput.text = "Alright, Do you have any dogs?";
        }
        else {
            speechOutput.text = "Alright, Do you have any dogs?";
        }
    }
    else if (sessionAttrs.state == "NJ" || sessionAttrs.state == "TX") {
        sessionAttrs.constructionType = sessionAttrs.constructionType;
        if (sessionAttrs.state == "NJ") {
            speechOutput.text = "Alright, Do you have any dogs?";
        }
    }
    else if (sessionAttrs.state == "PA") {
        sessionAttrs.isDogAdded = sessionAttrs.stateSpecQOneAns;
        if (sessionAttrs.isDogAdded === "true") {
            speechOutput.text = "Please list the dominant breed of your dog or dogs.";
        }
    }
    if (!speechOutput.text) {
        speechOutput.text = "Got it. Just one more question. What is the estimated value of all personal items in your residence?";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersStSpecQuestionTwo = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.state === "CA") {
        sessionAttrs.unOccupiedResidence = sessionAttrs.stateSpecQTwoAns;
        speechOutput.text = "Does your property have any of the following protective devices?Smoke Detectors, Fire Extinguishers, Deadbolt Locks, Central Fire Alarm, Fire Sprinklers, 24-Hour Manned Security, Central Burglar Alarm that reports to a monitoring center, Burglar Alarm that sounds in the home";
    }
    else if (sessionAttrs.state === "CT") {
        sessionAttrs.isResidence2600ftFromCoastVisible = sessionAttrs.stateSpecQOneAns;
        if (sessionAttrs && sessionAttrs.isResidence2600ftFromCoastVisible === "false") {
            sessionAttrs.isDogAdded = sessionAttrs.stateSpecQTwoAns;
            if (sessionAttrs.isDogAdded === "true") {
                speechOutput.text = "Please list the dominant breed of your dog or dogs";
            }
        }
    }
    else if (sessionAttrs.state === "AL" || sessionAttrs.state === "CO" || sessionAttrs.state === "GA" || sessionAttrs.state === "ID" ||
        sessionAttrs.state === "LA" || sessionAttrs.state === "ME" || sessionAttrs.state === "MD" ||
        sessionAttrs.state === "NV" || sessionAttrs.state === "NH" || sessionAttrs.state === "SC" || sessionAttrs.state === "WI") {
        speechOutput.text = "Have you filed any claims in the last 3 years?";
    }
    else if (sessionAttrs.state === "AR" || sessionAttrs.state === "IN" || sessionAttrs.state === "IA" || sessionAttrs.state === "MI" || sessionAttrs.state == "NE" ||
        sessionAttrs.state === "RI" || sessionAttrs.state === "UT" || sessionAttrs.state === "VA" || sessionAttrs.state === "WV" || sessionAttrs.state === "MS" ||
        sessionAttrs.state == "VT" || sessionAttrs.state === "DE" ||
        sessionAttrs.state === "NM" || sessionAttrs.state === "NY" || sessionAttrs.state === "NC" || sessionAttrs.state === "TN" || sessionAttrs.state === "OK") {
        if (sessionAttrs.stateSpecQTwoAns) {
            sessionAttrs.propertyInsuranceClaims = sessionAttrs.stateSpecQTwoAns.toUpperCase();
        }
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            speechOutput.text = "Okay. I need to know date and type of the claim. Claim can be Fire, Theft, Liability, Vandalism, Water or other. "
        }
        else {
            if (sessionAttrs.state === "IN" || sessionAttrs.state === "IA" || sessionAttrs.state === "RI" || sessionAttrs.state === "VA" || sessionAttrs.state === "WV" ||
                sessionAttrs.state === "TN" || sessionAttrs.state == "NE" || sessionAttrs.state == "VT" || sessionAttrs.state === "DE") {
                speechOutput.text = "Alright, Do you have any dogs?";
            }
            else if (sessionAttrs.state === "NY") {
                speechOutput.text = "Are there any additional residents?";
            }
        }
    }
    else if (sessionAttrs.state === "MA" || sessionAttrs.state === "NJ") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            speechOutput.text = "And lost location is same as current insured address? ";
        }
        else if (sessionAttrs.state === "MA" || sessionAttrs.state === "NJ") {
            sessionAttrs.isDogAdded = sessionAttrs.stateSpecQTwoAns;
            if (sessionAttrs.isDogAdded === "true") {
                speechOutput.text = "Please list the dominant breed of your dog or dogs.";
            }
        }
    }
    else if (sessionAttrs.state == "AK" || sessionAttrs.state == "DC" || sessionAttrs.state == "ND" ||
        sessionAttrs.state == "SD" || sessionAttrs.state == "HI" || sessionAttrs.state == "MT") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            speechOutput.text = "Alright, Do you have any dogs? ";
        }
        else {
            sessionAttrs.isDogAdded = sessionAttrs.stateSpecQTwoAns;
            if (sessionAttrs.isDogAdded === "true") {
                speechOutput.text = "Please list the dominant breed of your dog or dogs.";
            }
        }
    }
    else if (sessionAttrs.state === "DE" || sessionAttrs.state === "NE" || sessionAttrs.state === "WY" || sessionAttrs.state == "VT") {
        sessionAttrs.isDogAdded = sessionAttrs.stateSpecQTwoAns;
        if (sessionAttrs.isDogAdded === "true") {
            speechOutput.text = "Please list the dominant breed of your dog or dogs.";
        }
    }
    if (sessionAttrs.state === "MA" || sessionAttrs.state === "AK" || sessionAttrs.state === "DC" || sessionAttrs.state == "ND" ||
        sessionAttrs.state == "SD" || sessionAttrs.state == "HI" || sessionAttrs.state == "MT") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            sessionAttrs.claimLostDate = sessionAttrs.lossdate;
            sessionAttrs.claimLostType = sessionAttrs.losstype;
            sessionAttrs.claimLostDescription = sessionAttrs.lossDescription;
        }
    }
    if (!speechOutput.text) {
        speechOutput.text = "Got it. Just one more question. What is the estimated value of all personal items in your residence?";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersStSpecQuestionThree = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.state === "CA") {
        speechOutput.text = "Have you filed any claims in the last 3 years";
    }
    else if (sessionAttrs.state === "AL" || sessionAttrs.state === "CO" || sessionAttrs.state === "GA" || sessionAttrs.state === "ID" || sessionAttrs.state === "LA" ||
        sessionAttrs.state === "ME" || sessionAttrs.state === "MD" || sessionAttrs.state === "NV" || sessionAttrs.state === "NH" || sessionAttrs.state === "SC" ||
        sessionAttrs.state === "WI") {
        if (sessionAttrs.stateSpecQThreeAns) {
            sessionAttrs.propertyInsuranceClaims = sessionAttrs.stateSpecQThreeAns.toUpperCase();
        }
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            speechOutput.text = "Okay. I need to know date and type of the claim. Claim can be Fire, Theft, Liability, Vandalism, Water or other. ";
        }
        else {
            if (sessionAttrs.state === "CO" || sessionAttrs.state === "ID" || sessionAttrs.state === "ME" || sessionAttrs.state === "NH") {
                speechOutput.text = "Alright, Do you have any dogs?";
            }
            if (sessionAttrs.state === "MD") {
                //sessionAttrs.propertyInsuranceClaims == session
                speechOutput.text = "Are there any additional residents?";
            }
        }
    }
    else if (sessionAttrs.state === "IN" || sessionAttrs.state === "IA" || sessionAttrs.state === "MA" ||
        sessionAttrs.state === "RI" || sessionAttrs.state === "VA" || sessionAttrs.state === "WV" ||
        sessionAttrs.state === "NM" || sessionAttrs.state === "NY" || sessionAttrs.state === "TN" || sessionAttrs.state === "NE" || sessionAttrs.state === "VT") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            if (sessionAttrs.state === "IN" || sessionAttrs.state === "IA" || sessionAttrs.state === "RI" || sessionAttrs.state === "VA" || sessionAttrs.state === "WV" ||
                sessionAttrs.state === "TN" || sessionAttrs.state === "MA" || sessionAttrs.state == "NE" || sessionAttrs.state == "VT" || sessionAttrs.state === "DE") {
                speechOutput.text = "Alright, Do you have any dogs?";
            }
            else if (sessionAttrs.state === "NY") {
                speechOutput.text = "Are there any additional residents?";
            }
            if (sessionAttrs.state === "MA") {
                var isInsuredAddress = sessionAttrs.stateSpecQThreeAns;
                if (isInsuredAddress === "true") {
                    sessionAttrs.claimLostLocationDisplay = sessionAttrs.addrLine1 + ", " + sessionAttrs.city + ", " + sessionAttrs.state + " " + sessionAttrs.zip;
                    sessionAttrs.claimLostLocation = "AI";
                }
                else {
                    sessionAttrs.claimLostLocationDisplay = "Other";
                    sessionAttrs.claimLostLocation = "OT";
                }
            }
        }
        else {
            if (sessionAttrs.state === "IN" || sessionAttrs.state === "IA" || sessionAttrs.state === "RI" || sessionAttrs.state === "VA" || sessionAttrs.state === "WV" ||
                sessionAttrs.state === "TN" || sessionAttrs.state == "NE" || sessionAttrs.state == "VT" || sessionAttrs.state === "DE") {
                sessionAttrs.isDogAdded = sessionAttrs.stateSpecQThreeAns;
                if (sessionAttrs.isDogAdded === "true") {
                    speechOutput.text = "Please list the dominant breed of your dog or dogs.";
                }
            }
            else if (sessionAttrs.state === "NY") {
                sessionAttrs.additionalResidents = sessionAttrs.stateSpecQThreeAns;
                if (sessionAttrs.additionalResidents === "true") {
                    speechOutput.text = "Got it! Please provide their name, relationship, age, employment and marital status.";
                }
                else {
                    speechOutput.text = "Alright, Do you have any dogs?";
                }
            }
        }
    }
    else if (sessionAttrs.state == "AK" || sessionAttrs.state == "DC" || sessionAttrs.state === "DC" || sessionAttrs.state == "ND" ||
        sessionAttrs.state == "SD" || sessionAttrs.state == "HI" || sessionAttrs.state == "MT") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            sessionAttrs.isDogAdded = sessionAttrs.stateSpecQThreeAns;
            if (sessionAttrs.isDogAdded === "true") {
                speechOutput.text = "Please list the dominant breed of your dog or dogs.";
            }
        }
    }
    if (sessionAttrs.state === "AR" || sessionAttrs.state === "IN" || sessionAttrs.state === "IA" || sessionAttrs.state === "MA" || sessionAttrs.state === "MI" ||
        sessionAttrs.state === "OK" || sessionAttrs.state === "RI" || sessionAttrs.state === "UT" || sessionAttrs.state === "VA" || sessionAttrs.state === "WV" ||
        sessionAttrs.state === "MS" || sessionAttrs.state === "NM" || sessionAttrs.state === "NY" || sessionAttrs.state === "NC" || sessionAttrs.state == "NE" ||
        sessionAttrs.state === "TN" || sessionAttrs.state === "AK" || sessionAttrs.state === "DC" || sessionAttrs.state == "ND" ||
        sessionAttrs.state == "SD" || sessionAttrs.state == "HI" || sessionAttrs.state == "MT" || sessionAttrs.state == "VT") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE" && sessionAttrs.lossDescription) {
            sessionAttrs.claimLostDate = sessionAttrs.lossdate;
            sessionAttrs.claimLostType = sessionAttrs.losstype;
            sessionAttrs.claimLostDescription = sessionAttrs.lossDescription;

        }
    }
    if (!speechOutput.text) {
        speechOutput.text = "Got it. Just one more question. What is the estimated value of all personal items in your residence?";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersStSpecQuestionFour = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.state === "CA") {
        sessionAttrs.propertyInsuranceClaims = sessionAttrs.stateSpecQFourAns.toUpperCase();
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            speechOutput.text = "Okay. I'll need to know the date and type of claim like fire, theft, liability, vandalism water or other type of claim.";
        }
        else {
            speechOutput.text = "Alright, Do you have any dogs?";
        }
    }
    else if (sessionAttrs.state === "CO" || sessionAttrs.state === "ID" ||
        sessionAttrs.state === "ME" || sessionAttrs.state === "MD" || sessionAttrs.state === "NH") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            if (sessionAttrs.state === "MD") {
                speechOutput.text = "Are there any additional residents?";
            }
            else {
                speechOutput.text = "Alright, Do you have any dogs? ";
            }
        }
        else {
            if (sessionAttrs.state === "MD") {
                sessionAttrs.additionalResidents = sessionAttrs.stateSpecQFourAns;
                if (sessionAttrs.additionalResidents === "true") {
                    speechOutput.text = "Got it! Please provide their name, relationship, age, employment and marital status.";
                }
                else {
                    speechOutput.text = "Alright, Do you have any dogs?";
                }
            }
            if (sessionAttrs.state === "CO" || sessionAttrs.state === "ID" || sessionAttrs.state === "ME" || sessionAttrs.state === "NH") {
                sessionAttrs.isDogAdded = sessionAttrs.stateSpecQFourAns;
                if (sessionAttrs.isDogAdded === "true") {
                    speechOutput.text = "Please list the dominant breed of your dog or dogs.";
                }
            }
        }
    }
    else if (sessionAttrs.state === "IN" || sessionAttrs.state === "IA" || sessionAttrs.state === "MA" || sessionAttrs.state == "VT" ||
        sessionAttrs.state === "RI" || sessionAttrs.state === "VA" || sessionAttrs.state === "WV" || sessionAttrs.state == "NE" ||
        sessionAttrs.state === "NM" || sessionAttrs.state === "NY" || sessionAttrs.state === "TN") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            sessionAttrs.isDogAdded = sessionAttrs.stateSpecQFourAns;
            if (sessionAttrs.state === "MA" || sessionAttrs.state === "MA") {
                if (sessionAttrs.isDogAdded === "true") {
                    speechOutput.text = "Please list the dominant breed of your dog or dogs.";
                }
            }
            else if (sessionAttrs.state === "IN" || sessionAttrs.state === "IA" || sessionAttrs.state === "RI" || sessionAttrs.state === "VA" || sessionAttrs.state === "WV" ||
                sessionAttrs.state === "TN" || sessionAttrs.state == "NE" || sessionAttrs.state == "VT" || sessionAttrs.state === "DE") {
                if (sessionAttrs.isDogAdded === "true") {
                    speechOutput.text = "Please list the dominant breed of your dog or dogs.";
                }
            }
            else if (sessionAttrs.state === "NY") {
                if (!sessionAttrs.additionalResidents) {
                    sessionAttrs.additionalResidents = sessionAttrs.stateSpecQFourAns;
                }
                if (sessionAttrs.additionalResidents === "true") {
                    speechOutput.text = "Got it! Please provide their name, relationship, age, employment and marital status. ";
                }
                else {
                    speechOutput.text = "Alright, Do you have any dogs? ";
                }
            }
        }
        else {
            sessionAttrs.isDogAdded = sessionAttrs.stateSpecQFourAns;
            if (sessionAttrs.state === "NY") {
                if (sessionAttrs.additionalResidents === "true") {
                    speechOutput.text = "Alright, Do you have any dogs?";
                }
                else {
                    if (sessionAttrs.isDogAdded === "true") {
                        speechOutput.text = "Please list the dominant breed of your dog or dogs.";
                    }
                }
            }
        }
    }
    if (sessionAttrs.state === "AL" || sessionAttrs.state === "CO" || sessionAttrs.state === "GA" || sessionAttrs.state === "ID" || sessionAttrs.state === "LA" ||
        sessionAttrs.state === "ME" || sessionAttrs.state === "MD" || sessionAttrs.state === "NV" || sessionAttrs.state === "NH" || sessionAttrs.state === "SC" ||
        sessionAttrs.state === "WI") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            sessionAttrs.claimLostDate = sessionAttrs.lossdate;
            sessionAttrs.claimLostType = sessionAttrs.losstype;
            sessionAttrs.claimLostDescription = sessionAttrs.lossDescription;
        }
    }

    if (!speechOutput.text) {
        speechOutput.text = "Got it. Just one more question. What is the estimated value of all personal items in your residence?";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersStSpecQuestionFive = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.state === "CA") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            sessionAttrs.claimLostDate = sessionAttrs.lossdate;
            sessionAttrs.claimLostType = sessionAttrs.losstype;
            sessionAttrs.claimLostDescription = sessionAttrs.lossDescription;
            speechOutput.text = "Alright, Do you have any dogs?";
        }
        else {
            sessionAttrs.isDogAdded = sessionAttrs.stateSpecQFiveAns;
            if (sessionAttrs.isDogAdded === "true") {
                speechOutput.text = "Please list the dominant breed of your dog or dogs.";
            }
        }
    }
    else if (sessionAttrs.state === "CO" || sessionAttrs.state === "ID" ||
        sessionAttrs.state === "ME" || sessionAttrs.state === "MD" || sessionAttrs.state === "NH" || sessionAttrs.state === "NY") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            sessionAttrs.isDogAdded = sessionAttrs.stateSpecQFiveAns;
            if (sessionAttrs.state === "MD") {
                sessionAttrs.additionalResidents = sessionAttrs.stateSpecQFiveAns;
                if (sessionAttrs.additionalResidents === "true") {
                    speechOutput.text = "Got it! Please provide their name, relationship, age, employment and marital status.";
                }
                else {
                    speechOutput.text = "Alright, Do you have any dogs?";
                }
            }
            else if (sessionAttrs.state === "NY") {
                if (sessionAttrs.additionalResidents === "true") {
                    speechOutput.text = "Alright, Do you have any dogs?";
                }
                else {
                    if (sessionAttrs.isDogAdded === "true") {
                        speechOutput.text = "Please list the dominant breed of your dog or dogs.";
                    }
                }
            }
            else {
                if (sessionAttrs.isDogAdded === "true") {
                    speechOutput.text = "Please list the dominant breed of your dog or dogs.";
                }
            }
        }
        else {
            if (sessionAttrs.state === "MD") {
                sessionAttrs.additionalResidents = sessionAttrs.stateSpecQFourAns;
                if (sessionAttrs.additionalResidents === "true") {
                    speechOutput.text = "Alright, Do you have any dogs?";
                }
                else {
                    sessionAttrs.isDogAdded = sessionAttrs.stateSpecQFiveAns;
                    if (sessionAttrs.isDogAdded === "true") {
                        speechOutput.text = "Please list the dominant breed of your dog or dogs.";
                    }
                }
            }
            else if (sessionAttrs.state === "NY") {
                if (sessionAttrs.additionalResidents === "true") {
                    if (sessionAttrs.isDogAdded === "true") {
                        speechOutput.text = "Please list the dominant breed of your dog or dogs.";
                    }
                }
            }
        }
    }
    else if (sessionAttrs.state === "NY") {
        if (sessionAttrs.additionalResidents === "true") {
            speechOutput.text = "Alright, Do you have any dogs? ";
        }
    }
    if (!speechOutput.text) {
        speechOutput.text = "Got it. Just one more question. What is the estimated value of all personal items in your residence?";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersStSpecQuestionSix = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.state === "CA") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            sessionAttrs.isDogAdded = sessionAttrs.stateSpecQSixAns;
            if (sessionAttrs.isDogAdded === "true") {
                speechOutput.text = "Please list the dominant breed of your dog or dogs.";
            }
        }
    }
    else if (sessionAttrs.state === "MD") {
        if (sessionAttrs.stateSpecQSixAns) {
            sessionAttrs.isDogAdded = sessionAttrs.stateSpecQSixAns;
        }
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            if (sessionAttrs.state === "MD") {
                if (sessionAttrs.additionalResidents === "true") {
                    speechOutput.text = "Alright, Do you have any dogs?";
                }
                else {
                    if (sessionAttrs.isDogAdded === "true") {
                        speechOutput.text = "Please list the dominant breed of your dog or dogs.";
                    }
                }
            }
        }
        else {
            if (sessionAttrs.state === "MD") {
                if (sessionAttrs.additionalResidents === "true") {
                    if (sessionAttrs.isDogAdded === "true") {
                        speechOutput.text = "Please list the dominant breed of your dog or dogs.";
                    }
                }
            }
        }
    }
    else if (sessionAttrs.state === "NY") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE" && sessionAttrs.additionalResidents === "true") {
            if (sessionAttrs.isDogAdded === "true") {
                speechOutput.text = "Please list the dominant breed of your dog or dogs.";
            }
        }
    }
    if (!speechOutput.text) {
        speechOutput.text = "Got it. Just one more question. What is the estimated value of all personal items in your residence?";
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersStSpecQuestionSeven = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.state === "CA" || sessionAttrs.state === "MD" || sessionAttrs.state === "NY") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            if (sessionAttrs.state === "MD") {
                if (sessionAttrs.additionalResidents === "true") {
                    if (sessionAttrs.isDogAdded === "true") {
                        speechOutput.text = "Please list the dominant breed of your dog or dogs.";
                    }
                }
                else {
                    speechOutput.text = "Got it. Just one more question. What is the estimated value of all personal items in your residence?";
                }
            }
            else {
                if (!speechOutput.text) {
                    speechOutput.text = "Got it. Just one more question. What is the estimated value of all personal items in your residence?";
                }
            }
        }
    }
    else {
        if (sessionAttrs.transactionToken) {
            getRentersQuoteResponse(sessionAttrs)
                .then(function (quoteDetailsSpeechOutput) {
                    rentersQuoteSpeechResp.speechOutput = quoteDetailsSpeechOutput;
                    rentersQuoteSpeechResp.repromptOutput = null;
                    rentersQuoteSpeechResp.sessionAttrs = sessionAttrs;
                    deferred.resolve(rentersQuoteSpeechResp);
                });
        } else {
            speechOutput.text = "Please login to retrieve quote to see your saved quote. Login details are sent to your registered email id.";
        }
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersStSpecQuestionEight = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.state === "MD") {
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            if (sessionAttrs.state === "MD") {
                if (sessionAttrs.additionalResidents === "true") {
                    if (sessionAttrs.isDogAdded === "true") {
                        speechOutput.text = "Got it. Just one more question. What is the estimated value of all personal items in your residence?";
                        rentersFindSpeechResp.speechOutput = speechOutput;
                        rentersFindSpeechResp.repromptOutput = speechOutput;
                    }
                }
            }
        }

    }
    else {
        if (sessionAttrs.transactionToken) {
            getRentersQuoteResponse(sessionAttrs)
                .then(function (quoteDetailsSpeechOutput) {
                    rentersQuoteSpeechResp.speechOutput = quoteDetailsSpeechOutput;
                    rentersQuoteSpeechResp.repromptOutput = null;
                    rentersQuoteSpeechResp.sessionAttrs = sessionAttrs;
                    deferred.resolve(rentersQuoteSpeechResp);
                });
        } else {
            speechOutput.text = "Please login to retrieve quote to see your saved quote. Login details are sent to your registered email id.";

        }
    }
    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handlerRentersPersonalItemsValue = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersQuoteSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.transactionToken) {
        getRentersQuoteResponse(sessionAttrs)
            .then(function (quoteDetailsSpeechOutput) {
                rentersQuoteSpeechResp.speechOutput = quoteDetailsSpeechOutput;
                rentersQuoteSpeechResp.repromptOutput = null;
                rentersQuoteSpeechResp.sessionAttrs = sessionAttrs;
                deferred.resolve(rentersQuoteSpeechResp);
            });
    } else {
        speechOutput.text = "Please login to retrieve quote to see your saved quote. Login details are sent to your registered email id.";
        rentersQuoteSpeechResp.speechOutput = speechOutput;
        rentersQuoteSpeechResp.repromptOutput = speechOutput;
    }

    return deferred.promise;
};

AOS.prototype.handlerRenterValidCustomer = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersQuoteSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.transactionToken) {
        if (sessionAttrs.isValidRenterCustomer) {
            quoteResponse(sessionAttrs)
                .then(function (quoteDetailsSpeechOutput) {
                    rentersQuoteSpeechResp.speechOutput = quoteDetailsSpeechOutput;
                    rentersQuoteSpeechResp.repromptOutput = null;
                    rentersQuoteSpeechResp.sessionAttrs = sessionAttrs;
                    deferred.resolve(rentersQuoteSpeechResp);
                });
        }
        else {
            speechOutput.text = "Thank you for the inputs, Near by agent will contact you for further information";
            rentersQuoteSpeechResp.speechOutput = speechOutput;
            rentersQuoteSpeechResp.repromptOutput = speechOutput;
            rentersQuoteSpeechResp.sessionAttrs = sessionAttrs;
        }

    } else {
        speechOutput.text = "Thank you for the inputs, Near by agent will contact you for further information";
        rentersQuoteSpeechResp.speechOutput = speechOutput;
        rentersQuoteSpeechResp.repromptOutput = speechOutput;
    }

    return deferred.promise;
};

AOS.prototype.handlerRenterSaveQuoteYes = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersQuoteSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.transactionToken) {
        if (sessionAttrs.isValidRenterCustomer) {
            saveAndExitResponse(sessionAttrs)
                .then(function (quoteDetailsSpeechOutput) {
                    rentersQuoteSpeechResp.speechOutput = quoteDetailsSpeechOutput;
                    rentersQuoteSpeechResp.repromptOutput = null;
                    rentersQuoteSpeechResp.sessionAttrs = sessionAttrs;
                    deferred.resolve(rentersQuoteSpeechResp);
                });
        }
        else {
            speechOutput.text = "There are issues for saving the quote. Please contact near by agent.";
            rentersQuoteSpeechResp.speechOutput = speechOutput;
            rentersQuoteSpeechResp.repromptOutput = speechOutput;
        }

    } else {
        speechOutput.text = "Please login to retrieve quote to see your saved quote. Login details are sent to your registered email id.";
        rentersQuoteSpeechResp.speechOutput = speechOutput;
        rentersQuoteSpeechResp.repromptOutput = speechOutput;
    }

    return deferred.promise;
};

AOS.prototype.handlerRenterGenerateURL = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersQuoteSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.transactionToken) {
        if (sessionAttrs.isValidRenterCustomer) {
            quoteLandingURLResponse(sessionAttrs)
                .then(function (quoteDetailsSpeechOutput) {
                    rentersQuoteSpeechResp.speechOutput = quoteDetailsSpeechOutput;
                    rentersQuoteSpeechResp.repromptOutput = null;
                    rentersQuoteSpeechResp.sessionAttrs = sessionAttrs;
                    deferred.resolve(rentersQuoteSpeechResp);
                });
        }
        else {
            speechOutput.text = "There are issues for generating URL. Please contact near by agent.";
            rentersQuoteSpeechResp.speechOutput = speechOutput;
            rentersQuoteSpeechResp.repromptOutput = speechOutput;
        }

    } else {
        speechOutput.text = "Please login to retrieve quote to see your saved quote. Login details are sent to your registered email id.";
        rentersQuoteSpeechResp.speechOutput = speechOutput;
        rentersQuoteSpeechResp.repromptOutput = speechOutput;
    }

    return deferred.promise;
};

AOS.prototype.handlerRenterSaveQuoteNo = function (sessionAttrs) {
    var deferred = q.defer();
    var rentersFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs && sessionAttrs.agentDetails) {
        speechOutput.text = "Okay! Sounds like this may be a job for one of our agents. Here are a few agents close to you: ";
    }
    else {
        speechOutput.text = "Please type help for assistance or type menu for menu options";
    }

    rentersFindSpeechResp.speechOutput = speechOutput;
    rentersFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(rentersFindSpeechResp);

    return deferred.promise;
};
//#endregion

//#region PUBLIC RETRIEVEQUOTE
AOS.prototype.handleRetrieveQuoteStart = function (sessionAttrs) {
    var deferred = q.defer();
    var retrieveFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    speechOutput.text = "Sure.!! I'll just need some basic contact info first. What is your last name.";
    retrieveFindSpeechResp.speechOutput = speechOutput;
    retrieveFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(retrieveFindSpeechResp);

    return deferred.promise;
}

AOS.prototype.handleRetrieveQuoteLastName = function (sessionAttrs) {
    var deferred = q.defer();
    var retrieveSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    speechOutput.text = "Now, I need your date of birth.";
    retrieveSpeechResp.speechOutput = speechOutput;
    retrieveSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(retrieveSpeechResp);

    return deferred.promise;
}

AOS.prototype.handleRetrieveQuoteDOB = function (sessionAttrs) {
    var deferred = q.defer();
    var retrieveFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    speechOutput.text = "great, your email address please";
    retrieveFindSpeechResp.speechOutput = speechOutput;
    retrieveFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(retrieveFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handleRetrieveQuoteEmail = function (sessionAttrs) {
    var deferred = q.defer();
    var retrieveFindSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    speechOutput.text = "Finally,please provide your zip code, or say current location";
    retrieveFindSpeechResp.speechOutput = speechOutput;
    retrieveFindSpeechResp.repromptOutput = speechOutput;
    deferred.resolve(retrieveFindSpeechResp);

    return deferred.promise;
};

AOS.prototype.handleRetrieveQuoteZipCode = function (sessionAttrs) {
    var deferred = q.defer();
    var savedQuoteSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();
    if (sessionAttrs.zipcode && sessionAttrs.email && sessionAttrs.dob && sessionAttrs.lastname) {
        getSavedQuoteResponse(sessionAttrs)
            .then(function (savedQuoteSpeechOutput) {
                savedQuoteSpeechResp.speechOutput = savedQuoteSpeechOutput;
                savedQuoteSpeechResp.repromptOutput = null;
                savedQuoteSpeechResp.sessionAttrs = sessionAttrs;
                deferred.resolve(savedQuoteSpeechResp);
            });

    }
    else {
        savedQuoteSpeechResp.speechOutput = "Something went wrong while retrieving please try later.";
        savedQuoteSpeechResp.repromptOutput = null;
        savedQuoteSpeechResp.sessionAttrs = sessionAttrs;
        deferred.resolve(savedQuoteSpeechResp);
    }
    return deferred.promise;
};

AOS.prototype.handleRetrieveQuoteEmailYesIntent = function (sessionAttrs) {
    var deferred = q.defer();
    var retrieveQuoteSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    if (sessionAttrs.email) {
        getFinalRetrieveQuoteSendEmailResponse(sessionAttrs)
            .then(function (retrieveQuoteSpeechOutput) {
                retrieveQuoteSpeechResp.speechOutput = retrieveQuoteSpeechOutput;
                retrieveQuoteSpeechResp.repromptOutput = null;
                deferred.resolve(retrieveQuoteSpeechResp);
            });
    } else {
        speechOutput.text = Utilities.GetRandomValue(EMAILRESP);
        repromptOutput.text = Utilities.GetRandomValue(EMAILRESP);
        retrieveQuoteSpeechResp.speechOutput = speechOutput;
        retrieveQuoteSpeechResp.repromptOutput = repromptOutput;
        deferred.resolve(retrieveQuoteSpeechResp);
    }


    return deferred.promise;
};

AOS.prototype.handleRetrieveQuoteEmailNoIntent = function (sessionAttrs) {
    var deferred = q.defer();
    var retrieveQuoteSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();

    speechOutput.text = "Thank you for chosing Allstate. You are in Good Hands.";
    retrieveQuoteSpeechResp.speechOutput = speechOutput;
    retrieveQuoteSpeechResp.repromptOutput = null;
    deferred.resolve(retrieveQuoteSpeechResp);

    return deferred.promise;
};

AOS.prototype.handleRetrieveQuoteEmailSendIntent = function (sessionAttrs) {
    var deferred = q.defer();
    var retrieveQuoteSpeechResp = new SpeechResponse();
    var speechOutput = new Speech();
    var repromptOutput = new Speech();

    getFinalRetrieveQuoteSendEmailResponse(sessionAttrs)
        .then(function (retrieveQuoteSpeechOutput) {
            retrieveQuoteSpeechResp.speechOutput = retrieveQuoteSpeechOutput;
            retrieveQuoteSpeechResp.repromptOutput = null;
            deferred.resolve(retrieveQuoteSpeechResp);
        });


    return deferred.promise;

};
//#endregion

//#region PRIVATE AGENT
function getFinalAgentFindSendEmailResponse(sessionAttrs) {
    var deferred = q.defer();
    var finalSpeechOutput = new Speech();
    var to = sessionAttrs.email;
    var subject = "Allstate agent details: " + sessionAttrs.agent.name;
    var body = buildAgentEmailBody(sessionAttrs.agent, to);
    Utilities.sendEmail(to, subject, body)
        .then(function (emailStatus) {
            if (emailStatus) {
                finalSpeechOutput.text = Utilities.GetRandomValue(EMAILSENTRESPAGENT) + "Thank you, for choosing Allstate.";
            } else {
                finalSpeechOutput.text = "Sorry! there was a problem while sending the email to you. Please try again later.";
            }
            deferred.resolve(finalSpeechOutput);
        })


    return deferred.promise;
}

function buildAgentEmailBody(agentInfo, to) {
    var emailBody = "";

    emailBody = emailBody + "\nThank you for your interest in Allstate agents.\n"
    emailBody = emailBody + "\nBelow are details you requested regarding our agent: " + agentInfo.name;
    emailBody = emailBody + "\n-------------------------------------------------------";
    emailBody = emailBody + "\nAdderess: " + Utilities.getCombinedAddress(agentInfo);
    emailBody = emailBody + "\nPhone: " + agentInfo.phoneNumber;
    emailBody = emailBody + "\nEmail: " + agentInfo.emailAddress;

    return emailBody;
}

function getFinalAgentFindResponse(sessionAttrs) {
    var deferred = q.defer();
    var finalSpeechOutput = new Speech();
    var sessionInfo = new Session();
    sessionInfo.zip = sessionAttrs.zip;

    startAOSSession()
        .then(function (id) {
            sessionInfo.sessionId = id;
            return getStateFromZip(sessionInfo.sessionId, sessionInfo.zip);
        }).then(function (state) {
            sessionInfo.state = state;
            return getAgents(sessionInfo);
        }).then(function (agentsResp) {
            if (agentsResp && agentsResp.length > 0) {
                sessionAttrs.agent = agentsResp[0];
                var firstAgentName = agentsResp[0].name;
                finalSpeechOutput.text = "nearest Allstate agent to you is, " + firstAgentName +
                    ". You can call the agent at " + agentsResp[0].phoneNumber +
                    ". Or, would you like me to email you the agent details?";
            } else {
                finalSpeechOutput.text = "sorry! no agents are available at zip " + sessionInfo.zip;
            }
            deferred.resolve(finalSpeechOutput);
        }).catch(function (error) {
            finalSpeechOutput.text = "something went wrong with agent service. Please try again later.";
            deferred.resolve(finalSpeechOutput);
        });

    return deferred.promise;
};

function ProcessAgentResponse(agentServResp) {
    var agents = [];
    if (agentServResp && agentServResp.agentAvailable && agentServResp.agents.length > 0) {
        for (var index = 0; index < agentServResp.agents.length; index++) {
            var currServAgent = agentServResp.agents[index];
            var agentInfo = new Agent();
            agentInfo.id = currServAgent.id;
            agentInfo.name = currServAgent.name;
            agentInfo.addressLine1 = currServAgent.addressLine1;
            agentInfo.city = currServAgent.city;
            agentInfo.state = currServAgent.state;
            agentInfo.zipCode = currServAgent.zipCode;
            agentInfo.phoneNumber = currServAgent.phoneNumber;
            agentInfo.imageUrl = currServAgent.imageURL;
            agentInfo.emailAddress = currServAgent.emailAddress;
            agents.push(agentInfo);
        }
    }

    return agents;
}
//#endregion


//#region PRIVATE RENTERS
function stateSPecificQuestionOne(sessionAttrs, speechOutput) {
    if (sessionAttrs.state === "CT") {
        speechOutput.text = "Got it. Is your residence located within 2,600 feet of the coast? ";
    }
    else if (sessionAttrs.state === "CA") {
        speechOutput.text = "Got it. Are you insured by Cal-Vet? ";
    }
    else if (sessionAttrs.state === "DE") {
        speechOutput.text = "Got it. Is the property located within 1,000 feet of the ocean or bay? ";
    }
    else if (sessionAttrs.state === "NJ" || sessionAttrs.state === "TX") {
        speechOutput.text = "Got it. Now I'll need to know what material your residence is made out of. ";
    }
    else if (sessionAttrs.state === "AL" || sessionAttrs.state == "LA" || sessionAttrs.state === "SC") {
        speechOutput.text = "Got it. Is the property within city limits? ";
    }
    else if (sessionAttrs.state === "AR" || sessionAttrs.state === "CO" || sessionAttrs.state === "GA" || sessionAttrs.state === "ID" || sessionAttrs.state === "IN" ||
        sessionAttrs.state === "IA" || sessionAttrs.state === "ME" || sessionAttrs.state === "MD" || sessionAttrs.state === "MI" || sessionAttrs.state === "NV" ||
        sessionAttrs.state === "NH" || sessionAttrs.state === "RI" || sessionAttrs.state === "UT" || sessionAttrs.state === "VA" || sessionAttrs.state === "WV" ||
        sessionAttrs.state === "WI" || sessionAttrs.state === "NM" || sessionAttrs.state === "NY" || sessionAttrs.state === "NC" || sessionAttrs.state === "OK" || sessionAttrs.state === "MS") {
        speechOutput.text = "Does your property have any of the protective devices like Smoke Detectors, Fire Extinguishers, Deadbolt Locks, Central Fire Alarm, Fire Sprinklers, 24-Hour Manned Security, Central Burglar Alarm that reports to a monitoring center, Burglar Alarm that sounds in the home";
    }
    else if (sessionAttrs.state == "NE" || sessionAttrs.state == "VT" || sessionAttrs.state == "WY" || sessionAttrs.state == "TN") {
        speechOutput.text = "Got it, Have you had property insurance for at least 1 year?";
    }
    else if (sessionAttrs.state == "MA" || sessionAttrs.state == "AK" || sessionAttrs.state == "DC" || sessionAttrs.state == "ND" ||
        sessionAttrs.state == "SD" || sessionAttrs.state == "HI" || sessionAttrs.state == "MT") {
        speechOutput.text = "Got it, Have you filed any claims in the last 3 years?";
    }
    else if (sessionAttrs.state == "PA") {
        speechOutput.text = "Alright! Do you have any dogs?";
    }
    if (!speechOutput.text) {
        speechOutput.text = "Got it. Just one more question. What is the estimated value of all personal items in your residence?";
    }
    return speechOutput;
}

function getRentersSaveCustomerResponse(sessionAttrs) {
    var deferred = q.defer();
    var saveCustSpeechOutput = new Speech();
    var sessionInfo = new Session();
    sessionInfo.zip = sessionAttrs.zip;
    sessionInfo.newzip = sessionAttrs.newzip;
    startAOSSession()
        .then(function (id) {
            sessionInfo.sessionId = id;
            return getStateFromZip(sessionInfo.sessionId, sessionInfo.zip);
        }).then(function (state) {
            sessionAttrs.state = state;
            if (sessionAttrs.newzip) {
                return getStateFromZip(sessionInfo.sessionId, sessionInfo.newzip);
            }
        }).then(function (newstate) {
            sessionAttrs.newstate = newstate;
            var customerSaveInfo = getCustomerSaveInfo(sessionAttrs, sessionInfo);
            return rentersSaveCustomer(customerSaveInfo, sessionInfo.sessionId);
        }).then(function (saveResp) {
            if (sessionAttrs.state === "FL") {
                saveCustSpeechOutput.text = "Sorry! We are unable to take you forward with this entered state now. Please click on this to continue https://www.allstate.com/landingpages/renters-fl.aspx"
            }
            if (saveResp && saveResp.transactionToken) {
                sessionAttrs.transactionToken = saveResp.transactionToken;
                saveCustSpeechOutput.sessionAttrs = sessionAttrs;
                if (sessionAttrs.transactionToken) {
                    var state = sessionAttrs.transactionToken.state;
                    if (state === "MD" || state === "NY") {
                        saveCustSpeechOutput.text = "Sorry! We are unable to take you forward with this entered state now. Please click on this to continue https://www.allstate.com/"
                    }
                    //if (state === "CA" || state === "KS" || state === "MD" || state === "DE" || state === "FL") {
                    else if (state === "CA" || state === "KS" || state === "DE") {
                        saveCustSpeechOutput.text = "Great! Next I'll need to know a little about your employment status. Are you employed, self employed, unemployed, student, retired, home maker or military.";
                    }
                    else {
                        saveCustSpeechOutput.text = "Information from outside sources regarding credit history is used to provide you with a renters quote. A third party may be used to calculate your insurance score. This information, along with subsequently collected information, will be shared with outside parties that perform services on Allstate's behalf. ";
                        saveCustSpeechOutput.text = saveCustSpeechOutput.text + "   Privacy Policy:http://www.allstate.com/about/privacy-statement-aic.aspx ";
                        saveCustSpeechOutput.text = saveCustSpeechOutput.text + "   Type OK to authorize.";
                    }

                }
            }
            deferred.resolve(saveCustSpeechOutput);
        }).catch(function (error) {
            saveCustSpeechOutput.text = "something went wrong with renters insurance service. Please try again later.";
            deferred.resolve(saveCustSpeechOutput);
        });

    return deferred.promise;
}

function getRentersInfoResponse(sessionAttrs) {
    var deferred = q.defer();
    var rentersInfoSpeechOutput = new Speech();
    if (sessionAttrs.transactionToken) {
        var rentersInfo = mapRentersInfo(sessionAttrs);
        saveRentersInfo(rentersInfo, sessionAttrs.transactionToken)
            .then(function (result) {
                sessionAttrs.creditHit = result.creditHit;
                sessionAttrs.isRenterReOrderData = result.isRenterReOrderData;
                rentersInfoSpeechOutput.text = "Thank you for the basic renters information. Would you like to proceed."
                deferred.resolve(rentersInfoSpeechOutput);
            }).catch(function (error) {
                rentersInfoSpeechOutput.text = "something went wrong with renters insurance service. Please try again later.";
                sessionAttrs.transactionToken = null;
                deferred.resolve(rentersInfoSpeechOutput);
            });
    }
    return deferred.promise;
}

function confirmProfileResponse(sessionAttrs) {
    var deferred = q.defer();
    var rentersInfoSpeechOutput = new Speech();
    if (sessionAttrs.transactionToken) {
        var confirmProfileInfo = mapRentersConfirmProfile(sessionAttrs);
        if (sessionAttrs && !sessionAttrs.creditHit && !sessionAttrs.isRenterReOrderData) {
            postConfirmProfile(confirmProfileInfo, sessionAttrs.transactionToken)
                .then(function (result) {
                    rentersInfoSpeechOutput.text = "Great! Now is this residence your primary residence? ";
                    deferred.resolve(rentersInfoSpeechOutput);
                }).catch(function (error) {
                    rentersInfoSpeechOutput.text = "something went wrong with renters insurance service. Please try again later.";
                    sessionAttrs.transactionToken = null;
                    deferred.resolve(rentersInfoSpeechOutput);
                });
        }
        else {
            rentersInfoSpeechOutput.text = "Great! Now is this residence your primary residence? ";
            deferred.resolve(rentersInfoSpeechOutput);
        }
    }
    return deferred.promise;
}

function getRentersQuoteResponse(sessionAttrs) {
    var deferred = q.defer();
    var quoteSpeechOutput = new Speech();
    if (sessionAttrs.transactionToken) {
        getResidenceInfo(sessionAttrs.transactionToken)
            .then(function (response) {
                var residenceInfoObject = response;
                residenceInfoObject = mapResidenceInfo(sessionAttrs, JSON.parse(residenceInfoObject));
                return postResidenceInfo(residenceInfoObject, sessionAttrs.transactionToken);
            }).then(function (response) {
                if (response) {
                    sessionAttrs.isValidRenterCustomer = response.isValidRenterCustomer;
                    quoteSpeechOutput.text = "Thank you for the inputs, Your details has been validated. would you like to get quote details? ";
                }
                deferred.resolve(quoteSpeechOutput);
            }).catch(function (error) {
                quoteSpeechOutput.text = "something went wrong with renters insurance service. Please try again later.";
                sessionAttrs.transactionToken = null;
                deferred.resolve(quoteSpeechOutput);
            });
    }
    return deferred.promise;
}

function saveAndExitResponse(sessionAttrs) {
    var deferred = q.defer();
    var quoteSpeechOutput = new Speech();
    if (sessionAttrs.transactionToken) {
        saveAndExplicit(sessionAttrs.emailAddress, sessionAttrs.transactionToken)
            .then(function (response) {
                return saveAndExit(sessionAttrs.emailAddress, sessionAttrs.transactionToken);
            }).then(function (response) {
                if (!response) {
                    quoteSpeechOutput.text = "Thank you for the inputs, Your details has been saved. would you like to complete the transaction ? ";
                }
                deferred.resolve(quoteSpeechOutput);
            }).catch(function (error) {
                quoteSpeechOutput.text = "something went wrong with renters insurance service. Please try again later.";
                deferred.resolve(quoteSpeechOutput);
            });
    }
    return deferred.promise;
}

function quoteLandingURLResponse(sessionAttrs) {
    var deferred = q.defer();
    var quoteURLSpeechOutput = new Speech();
    var sessionInfo = new Session();
    sessionInfo.zip = sessionAttrs.zip;
    sessionInfo.newzip = sessionAttrs.newzip;
    startAutoAOSSession()
        .then(function (id) {
            sessionInfo.sessionId = id;
            return quoteRepository(sessionAttrs, sessionInfo.sessionId);
        }).then(function (response) {
            if (response && response.quoteList) {
                sessionAttrs.retrieveURL = response.quoteList[0].retrieveUrl;
                quoteURLSpeechOutput.sessionAttrs = sessionAttrs;
                quoteURLSpeechOutput.text = "Perfect. Here is the URL to connect to live quote page: ";
                quoteURLSpeechOutput.text = quoteURLSpeechOutput.text + sessionAttrs.retrieveURL;
                quoteURLSpeechOutput.text = quoteURLSpeechOutput.text + "&sessionID=" + sessionAttrs.transactionToken.sessionID + "&product=RENTERS&isAI=TRUE";
            }
            else {
                quoteURLSpeechOutput.text = "something went wrong with renters insurance service. Please try again later.";
            }
            deferred.resolve(quoteURLSpeechOutput);
        }).catch(function (error) {
            quoteURLSpeechOutput.text = "something went wrong with renters insurance service. Please try again later.";
            deferred.resolve(quoteURLSpeechOutput);
        });

    return deferred.promise;
}

function quoteResponse(sessionAttrs) {
    var deferred = q.defer();
    var quoteSpeechOutput = new Speech();
    if (sessionAttrs.transactionToken) {
        orderQuote(sessionAttrs.transactionToken)
            .then(function (quoteResp) {
                if (quoteResp && quoteResp.quoteList) {
                    quoteSpeechOutput.text = "Okay, thanks for all the info! Here's your renters quote. ";
                    quoteSpeechOutput.text = quoteSpeechOutput.text + "Total payable amount is $" + quoteResp.quoteList[0].paymentInfo.paymentAmount;
                    quoteSpeechOutput.text = quoteSpeechOutput.text + " and per month would cost $" + quoteResp.quoteList[0].paymentInfo.monthlyPaymentAmount;
                    quoteSpeechOutput.text = quoteSpeechOutput.text + ". Your down payment would be $" + quoteResp.quoteList[0].paymentInfo.inDownPaymentAmount;
                    quoteSpeechOutput.text = quoteSpeechOutput.text + ". Someone will be in touch with you shortly, but in the meantime would you like to continue from quote?";
                    sessionAttrs.isError = false;
                }
                if (quoteResp && quoteResp.stopPageType === "DangerousDogSelected") {
                    quoteSpeechOutput.text = "Okay, Unable to proceed further. You have selected a dangerous dog.  ";
                    sessionAttrs.isError = true;
                    quoteSpeechOutput.sessionAttrs = sessionAttrs;
                }
                if (quoteResp && quoteResp.stopPageType === "RejectedUser") {
                    quoteSpeechOutput.text = "Okay, Unable to proceed further. Please contact Allstate Agent. ";
                    sessionAttrs.isError = true;
                    quoteSpeechOutput.sessionAttrs = sessionAttrs;
                }
                deferred.resolve(quoteSpeechOutput);
            }).catch(function (error) {
                quoteSpeechOutput.text = "something went wrong with renters insurance service. Please try again later.";
                quoteSpeechOutput.sessionAttrs = sessionAttrs;
                deferred.resolve(quoteSpeechOutput);
            });
    }
    return deferred.promise;
}

function getCustomerSaveInfo(sessionAttrs, sessionInfo) {
    var customerData = {};
    customerData.firstName = sessionAttrs.firstName;
    customerData.lastName = sessionAttrs.lastName;
    customerData.suffix = '';
    customerData.dateOfBirth = DateUtil.getFormattedDate(sessionAttrs.dob, "MMDDYYYY");
    customerData.mailingAddress = sessionAttrs.addrLine1;
    customerData.city = sessionAttrs.city;
    customerData.state = sessionAttrs.state;
    customerData.zipCode = sessionAttrs.zip;
    customerData.aWSFlag = "N";
    customerData.affinity = {};
    customerData.insuredAddress = {};
    customerData.insuredAddress.addressLine1 = '';
    customerData.insuredAddress.city = '';
    customerData.insuredAddress.state = '';
    customerData.insuredAddress.zipCode = '';
    if (!sessionAttrs.IsInsuredAddrSame) {
        if (customerData.insuredAddress) {
            customerData.insuredAddress.addressLine1 = sessionAttrs.newaddrLine1;
            customerData.insuredAddress.aptOrUnit = '';
            customerData.insuredAddress.city = sessionAttrs.newcity;
            customerData.insuredAddress.state = sessionAttrs.newstate;
            customerData.insuredAddress.zipCode = sessionAttrs.newzip;
        }
    }
    customerData.isInsuredAddressSameAsCurrent = sessionAttrs.IsInsuredAddrSame;
    return customerData;
}

function mapRentersInfo(sessionAttrs) {
    var rentersInfoData = null;
    rentersInfoData = initializeRentersInfoRequest();
    if (rentersInfoData) {
        rentersInfoData = mapResident(rentersInfoData, sessionAttrs);
        rentersInfoData.insuredAddress = mapAddress(rentersInfoData.insuredAddress, sessionAttrs);
        rentersInfoData.currentAddress = mapAddress(rentersInfoData.currentAddress, sessionAttrs);
        if (!sessionAttrs.livedmorethantwo) {
            rentersInfoData.previousAddress = mapAddress(rentersInfoData.previousAddress, sessionAttrs);
        }
        rentersInfoData = mapContactInfo(rentersInfoData, sessionAttrs);
        rentersInfoData.businessOutOfResidence = null;
        if (sessionAttrs.transactionToken.state === "KS") {
            rentersInfoData.liveAtCurAddressMoreThanTwoYears = null;
        }
        else {
            rentersInfoData.liveAtCurAddressMoreThanTwoYears = sessionAttrs.livedmorethantwo;
        }

        rentersInfoData.isSpouseAdded = false;
        rentersInfoData.isAgreeForTelemarketingCalls = true; //add question to user

    }
    return rentersInfoData;
}

function mapRentersConfirmProfile(sessionAttrs) {
    var confProfileData = {};
    confProfileData.profiles = getProfiles(sessionAttrs);
    confProfileData.addresses = getAddresses(sessionAttrs);
    return confProfileData;
}

function getProfiles(sessionAttrs) {
    var profiles = [];
    var profile = {};
    profile.driverGUID = null;
    profile.driverNumber = null;
    profile.relationshipToPrimaryDriver = "SA";
    profile.firstName = sessionAttrs.firstName;
    profile.middleName = null;
    profile.lastName = sessionAttrs.lastName;
    profile.suffix = null;
    profile.dateOfBirth = DateUtil.getFormattedDate(sessionAttrs.dob, "MMDDYYYY");;
    profile.id = "dvEditPrimary";
    profiles.push(profile);
    if (sessionAttrs.spouseAdded) {
        profile.driverGUID = null;
        profile.driverNumber = null;
        profile.relationshipToPrimaryDriver = null;
        profile.firstName = sessionAttrs.spousefirstName;
        profile.middleName = null;
        profile.lastName = sessionAttrs.spouselastName;
        profile.suffix = null;
        profile.dateOfBirth = DateUtil.getFormattedDate(sessionAttrs.spouseDob, "MMDDYYYY");;
        profile.id = "dvEditSpouse";
        profiles.push(profile);
    }
    return profiles;
}

function getAddresses(sessionAttrs) {
    var addresses = [];
    var addrs = {};
    addrs.address = {};
    addrs.address.addressLine1 = sessionAttrs.addrLine1;
    addrs.address.aptOrUnit = null;
    addrs.address.city = sessionAttrs.city;
    addrs.address.state = sessionAttrs.transactionToken.state;
    addrs.address.zipCode = sessionAttrs.zip;
    addrs.address.stateReadOnly = true;
    addrs.address.zipCodeReadOnly = true;
    addrs.invalidZipCode = false;
    addrs.isPreviousAddress = false;
    addrs.headerText = "Current Address";
    addrs.id = "dvEditAddress";
    addrs.editHeader = "Edit Primary Address";
    addresses.push(addrs);
    return addresses;
}

function mapResident(rentersInfoData, sessionAttrs) {
    if (rentersInfoData.primaryRenter) {
        rentersInfoData.primaryRenter.firstName = sessionAttrs.firstName;
        rentersInfoData.primaryRenter.lastName = sessionAttrs.lastName;
        rentersInfoData.primaryRenter.gender = sessionAttrs.gender;
        rentersInfoData.primaryRenter.employmentStatus = sessionAttrs.employmentStatus;
        if (sessionAttrs.state === "CA" || sessionAttrs.state === "CT" || sessionAttrs.state === "MD" || sessionAttrs.state === "OR" || sessionAttrs.state === "PA" || sessionAttrs.state === "NY") {
            rentersInfoData.primaryRenter.maritalStatus = sessionAttrs.maritalstatus;
        }

        rentersInfoData.primaryRenter.dateOfBirth = DateUtil.getFormattedDate(sessionAttrs.dob, "MMDDYYYY");
        if (sessionAttrs.dob) {
            var birthdate = new Date(sessionAttrs.dob);
            var cur = new Date();
            var diff = cur - birthdate;
            var age = Math.floor(diff / 31557600000);
            rentersInfoData.primaryRenter.age = age;
        }

    }
    if (sessionAttrs.spouseAdded) {
        rentersInfoData.spouse.firstName = sessionAttrs.spousefirstName;
        rentersInfoData.spouse.lastName = sessionAttrs.spouselastName;
        rentersInfoData.spouse.gender = sessionAttrs.spouseGender;
        rentersInfoData.spouse.employmentStatus = sessionAttrs.spouseEmpStatus;
        rentersInfoData.spouse.dateOfBirth = DateUtil.getFormattedDate(sessionAttrs.spouseDob, "MMDDYYYY");
        if (sessionAttrs.spouseDob) {
            var birthdate = new Date(sessionAttrs.spouseDob);
            var cur = new Date();
            var diff = cur - birthdate;
            var age = Math.floor(diff / 31557600000);
            rentersInfoData.spouse.age = age;
        }

    }
    return rentersInfoData;
}

function mapAddress(address, sessionAttrs) {
    if (address.addressType === "Previous") {
        address.addressLine1 = sessionAttrs.prevaddrLine1;
        address.city = sessionAttrs.prevcity;
        address.state = sessionAttrs.prevstate;
        address.zipCode = sessionAttrs.prevzipcode;
    }
    else {
        address.addressLine1 = sessionAttrs.addrLine1;
        address.city = sessionAttrs.city;
        address.state = sessionAttrs.transactionToken.state;
        address.zipCode = sessionAttrs.zip;
    }
    return address;
}

function mapContactInfo(rentersInfoData, sessionAttrs) {
    if (rentersInfoData.contactInformation) {
        rentersInfoData.contactInformation.phoneNumber = sessionAttrs.phoneNumber;
        rentersInfoData.contactInformation.emailAddress = sessionAttrs.emailAddress;
    }
    return rentersInfoData;
}

function mapResidenceInfo(sessionAttrs, residenceInfo) {
    var residenceInfoData = null;
    if (residenceInfo && residenceInfo.residenceDetails) {
        residenceInfo.residenceDetails.primaryResidence = sessionAttrs.primaryResidence;
        residenceInfo.residenceDetails.locatedInDormOrMilitaryBarracks = sessionAttrs.locatedInDormOrMilitaryBarracks;
        if (sessionAttrs.residenceBuildingType) {
            residenceInfo.residenceDetails.residenceBuildingType = sessionAttrs.residenceBuildingType;
        }
        else {
            residenceInfo.residenceDetails.residenceBuildingType = sessionAttrs.residenceBuildingType;
        }

        residenceInfo.residenceDetails.unitsInBuilding = sessionAttrs.unitsInBuilding;
        residenceInfo.residenceDetails.businessoutofresidence = sessionAttrs.businessoutofresidence;
        if (sessionAttrs.state === "WI" || sessionAttrs.state === "ID" || sessionAttrs.state === "IA" || sessionAttrs.state === "AK" || sessionAttrs.state === "HI" ||
            sessionAttrs.state === "MT" || sessionAttrs.state === "NE" || sessionAttrs.state === "ND" || sessionAttrs.state === "SD") {
            if (sessionAttrs.personalItemsValue == "10000" || sessionAttrs.personalItemsValue == "20000" || sessionAttrs.personalItemsValue == "30000" || sessionAttrs.personalItemsValue == "40000") {
                residenceInfo.residenceDetails.personalItems = sessionAttrs.personalItemsValue;
                residenceInfo.residenceDetails.personalItemsValue = '';
            }
        }
        else if (sessionAttrs.state === "AL" || sessionAttrs.state === "NC" || sessionAttrs.state === "AZ") {
            if (sessionAttrs.personalItemsValue == "20000" || sessionAttrs.personalItemsValue == "30000" || sessionAttrs.personalItemsValue == "40000" || sessionAttrs.personalItemsValue == "50000") {
                residenceInfo.residenceDetails.personalItems = sessionAttrs.personalItemsValue;
                residenceInfo.residenceDetails.personalItemsValue = '';
            }
        }
        else if (sessionAttrs.state === "NY") {
            if (sessionAttrs.personalItemsValue == "25000" || sessionAttrs.personalItemsValue == "35000" || sessionAttrs.personalItemsValue == "45000" || sessionAttrs.personalItemsValue == "55000") {
                residenceInfo.residenceDetails.personalItems = sessionAttrs.personalItemsValue;
                residenceInfo.residenceDetails.personalItemsValue = '';
            }
        }
        else if (sessionAttrs.state === "KS") {
            if (sessionAttrs.personalItemsValue == "15000" || sessionAttrs.personalItemsValue == "25000" || sessionAttrs.personalItemsValue == "50000" || sessionAttrs.personalItemsValue == "100000") {
                residenceInfo.residenceDetails.personalItems = sessionAttrs.personalItemsValue;
                residenceInfo.residenceDetails.personalItemsValue = '';
            }
        }
        else {
            if (sessionAttrs.personalItemsValue == "15000" || sessionAttrs.personalItemsValue == "25000" || sessionAttrs.personalItemsValue == "35000" || sessionAttrs.personalItemsValue == "45000") {
                residenceInfo.residenceDetails.personalItems = sessionAttrs.personalItemsValue;
                residenceInfo.residenceDetails.personalItemsValue = '';
            }
        }
        if (residenceInfo.residenceDetails && !residenceInfo.residenceDetails.personalItems) {
            residenceInfo.residenceDetails.personalItems = "Other";
            residenceInfo.residenceDetails.personalItemsValue = sessionAttrs.personalItemsValue;
        }
        if (sessionAttrs.transactionToken.state === "CA") {
            residenceInfo.residenceDetails.unOccupiedResidence = sessionAttrs.unOccupiedResidence;
        }
        if (sessionAttrs.transactionToken.state === "CA") {
            residenceInfo.residenceDetails.propertyInsuranceClaims = sessionAttrs.propertyInsuranceClaims;
        }
        if (sessionAttrs.transactionToken.state === "DE") {
            residenceInfo.residenceDetails.isResidenceWithinThousandFtFromCoast = sessionAttrs.isResidenceWithinThousandFtFromCoast;
        }
        if (sessionAttrs.transactionToken.state === "NJ" || sessionAttrs.transactionToken.state === "TX") {
            residenceInfo.residenceDetails.constructionType = sessionAttrs.constructionType;
        }
        if (sessionAttrs.propertyInsuranceClaims === "TRUE") {
            var lostdate = DateUtil.getFormattedDate(sessionAttrs.claimLostDate, "MM-DD-YYYY");
            var splitDate = "01-01-0001";
            if (lostdate) {
                var splitDate = lostdate.toString().split("-");
            }
            residenceInfo.residenceDetails.claims = [];
            residenceInfo.residenceDetails.claims[0] = {};
            residenceInfo.residenceDetails.claims[0].id = "1";
            residenceInfo.residenceDetails.claims[0].lossdate = {};
            residenceInfo.residenceDetails.claims[0].lossdate.day = splitDate[2];
            residenceInfo.residenceDetails.claims[0].lossdate.month = splitDate[1];
            residenceInfo.residenceDetails.claims[0].lossdate.year = splitDate[0];
            residenceInfo.residenceDetails.claims[0].lossType = sessionAttrs.claimLostType;
            residenceInfo.residenceDetails.claims[0].lossTypeDescription = sessionAttrs.claimLostDescription;
            if (sessionAttrs.claimLostLocationDisplay) {
                residenceInfo.residenceDetails.claims[0].lossLocation = sessionAttrs.claimLostLocation;
                residenceInfo.residenceDetails.claims[0].lossLocationDisplay = sessionAttrs.claimLostLocationDisplay;
            }
        }
        if (sessionAttrs.isDogAdded === "true") {
            residenceInfo.residenceDetails.dogList = [];
            residenceInfo.residenceDetails.dogList[0] = {};
            residenceInfo.residenceDetails.dogList[0].dogId = "1"
            residenceInfo.residenceDetails.dogList[0].dogBreed = sessionAttrs.dogbreeds;
            residenceInfo.residenceDetails.dogList[0].dogCountLable = "Dog #1";
            residenceInfo.residenceDetails.noOfDogs = "1";
        }

    }
    return residenceInfo;
}

function initializeRentersInfoRequest() {
    var rentersInfo = {};
    rentersInfo.primaryRenter = new Resident();
    rentersInfo.spouse = new Resident();
    rentersInfo.insuredAddress = new Address();
    rentersInfo.insuredAddress.addressType = "Current";
    rentersInfo.currentAddress = new Address();
    rentersInfo.currentAddress.addressType = "Current";
    rentersInfo.previousAddress = new Address();
    rentersInfo.previousAddress.addressType = "Previous";
    rentersInfo.contactInformation = new ContactInfo();
    rentersInfo.businessOutOfResidence = null;
    rentersInfo.liveAtCurAddressMoreThanTwoYears = "true";
    rentersInfo.isSpouseAdded = false;
    rentersInfo.isAgreeForTelemarketingCalls = true;
    rentersInfo.isCurrentAddressSameAsInsuredAddress = true;
    rentersInfo.isRenterOrderData = false;
    rentersInfo.isAddressStandardized = false;
    rentersInfo.isdpAgeCheck = false;
    rentersInfo.messageType = null;
    rentersInfo.errors = null;
    rentersInfo.stopPageType = "None";
    rentersInfo.isSuccess = true;
    return rentersInfo;
}
//#endregion

//#region PRIVATE RETRIEVEQUOTE
function getSavedQuoteResponse(sessionAttrs) {
    var deferred = q.defer();
    var finalSpeechOutput = new Speech();
    var sessionInfo = new Session();
    sessionInfo.zipcode = sessionAttrs.zipcode;
    sessionInfo.dob = sessionAttrs.dob;
    sessionInfo.email = sessionAttrs.email;
    sessionInfo.lastname = sessionAttrs.lastname;
    startAutoAOSSession()
        .then(function (id) {
            sessionInfo.sessionId = id;
            return getStateFromZip(sessionInfo.sessionId, sessionInfo.zipcode);
        }).then(function (state) {
            sessionInfo.state = state;
            return getSavedQuote(sessionInfo);
        }).then(function (quoteResp) {
            if (quoteResp && quoteResp.length > 0) {
                sessionAttrs.quotedetails = quoteResp;
                var quoteDetails = quoteResp;
                finalSpeechOutput.text = retrieveSpeachOutText(quoteResp);
            } else {
                finalSpeechOutput.text = "sorry! no saved policies are available with these inputs.Would you like to insure for renters?";
            }
            deferred.resolve(finalSpeechOutput);
        }).catch(function (error) {
            finalSpeechOutput.text = "something went wrong with retrieve quote service. Please try again later.";
            deferred.resolve(finalSpeechOutput);
        })

    return deferred.promise;
};

function retrieveSpeachOutText(quotes) {
    var textOut = null;
    if (quotes) {
        if (quotes.length == 1) {
            if (quotes[0].policyNumber) {
                textOut = "You have a " + quotes[0].product + " policy with policy number," + "<say-as interpret-as=\"characters\">" + quotes[0].policyNumber + "</say-as>"
                    + " and the policy was purchased on," + quotes[0].startDate;
            }
        }
        else if (quotes.length > 1) {
            textOut = "Great!! you have multiple policies with,";
            for (var index = 0; index < quotes.length; index++) {
                if (quotes[index].policyNumber) {
                    textOut = textOut + quotes[index].product + ", policy with the policy number:" + quotes[index].policyNumber + " ,and the policy was purchased on:" + quotes[index].startDate;
                }
                else {
                    textOut = textOut + quotes[index].product + ", policy with the policy number:" + quotes[index].controlNumber + " ,and the policy was purchased on:" + quotes[index].startDate;
                }
            }
        }
        textOut = textOut + ", would you like me to email you the quote details?";
    }
    else {
        textOut = "I see that you do not have any purchased policies with these inputs.";
    }
    return textOut;
};

function getFinalRetrieveQuoteSendEmailResponse(sessionAttrs) {
    var deferred = q.defer();
    var finalSpeechOutput = new Speech();
    var to = sessionAttrs.email;
    var subject = "Allstate policy details ";
    var body = buildRetrieveQuoteEmailBody(sessionAttrs.quotedetails, to);
    Utilities.sendEmail(to, subject, body)
        .then(function (emailStatus) {
            if (emailStatus) {
                finalSpeechOutput.text = "We have sent an email with all the details. Thank you, for choosing Allstate.";
            } else {
                finalSpeechOutput.text = "Sorry! there was a problem while sending the email to you. Please try again later.";
            }
            deferred.resolve(finalSpeechOutput);
        })


    return deferred.promise;
}

function buildRetrieveQuoteEmailBody(policiesInfo, to) {
    var emailBody = "";

    emailBody = emailBody + "\nThank you for your purchasing Allstate insurance.\n"
    if (policiesInfo) {
        for (var index = 0; index < policiesInfo.length; index++) {
            emailBody = emailBody + "\nBelow are details you requested regarding: " + policiesInfo[index].policyNumber;
            emailBody = emailBody + "\n-------------------------------------------------------";
            emailBody = emailBody + "\Product: " + policiesInfo[index].product;
            emailBody = emailBody + "\nPurchased On: " + policiesInfo[index].startDate;
            emailBody = emailBody + "\nAssociated Agent Name: " + policiesInfo[index].agentName;
            emailBody = emailBody + "\nAssociated Agent Phone number: " + policiesInfo[index].agentPhoneNumber;
            emailBody = emailBody + "\nAssociated Agent Email address: " + policiesInfo[index].agentEmailAddress;
            emailBody = emailBody + "\n-------------------------------------------------------";
            emailBody = emailBody + "\n-------------------------------------------------------";
        }

    }

    return emailBody;
}
//#endregion

//#region AOS API CALLS
function startAOSSession(zip) {
    var deferred = q.defer();
    request({ method: 'GET', uri: URL_RENTERS_SESSIONID }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            errormsg = "Error from server session";
            deferred.reject(errormsg);
        } else {
            var sessionId = response.headers['x-tid'];
            deferred.resolve(sessionId);
        }
    });
    return deferred.promise;
}

function startAutoAOSSession(zip) {
    var deferred = q.defer();
    request({ method: 'GET', uri: URL_AUTO_SESSIONID }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            errormsg = "Error from server session";
            deferred.reject(errormsg);
        } else {
            var sessionId = response.headers['x-tid'];
            deferred.resolve(sessionId);
        }
    });
    return deferred.promise;
}

function getStateFromZip(sessionId, zip) {
    var deferred = q.defer();
    var urlGetStateFromZip = URL_GETSTATE.replace("{0}", zip);
    request({ method: 'GET', uri: urlGetStateFromZip, headers: { "X-TID": sessionId } },
        function (error, response, body) {
            if (error || response.statusCode !== 200) {
                errormsg = "Error from server session";
                deferred.reject(errormsg);
            } else {
                var responseJson = JSON.parse(response.body);
                deferred.resolve(responseJson.stateCode);
            }
        });
    return deferred.promise;
}

function rentersSaveCustomer(customerSaveInfo, sessionId) {
    var deferred = q.defer();
    request(
        {
            method: "POST",
            uri: URL_RENTERS_SAVECUSTOMER,
            json: customerSaveInfo,
            headers: { "X-TID": sessionId, "x-pd": "RENTERS" }
        },
        function (error, response, body) {
            if (error || response.statusCode !== 200) {
                errormsg = "Error from server session";
                deferred.reject(errormsg);
            } else {
                var responseJson = response.body;
                deferred.resolve(responseJson);
            }
        });

    return deferred.promise;
}

function saveRentersInfo(rentersInfo, transactionToken) {
    console.log(rentersInfo);
    var deferred = q.defer();
    request(
        {
            method: "POST",
            uri: URL_RENTERS_RENTERSINFO,
            "content-type": "application/json",
            json: rentersInfo,
            headers: { "X-TID": transactionToken.sessionID, "X-PD": "RENTERS", "X-ZP": transactionToken.zipCode, "X-CN": transactionToken.controlNumber, "X-ST": transactionToken.state, "X-VID": "/occupants/primary/" }
        },
        function (error, response, body) {
            if (error || response.statusCode !== 200) {
                errormsg = "Error from server session";
                deferred.reject(errormsg);
            } else {
                var responseJson = response.body;
                deferred.resolve(responseJson);
            }
        });

    return deferred.promise;
}

function postConfirmProfile(confirmInfo, transactionToken) {
    var deferred = q.defer();
    request(
        {
            method: "POST",
            uri: URL_RENTERS_CONFIRMPROFILE,
            "content-type": "application/json",
            json: confirmInfo,
            headers: { "X-TID": transactionToken.sessionID, "X-PD": "RENTERS", "X-ZP": transactionToken.zipCode, "X-CN": transactionToken.controlNumber, "X-ST": transactionToken.state, "X-VID": "/confirm-profile" }
        },
        function (error, response, body) {
            if (error || response.statusCode !== 200) {
                errormsg = "Error from server session";
                deferred.reject(errormsg);
            } else {
                var responseJson = response.body;
                deferred.resolve(responseJson);
            }
        });

    return deferred.promise;
}

function getResidenceInfo(transactionToken) {
    var deferred = q.defer();
    request(
        {
            method: "GET",
            uri: URL_RENTERS_RESIDENCEINFO,
            "content-type": "application/json",
            headers: { "X-TID": transactionToken.sessionID, "X-PD": "RENTERS", "X-ZP": transactionToken.zipCode, "X-CN": transactionToken.controlNumber, "X-ST": transactionToken.state, "X-VID": "/residence-info/" }
        },
        function (error, response, body) {
            if (error || response.statusCode !== 200) {
                errormsg = "Error from server session";
                deferred.reject(errormsg);
            } else {
                var responseJson = response.body;
                deferred.resolve(responseJson);
            }
        });

    return deferred.promise;
}

function postResidenceInfo(residenceInfoObject, transactionToken) {
    var deferred = q.defer();
    console.log(residenceInfoObject);
    request(
        {
            method: "POST",
            uri: URL_RENTERS_RESIDENCEINFO,
            "content-type": "application/json",
            json: residenceInfoObject,
            headers: { "X-TID": transactionToken.sessionID, "X-PD": "RENTERS", "X-ZP": transactionToken.zipCode, "X-CN": transactionToken.controlNumber, "X-ST": transactionToken.state, "X-VID": "/residence-info/" }
        },
        function (error, response, body) {
            if (error || response.statusCode !== 200) {
                errormsg = "Error from server session";
                deferred.reject(errormsg);
            } else {
                var responseJson = response.body;
                console.log(responseJson);
                deferred.resolve(responseJson);
            }
        });

    return deferred.promise;
}

function orderQuote(transactionToken) {
    var deferred = q.defer();
    request(
        {
            method: "POST",
            uri: URL_RENTERS_ORDERQUOTE,
            headers: { "X-TID": transactionToken.sessionID, "X-PD": "RENTERS", "X-ZP": transactionToken.zipCode, "X-CN": transactionToken.controlNumber, "X-ST": transactionToken.state, "X-VID": "/residence-info/" }
        },
        function (error, response, body) {
            if (error || response.statusCode !== 200) {
                errormsg = "Error from server session";
                deferred.reject(errormsg);
            } else {
                var responseJson = JSON.parse(response.body);
                deferred.resolve(responseJson);
            }
        });

    return deferred.promise;
}

function getSavedQuote(sessionInfo) {
    var deferred = q.defer();
    if (sessionInfo.dob) {
        var dob = DateUtil.getFormattedDate(sessionInfo.dob, "MMDDYYYY");
        sessionInfo.dob = dob;
    }
    request(
        {
            method: 'POST',
            uri: URL_RETRIEVEQUOTE,
            "content-type": "application/json",
            headers: { "X-pd": "AUTO", "X-TID": sessionInfo.sessionId },
            json: true,
            body: { "lastName": sessionInfo.lastname, "dateOfBirth": sessionInfo.dob, "emailID": sessionInfo.email, "zipCode": sessionInfo.zipcode }
        },
        function (error, response, body) {
            if (error || response.statusCode !== 200) {
                errormsg = "Error from server session";
                deferred.reject(errormsg);
            } else {
                var quotes = ProcessQuoteResponse(response.body);
                deferred.resolve(quotes);
            }
        });

    return deferred.promise;
}

function saveAndExplicit(emailid, transactionToken) {
    var deferred = q.defer();
    request(
        {
            method: "POST",
            uri: URL_RENTERS_SAVEEXPLICIT,
            "content-type": "application/json",
            headers: { "X-TID": transactionToken.sessionID, "X-PD": "RENTERS", "X-ZP": transactionToken.zipCode, "X-CN": transactionToken.controlNumber, "X-ST": transactionToken.state, "X-VID": "/save-quote" },
            json: true,
            body: { "email": emailid, "moduleName": "RentersQuote", "quoteType": "RENTER_SINGLE" }
        },
        function (error, response, body) {
            if (error || response.statusCode !== 200) {
                errormsg = "Error from server session";
                deferred.reject(errormsg);
            } else {
                var responseJson = response.body;
                deferred.resolve(responseJson);
            }
        });

    return deferred.promise;
}

function saveAndExit(emailid, transactionToken) {
    var deferred = q.defer();
    request(
        {
            method: "POST",
            uri: URL_RENTERS_SAVEANDEXIT,
            "content-type": "application/json",
            headers: { "X-TID": transactionToken.sessionID, "X-PD": "RENTERS", "X-ZP": transactionToken.zipCode, "X-CN": transactionToken.controlNumber, "X-ST": transactionToken.state, "X-VID": "/save-quote" },
            json: true,
            body: { "email": emailid, "moduleName": "RentersQuote", "quoteType": "RENTER_SINGLE" }
        },
        function (error, response, body) {
            if (error || response.statusCode !== 200) {
                errormsg = "Error from server session";
                deferred.reject(errormsg);
            } else {
                var responseJson = response.body;
                deferred.resolve(responseJson);
            }
        });

    return deferred.promise;
}

function quoteRepository(sessionAttrs, sessionID) {
    var deferred = q.defer();
    var dob;
    if (sessionAttrs && sessionAttrs.dob) {
        dob = DateUtil.getFormattedDate(sessionAttrs.dob, "MMDDYYYY");
    }
    request(
        {
            method: "POST",
            uri: URL_RENTERS_QUOTEREPOSITORY,
            "content-type": "application/json",
            headers: { "X-TID": sessionID, "X-PD": "AUTO", "X-VID": "/" },
            json: true,
            body: { "dateOfBirth": dob, "emailID": sessionAttrs.emailAddress, "lastName": sessionAttrs.lastName, "zipCode": sessionAttrs.zip }
        },
        function (error, response, body) {
            if (error || response.statusCode !== 200) {
                errormsg = "Error from server session";
                deferred.reject(errormsg);
            } else {
                var responseJson = response.body;
                deferred.resolve(responseJson);
            }
        });

    return deferred.promise;
}

function getAgents(sessionInfo) {
    var deferred = q.defer();
    request(
        {
            method: 'POST',
            url: URL_GETAGENTS,
            "content-type": "application/json",
            headers: {
                "X-TID": sessionInfo.sessionId,
                "X-ST": sessionInfo.state
            },
            json: true,
            body: { "zipCode": sessionInfo.zip }
        },
        function (error, response, body) {
            if (error || response.statusCode !== 200) {
                errormsg = "Error from server session";
                deferred.reject(errormsg);
            } else {
                var agents = ProcessAgentResponse(response.body);
                deferred.resolve(agents);
            }
        });

    return deferred.promise;
}
//#endregion

//#region RESPONSE MAPPERS
function ProcessQuoteResponse(retrieveQuoteServResp) {
    var quotes = [];
    if (retrieveQuoteServResp && retrieveQuoteServResp.quoteList && retrieveQuoteServResp.quoteList.length > 0) {
        for (var index = 0; index < retrieveQuoteServResp.quoteList.length; index++) {
            var currSavedQuote = retrieveQuoteServResp.quoteList[index];
            var savedQuote = new RetrieveQuote();
            //if (currSavedQuote.policyNumber) {
            savedQuote.policyNumber = currSavedQuote.policyNumber;
            savedQuote.controlNumber = currSavedQuote.controlNumber;
            savedQuote.product = currSavedQuote.product;
            savedQuote.startDate = currSavedQuote.startDate;
            if (currSavedQuote && currSavedQuote.agentBusinessCard) {
                savedQuote.agentName = currSavedQuote.agentBusinessCard.name;
                savedQuote.agentPhoneNumber = currSavedQuote.agentBusinessCard.phoneNumber;
                savedQuote.agentEmailAddress = currSavedQuote.agentBusinessCard.emailAddress;
            }
            //}

            quotes.push(savedQuote);
        }
    }

    return quotes;
}

function ProcessAgentResponse(agentServResp) {
    var agents = [];
    if (agentServResp && agentServResp.agentAvailable && agentServResp.agents.length > 0) {
        for (var index = 0; index < agentServResp.agents.length; index++) {
            var currServAgent = agentServResp.agents[index];
            var agentInfo = new Agent();
            agentInfo.id = currServAgent.id;
            agentInfo.name = currServAgent.name;
            agentInfo.addressLine1 = currServAgent.addressLine1;
            agentInfo.city = currServAgent.city;
            agentInfo.state = currServAgent.state;
            var website = "https://www.agents.allstate.com/" + currServAgent.name.trim() + '-' + currServAgent.city.trim() + '-' + currServAgent.state + ".html";
            agentInfo.website = website.replace(/\s+/g, '-').toLowerCase();
            agentInfo.zipCode = currServAgent.zipCode;
            agentInfo.phoneNumber = currServAgent.phoneNumber;
            agentInfo.imageUrl = currServAgent.imageURL;
            agentInfo.emailAddress = currServAgent.emailAddress;
            agents.push(agentInfo);
        }
    }

    return agents;
}


//#endregion


module.exports = new AOS();

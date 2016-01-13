/* globals chrome */
import * as sleepOnIt from '../sleepOnIt.js'; 

(function() {
    'use strict';

    var CWS_LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/',
        TRIAL_PERIOD_DAYS = 2,
        retry = true,
        access_token,
        licenseStatus;

    getLicense();

    // Helper Util for making authenticated XHRs
    function xhrWithAuth(method, url, interactive, callback) {
        getToken();

        function getToken() {
            console.log('Calling chrome.identity.getAuthToken', interactive);
            chrome.identity.getAuthToken({
                interactive: interactive
            }, function(token) {
                if (chrome.runtime.lastError) {
                    callback(chrome.runtime.lastError);
                    return;
                }
                console.log('chrome.identity.getAuthToken returned a token', token);
                access_token = token;
                requestStart();
            });
        }

        function requestStart() {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
            xhr.onload = requestComplete;
            xhr.send();
        }

        function requestComplete(request) {
            if (request.status === 401 && retry) {
                retry = false;
                chrome.identity.removeCachedAuthToken({
                    token: access_token
                }, getToken);
            } else {
                callback(null, request.status, request.response);
            }
        }
    }

    function getLicense() {
        xhrWithAuth('GET', CWS_LICENSE_API_URL + chrome.runtime.id, true, onLicenseFetched);
    }

    function onLicenseFetched(error, status, response) {
        console.log(error, status, response);
        response = JSON.parse(response);
        licenseStatus = verifyAndSaveLicence(response);
        handleLicenceStatus(licenseStatus);
    }

    function verifyAndSaveLicence(license) {
        if (license.result && license.accessLevel === 'FULL') {
            console.log('Fully paid & properly licensed.');
            licenseStatus = 'FULL';
        } else if (license.result && license.accessLevel === 'FREE_TRIAL') {
            var daysAgoLicenseIssued = Date.now() - parseInt(license.createdTime, 10);
            daysAgoLicenseIssued = daysAgoLicenseIssued / 1000 / 60 / 60 / 24;
            if (daysAgoLicenseIssued <= TRIAL_PERIOD_DAYS) {
                console.log('Free trial, still within trial period');
                licenseStatus = 'FREE_TRIAL';
            } else {
                console.log('Free trial, trial period expired.');
                licenseStatus = 'FREE_TRIAL_EXPIRED';
            }
        } else {
            console.log('No license ever issued.');
            licenseStatus = 'NONE';
        }

        return licenseStatus;
    }

    function handleLicenceStatus(status) {
        if (status === 'FULL' || status === 'FREE_TRIAL') {
            sleepOnIt.startSleepOnIt();
        }
        alert('Couldn\'t start Sleep On It due to an issue with your licence: ' + status);
    }
})();

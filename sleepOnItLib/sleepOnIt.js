//test

import * as gmailListener from './addHookToGmail.js';
import * as sentimentAnalyser from './analyseSentiment.js';
import * as analyseDISC from './analyseDISCProfile.js';
import * as emailParser from './utils/emailParseUtil.js';
import * as lightBoxUtil from './utils/resultsLightbox.js';
import * as readabilityAnalyser from './utils/calculateReadingLevel.js';

(function () {

    'use strict';
    startSleepOnIt();
    console.log('***starting app with disc profile analysis');

    function startSleepOnIt() { 
        gmailListener.startApp();
        gmailListener.setSendButtonClickHandler(sleepOnItHandler);
    }

    function sleepOnItHandler (event) { 
        var emailBody = document.querySelector('div[aria-label=\'Message Body\']'),
            messageContents = emailParser.removeQuotedTextFromEmail(emailBody.textContent),
            results = '',
            sentiment = sentimentAnalyser.analyseSentiment(messageContents),
            readabilityScore = readabilityAnalyser.getQualitativeVocabularyLevel(messageContents),
            guessAtDISCProfile = analyseDISC.discProfileAnalyser.getUserReadableDISCProfile(messageContents, readabilityScore);

        console.log('**SOI analysis: ' + JSON.stringify(sentiment));
        console.log('**guessAtDISCProfile' + guessAtDISCProfile);

        results = 'Sentiment score: ' + sentiment.score + '<br>Vocabulary Level: ' + readabilityScore + '<br>DISC profile: ' + guessAtDISCProfile + '<br>Negative words: ' + sentiment.negative + '<br>Positive words: ' + sentiment.positive + '<br>';

        if (sentiment.score > 0 && sentiment.score < 2) {
            handleBlandEmail(results, sentiment.score, event);
        }
        if (sentiment.score < 2) {
            handleAngryEmail(results, sentiment.negative.length, event);
        }
        else if (sentiment.score > 15) {
            handleHappyEmail(results, sentiment.positive.length, event);
        }
        else {
            showResultsInLightbox(results);
            sendEmailAnyway();
        }
    }

    function handleHappyEmail (results, numberOfIssues, event) {
        results = 'Wow! Someone\'s in a good mood:)<br>It looks like you\'re about to do something you won\'t regret at all.<br>Sleep On It has detected ' + getCorrectPlural(numberOfIssues, 'happy word') + ' in your ' +
                'email:<br>' + results;
        
        showResultsInLightbox(results);

        sendEmailAnyway();
        event.preventDefault(); 
        return false; 
    }

    function handleBlandEmail (failMessage, score, event) {
        failMessage = 'Hmm this email is pretty bland and emotionless. The sentiment score is only ' + score + '.\nIf you don\'t want the recipient to think you\'re a robot, try injecting some pizazz into your email ;)\nNot fussed? Click Ok to send the email anyway. Click cancel to cancel sending.';

        if (!window.confirm(failMessage)) {
            event.preventDefault(); 
            return false; 
        } else {    
            sendEmailAnyway();
        }
    }

    function handleAngryEmail (failMessage, numberOfIssues, event) {
        failMessage = 'INTERVENTION!\nIt looks like you\'re about to do something you might regret.\nSleep On It has detected ' + getCorrectPlural(numberOfIssues, 'issue') + ' with your ' +
                'email:\n' + failMessage.replace(/<br>/g, '\n') + 'Click Ok to send the email anyway. Click cancel to cancel sending.';

        if (!window.confirm(failMessage)) {
            event.preventDefault(); 
            return false; 
        } else {    
            sendEmailAnyway();
        }
    }

    function showResultsInLightbox(results) {
        lightBoxUtil.displayContentInLightbox('<h2>Sleep On It Stats</h2><br>' + results);
    }

    function sendEmailAnyway () {
        gmailListener.triggerEmailSend();
        console.log('***Sending email anyway');
    }    

    function getCorrectPlural (number, word) {
        if (number === 1) {
            return '1 ' + word;
        }
        return number + ' ' + word + 's';
    }

})();

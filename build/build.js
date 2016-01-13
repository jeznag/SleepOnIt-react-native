(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _utilsResultsLightboxJs = require('./utils/resultsLightbox.js');

var lightBoxUtil = _interopRequireWildcard(_utilsResultsLightboxJs);

exports['default'] = (function () {

    'use strict';

    var sendButtons,
        wrapperDiv,
        zGbl_PageChangedByAJAX_Timer = '',
        _sendButtonClickHandler;

    function startApp() {
        console.log('***Sleep On It Starting');
        window.addEventListener('load', localMain, false);
    }

    function localMain() {
        if (typeof zGbl_PageChangedByAJAX_Timer === 'number') {
            clearTimeout(zGbl_PageChangedByAJAX_Timer);
            zGbl_PageChangedByAJAX_Timer = '';
        }

        document.body.addEventListener('DOMNodeInserted', pageBitHasLoaded, false);
    }

    function pageBitHasLoaded() {
        if (typeof zGbl_PageChangedByAJAX_Timer === 'number') {
            clearTimeout(zGbl_PageChangedByAJAX_Timer);
            zGbl_PageChangedByAJAX_Timer = '';
        }

        zGbl_PageChangedByAJAX_Timer = setTimeout(function () {
            handlePageChange();
        }, 666);
    }

    function handlePageChange() {
        removeEventListener('DOMNodeInserted', pageBitHasLoaded, false);
        var hasSendButtonOnPage = document.querySelector('div[aria-label*=Send]') !== null;
        if (hasSendButtonOnPage) {
            setUpSleepOnIt();
        }
    }

    function setUpSleepOnIt() {
        if (!document.querySelector('#sleepOnItSendBlocker')) {

            sendButtons = document.querySelectorAll('div[aria-label*=Send]');
            console.log('***Sleep on it found ' + sendButtons.length + ' send buttons. Adding wrapper divs');

            for (var i = 0; i < sendButtons.length; i++) {
                var sendButton = sendButtons[i];

                wrapSendButton(sendButton);
            }

            lightBoxUtil.addLightBoxCSS();
        }
    }

    function wrapSendButton(sendButton) {
        wrapperDiv = document.createElement('div');
        console.log('***Adding wrapper div to ' + sendButton);

        wrapperDiv.id = 'sleepOnItSendBlocker';
        wrapperDiv.style.margin = '0px';
        wrapperDiv.style.padding = '0px';
        wrapperDiv.style.border = 'none';
        sendButton.style.marginTop = '-15px';

        sendButton.innerHTML = 'Send <img style=\'width:15px;\' src=\'https://lh3.googleusercontent.com/4OaRE_xbHQe4fWaRBflJEITLTc9LZddS49aDwLtAPAY4TA0-Ikk34OU1wBcTd6Q7FM46ku6a=s26-h26-e365-rw\'/>';

        wrapperDiv.innerHTML = sendButton.outerHTML;
        sendButton.parentElement.appendChild(wrapperDiv);
        sendButton.remove();

        wrapperDiv.addEventListener('click', _sendButtonClickHandler);
    }

    function setSendButtonClickHandler(sendButtonClickHandler) {
        _sendButtonClickHandler = sendButtonClickHandler;
    }

    function triggerEmailSend() {
        var evt = document.createEvent('MouseEvents');

        evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

        sendButtons[0].dispatchEvent(evt);
    }

    return {
        startApp: startApp,
        setSendButtonClickHandler: setSendButtonClickHandler,
        triggerEmailSend: triggerEmailSend
    };
})();

module.exports = exports['default'];

},{"./utils/resultsLightbox.js":10}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _analyseSentimentJs = require('./analyseSentiment.js');

var sentimentAnalyser = _interopRequireWildcard(_analyseSentimentJs);

var _utilsEgoismAnalyserJs = require('./utils/egoismAnalyser.js');

var egoismAnalyser = _interopRequireWildcard(_utilsEgoismAnalyserJs);

var discProfileAnalyser = (function () {
    'use strict';

    var sentimentScores, prefixModifiers, postfixModifiers, currentPrefixModifierScore, currentPostfixModifierScore, lastNormalTokenSentimentScore;

    function getUserReadableDISCProfile(emailContents, readabilityScore) {
        var bestGuessAtDISCProfile = analyseEmail(emailContents, readabilityScore),
            highestProfileScore = 1,
            highestProfile = '',
            secondHighestProfileScore = 1,
            secondHighestProfile = '';

        Object.keys(bestGuessAtDISCProfile).forEach(function (profile) {
            if (bestGuessAtDISCProfile[profile] > highestProfileScore) {
                highestProfile = profile;
                highestProfileScore = bestGuessAtDISCProfile[profile];
            } else if (bestGuessAtDISCProfile[profile] > secondHighestProfileScore) {
                secondHighestProfile = profile;
                secondHighestProfileScore = bestGuessAtDISCProfile[profile];
            }
        });

        return highestProfile + secondHighestProfile;
    }

    /**
     * Attempts to guess the DISC profile of a sender based on an email they've sent
     *
     * @param {String} emailContents  Contents of email to analyse
     * @param {Integer} readabilityScore  Readability score of email (analysed already)
     *
     * @return {Object}
     */
    function analyseEmail(emailContents, readabilityScore) {
        if (emailContents === undefined) emailContents = '';

        var guessAtDISCProfile = {
            'D': 1,
            'I': 1,
            'S': 1,
            'C': 1
        };

        addGuessBasedOnSentiment(emailContents, guessAtDISCProfile);

        addGuessBasedOnVocabulary(readabilityScore, guessAtDISCProfile);

        addGuessBasedOnEgoism(emailContents, guessAtDISCProfile);

        reduceGuessesThatExceedThreshold(guessAtDISCProfile);

        return guessAtDISCProfile;
    }

    function addGuessBasedOnSentiment(emailContents, guessAtDISCProfile) {
        var sentimentScore = sentimentAnalyser.analyseSentiment(emailContents).score,
            lengthOfEmail = emailContents.length,
            LENGTH_OF_SHORT_EMAIL = 30;

        var CHEERFUL_SENTIMENT_SCORE = 5,
            HYPER_CHEERFUL_SENTIMENT_SCORE = 15;

        if (sentimentScore < CHEERFUL_SENTIMENT_SCORE) {
            if (lengthOfEmail < LENGTH_OF_SHORT_EMAIL) {
                guessAtDISCProfile.D += 4;
            } else {
                guessAtDISCProfile.C += 3;
            }
        } else {
            if (sentimentScore > HYPER_CHEERFUL_SENTIMENT_SCORE) {
                guessAtDISCProfile.I += 5;
            } else {
                guessAtDISCProfile.S += 3;
            }
        }
    }

    function addGuessBasedOnVocabulary(readabilityScore, guessAtDISCProfile) {
        var ADVANCED_VOCAB_LEVEL = 4.0;

        if (readabilityScore >= ADVANCED_VOCAB_LEVEL) {
            guessAtDISCProfile.C += 2;
        }
    }

    function addGuessBasedOnEgoism(emailContents, guessAtDISCProfile) {
        var egoismScores = egoismAnalyser.analyseEgoism(emailContents);

        if (egoismScores.selfish > egoismScores.controlling && egoismScores.selfish > egoismScores.conforming) {

            guessAtDISCProfile.I += 2;
        } else if (egoismScores.controlling > egoismScores.selfish && egoismScores.controlling > egoismScores.conforming) {

            guessAtDISCProfile.D += 2;
        } else if (egoismScores.conforming > egoismScores.controlling) {

            guessAtDISCProfile.S += 2;
        }
    }

    function reduceGuessesThatExceedThreshold(guessAtDISCProfile) {
        var MAX_SCORE = 7;

        Object.keys(guessAtDISCProfile).forEach(function (profile) {
            if (guessAtDISCProfile[profile] > MAX_SCORE) {
                guessAtDISCProfile[profile] = MAX_SCORE;
            }
        });
    }

    return {
        analyseEmail: analyseEmail,
        getUserReadableDISCProfile: getUserReadableDISCProfile
    };
})();
exports.discProfileAnalyser = discProfileAnalyser;

},{"./analyseSentiment.js":3,"./utils/egoismAnalyser.js":7}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _node_modulesUnderscoreUnderscoreJs = require('../node_modules/underscore/underscore.js');

var _node_modulesUnderscoreUnderscoreJs2 = _interopRequireDefault(_node_modulesUnderscoreUnderscoreJs);

var _sentimentWordListJs = require('./sentimentWordList.js');

var sentimentWordList = _interopRequireWildcard(_sentimentWordListJs);

var _utilsRegexListJs = require('./utils/regexList.js');

var regexList = _interopRequireWildcard(_utilsRegexListJs);

var analyseSentiment = (function () {
    'use strict';

    var sentimentScores, prefixModifiers, postfixModifiers, currentPrefixModifierScore, currentPostfixModifierScore, lastNormalTokenSentimentScore;

    /**
     * From https://github.com/thisandagain/sentiment/blob/master/lib/index.js
     * Performs sentiment analysis on the provided input "phrase".
     *
     * @param {String} Input phrase
     * @param {Object} Optional sentiment additions to sentimentScores (hash k/v pairs)
     *
     * @return {Object}
     */
    function analyseSentiment() {
        var phrase = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        var inject = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        setupWordList(inject);

        // Storage objects
        var tokens = tokenize(phrase),
            score = 0,
            words = [],
            positive = [],
            negative = [];

        currentPrefixModifierScore = 1;
        currentPostfixModifierScore = 1;
        lastNormalTokenSentimentScore = 0;

        tokens.forEach(function (word, index) {
            var wordSentimentScore = analyseSentimentForWord(word);

            if (!wordSentimentScore) {
                return;
            }

            words.push(word);

            if (wordSentimentScore > 0) {
                positive.push(word);
            } else if (wordSentimentScore < 0) {
                negative.push(word);
            }

            score += wordSentimentScore;
        });

        // Handle optional async interface
        var result = {
            score: score,
            comparative: score / tokens.length,
            tokens: tokens,
            words: words,
            positive: positive,
            negative: negative
        };

        if (callback === null) {
            return result;
        }

        _node_modulesUnderscoreUnderscoreJs2['default'].defer(function () {
            callback(null, result);
        });
    }

    function analyseSentimentForWord(word) {
        var lowerCaseWord = word.toLowerCase(),
            tokenPrefixModifierScore = prefixModifiers[lowerCaseWord],
            tokenPostfixModifierScore = postfixModifiers[lowerCaseWord],
            tokenSentimentScore = sentimentScores[lowerCaseWord],
            processedSentimentScore = 0,
            isAllUpperCase = word.toUpperCase() === word,
            MULTIPLIER_FOR_ALL_UPPER_CASE = 2,
            shouldAddToScore = tokenPrefixModifierScore || tokenPostfixModifierScore || tokenSentimentScore;

        if (tokenPrefixModifierScore) {
            //subtract 1 because the modifier starts at x1 rather than x0
            //if modifier == 2, we want x2 not x3
            currentPrefixModifierScore += tokenPrefixModifierScore - 1;
        }

        if (tokenPostfixModifierScore) {
            currentPostfixModifierScore += tokenPostfixModifierScore - 1;
        }

        if (tokenSentimentScore) {
            lastNormalTokenSentimentScore = tokenSentimentScore;

            if (isAllUpperCase) {
                lastNormalTokenSentimentScore *= MULTIPLIER_FOR_ALL_UPPER_CASE;
            }
        }

        if (lastNormalTokenSentimentScore && shouldAddToScore) {
            processedSentimentScore = lastNormalTokenSentimentScore * currentPrefixModifierScore * currentPostfixModifierScore;
            currentPrefixModifierScore = 1;
            currentPostfixModifierScore = 1;
        }

        return processedSentimentScore;
    }

    function setupWordList(inject) {
        if (!sentimentScores) {
            sentimentScores = _node_modulesUnderscoreUnderscoreJs2['default'].clone(sentimentWordList.SENTIMENT_SCORES);
        }

        if (!prefixModifiers) {
            prefixModifiers = _node_modulesUnderscoreUnderscoreJs2['default'].clone(sentimentWordList.PREFIX_MODIFIERS);
        }

        if (!postfixModifiers) {
            postfixModifiers = _node_modulesUnderscoreUnderscoreJs2['default'].clone(sentimentWordList.POSTFIX_MODIFIERS);
        }

        // Merge
        if (inject !== null) {
            sentimentScores = _node_modulesUnderscoreUnderscoreJs2['default'].extend(sentimentScores, inject);
        }
    }

    /**
     * Tokenizes an input string.
     *
     * @param {String} Input
     *
     * @return {Array}
     */
    function tokenize(input) {

        if (!input) {
            return input;
        }

        var BR_Tags = 'divbr',
            EXCLAMATION_MARKS = /(\!)/g,
            QUESTION_MARKS = /\?/g,
            EXTRA_SPACES = '/ {2,}/';

        return input.replace(regexList.EMOJI_REGEX, ' $1 ').replace(BR_Tags, '').replace(EXCLAMATION_MARKS, ' $1 ').replace(QUESTION_MARKS, ' ? ').replace(EXTRA_SPACES, ' ').split(' ');
    }

    return analyseSentiment;
})();
exports.analyseSentiment = analyseSentiment;

},{"../node_modules/underscore/underscore.js":11,"./sentimentWordList.js":4,"./utils/regexList.js":9}],4:[function(require,module,exports){

/**
**
Copyright (c) 2012 - 2014 Andrew Sliwinski.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var SENTIMENT_SCORES = { 'abandon': -2, 'abandoned': -2, 'abandons': -2, 'abducted': -2, 'abduction': -2, 'abductions': -2, 'abhor': -3, 'abhorred': -3, 'abhorrent': -3, 'abhors': -3, 'abilities': 2, 'ability': 2, 'aboard': 1, 'absentee': -1, 'absentees': -1, 'absolve': 2, 'absolved': 2, 'absolves': 2, 'absolving': 2, 'absorbed': 1, 'abuse': -3, 'abused': -3, 'abuses': -3, 'abusive': -3, 'accept': 1, 'accepted': 1, 'accepting': 1, 'accepts': 1, 'accident': -2, 'accidental': -2, 'accidentally': -2, 'accidents': -2, 'accomplish': 2, 'accomplished': 2, 'accomplishes': 2, 'accusation': -2, 'accusations': -2, 'accuse': -2, 'accused': -2, 'accuses': -2, 'accusing': -2, 'ache': -2, 'achievable': 1, 'aching': -2, 'acquit': 2, 'acquits': 2, 'acquitted': 2, 'acquitting': 2, 'acrimonious': -3, 'active': 1, 'adequate': 1, 'admire': 3, 'admired': 3, 'admires': 3, 'admiring': 3, 'admit': -1, 'admits': -1, 'admitted': -1, 'admonish': -2, 'admonished': -2, 'adopt': 1, 'adopts': 1, 'adorable': 3, 'adore': 3, 'adored': 3, 'adores': 3, 'advanced': 1, 'advantage': 2, 'advantages': 2, 'adventure': 2, 'adventures': 2, 'adventurous': 2, 'affected': -1, 'affection': 3, 'affectionate': 3, 'afflicted': -1, 'affronted': -1, 'afraid': -2, 'aggravate': -2, 'aggravated': -2, 'aggravates': -2, 'aggravating': -2, 'aggression': -2, 'aggressions': -2, 'aggressive': -2, 'aghast': -2, 'agog': 2, 'agonise': -3, 'agonised': -3, 'agonises': -3, 'agonising': -3, 'agonize': -3, 'agonized': -3, 'agonizes': -3, 'agonizing': -3, 'agree': 1, 'agreeable': 2, 'agreed': 1, 'agreement': 1, 'agrees': 1, 'alarm': -2, 'alarmed': -2, 'alarmist': -2, 'alarmists': -2, 'alas': -1, 'alert': -1, 'alienation': -2, 'alive': 1, 'all': 2, 'allergic': -2, 'allow': 1, 'alone': -2, 'amaze': 2, 'amazed': 2, 'amazes': 2, 'amazing': 4, 'ambitious': 2, 'ambivalent': -1, 'amuse': 3, 'amused': 3, 'amusement': 3, 'amusements': 3, 'anger': -3, 'angers': -3, 'angry': -3, 'anguish': -3, 'anguished': -3, 'animosity': -2, 'annoy': -2, 'annoyance': -2, 'annoyed': -2, 'annoying': -2, 'annoys': -2, 'antagonistic': -2, 'anti': -1, 'anticipation': 1, 'anxiety': -2, 'anxious': -2, 'apathetic': -3, 'apathy': -3, 'apeshit': -3, 'apocalyptic': -2, 'apologise': -1, 'apologised': -1, 'apologises': -1, 'apologising': -1, 'apologize': -1, 'apologized': -1, 'apologizes': -1, 'apologizing': -1, 'apology': -1, 'appalled': -2, 'appalling': -2, 'appease': 2, 'appeased': 2, 'appeases': 2, 'appeasing': 2, 'applaud': 2, 'applauded': 2, 'applauding': 2, 'applauds': 2, 'applause': 2, 'appreciate': 2, 'appreciated': 2, 'appreciates': 2, 'appreciating': 2, 'appreciation': 2, 'apprehensive': -2, 'approval': 2, 'approved': 2, 'approves': 2, 'ardent': 1, 'arrest': -2, 'arrested': -3, 'arrests': -2, 'arrogant': -2, 'ashame': -2, 'ashamed': -2, 'ass': -4, 'assassination': -3, 'assassinations': -3, 'asset': 2, 'assets': 2, 'assfucking': -4, 'asshole': -4, 'astonished': 2, 'astound': 3, 'astounded': 3, 'astounding': 3, 'astoundingly': 3, 'astounds': 3, 'attack': -1, 'attacked': -1, 'attacking': -1, 'attacks': -1, 'attract': 1, 'attracted': 1, 'attracting': 2, 'attraction': 2, 'attractions': 2, 'attracts': 1, 'audacious': 3, 'authority': 1, 'avert': -1, 'averted': -1, 'averts': -1, 'avid': 2, 'avoid': -1, 'avoided': -1, 'avoids': -1, 'await': -1, 'awaited': -1, 'awaits': -1, 'award': 3, 'awarded': 3, 'awards': 3, 'awesome': 4, 'awful': -3, 'awkward': -2, 'axe': -1, 'axed': -1, 'backed': 1, 'backing': 2, 'backs': 1, 'bad': -3, 'badass': -3, 'badly': -3, 'bailout': -2, 'bamboozle': -2, 'bamboozled': -2, 'bamboozles': -2, 'ban': -2, 'banish': -1, 'bankrupt': -3, 'bankster': -3, 'banned': -2, 'bargain': 2, 'barrier': -2, 'bastard': -5, 'bastards': -5, 'battle': -1, 'battles': -1, 'beaten': -2, 'beatific': 3, 'beating': -1, 'beauties': 3, 'beautiful': 3, 'beautifully': 3, 'beautify': 3, 'belittle': -2, 'belittled': -2, 'beloved': 3, 'benefit': 2, 'benefits': 2, 'benefitted': 2, 'benefitting': 2, 'bereave': -2, 'bereaved': -2, 'bereaves': -2, 'bereaving': -2, 'best': 3, 'betray': -3, 'betrayal': -3, 'betrayed': -3, 'betraying': -3, 'betrays': -3, 'better': 2, 'bias': -1, 'biased': -2, 'big': 1, 'bitch': -5, 'bitches': -5, 'bitter': -2, 'bitterly': -2, 'bizarre': -2, 'blah': -2, 'blame': -2, 'blamed': -2, 'blames': -2, 'blaming': -2, 'blast': 2, 'bless': 2, 'blesses': 2, 'blessing': 3, 'blind': -1, 'bliss': 3, 'blissful': 3, 'blithe': 2, 'block': -1, 'blockbuster': 3, 'blocked': -1, 'blocking': -1, 'blocks': -1, 'blurry': -2, 'boastful': -2, 'bold': 2, 'boldly': 2, 'bomb': -1, 'boost': 1, 'boosted': 1, 'boosting': 1, 'boosts': 1, 'bore': -2, 'bored': -2, 'boring': -3, 'bother': -2, 'bothered': -2, 'bothers': -2, 'bothersome': -2, 'boycott': -2, 'boycotted': -2, 'boycotting': -2, 'boycotts': -2, 'brainwashing': -3, 'brave': 2, 'breakthrough': 3, 'breathtaking': 5, 'bribe': -3, 'bright': 1, 'brightest': 2, 'brightness': 1, 'brilliant': 4, 'brisk': 2, 'broke': -1, 'broken': -1, 'brooding': -2, 'bullied': -2, 'bullshit': -4, 'bully': -2, 'bullying': -2, 'bummer': -2, 'buoyant': 2, 'burden': -2, 'burdened': -2, 'burdening': -2, 'burdens': -2, 'calm': 2, 'calmed': 2, 'calming': 2, 'calms': 2, 'can\'t stand': -3, 'cancel': -1, 'cancelled': -1, 'cancelling': -1, 'cancels': -1, 'cancer': -1, 'capable': 1, 'captivated': 3, 'care': 2, 'carefree': 1, 'careful': 2, 'carefully': 2, 'careless': -2, 'cares': 2, 'cashing in': -2, 'casualty': -2, 'catastrophe': -3, 'catastrophic': -4, 'cautious': -1, 'celebrate': 3, 'celebrated': 3, 'celebrates': 3, 'celebrating': 3, 'censor': -2, 'censored': -2, 'censors': -2, 'certain': 1, 'chagrin': -2, 'chagrined': -2, 'challenge': -1, 'chance': 2, 'chances': 2, 'chaos': -2, 'chaotic': -2, 'charged': -3, 'charges': -2, 'charm': 3, 'charming': 3, 'charmless': -3, 'chastise': -3, 'chastised': -3, 'chastises': -3, 'chastising': -3, 'cheat': -3, 'cheated': -3, 'cheater': -3, 'cheaters': -3, 'cheats': -3, 'cheer': 2, 'cheered': 2, 'cheerful': 2, 'cheering': 2, 'cheerless': -2, 'cheers': 2, 'cheery': 3, 'cherish': 2, 'cherished': 2, 'cherishes': 2, 'cherishing': 2, 'chic': 2, 'childish': -2, 'chilling': -1, 'choke': -2, 'choked': -2, 'chokes': -2, 'choking': -2, 'clarifies': 2, 'clarity': 2, 'clash': -2, 'classy': 3, 'clean': 2, 'cleaner': 2, 'clear': 1, 'cleared': 1, 'clearly': 1, 'clears': 1, 'clever': 2, 'clouded': -1, 'clueless': -2, 'cock': -5, 'cocksucker': -5, 'cocksuckers': -5, 'cocky': -2, 'coerced': -2, 'collapse': -2, 'collapsed': -2, 'collapses': -2, 'collapsing': -2, 'collide': -1, 'collides': -1, 'colliding': -1, 'collision': -2, 'collisions': -2, 'colluding': -3, 'combat': -1, 'combats': -1, 'comedy': 1, 'comfort': 2, 'comfortable': 2, 'comforting': 2, 'comforts': 2, 'commend': 2, 'commended': 2, 'commit': 1, 'commitment': 2, 'commits': 1, 'committed': 1, 'committing': 1, 'compassionate': 2, 'compelled': 1, 'competent': 2, 'competitive': 2, 'complacent': -2, 'complain': -2, 'complained': -2, 'complains': -2, 'comprehensive': 2, 'conciliate': 2, 'conciliated': 2, 'conciliates': 2, 'conciliating': 2, 'condemn': -2, 'condemnation': -2, 'condemned': -2, 'condemns': -2, 'confidence': 2, 'confident': 2, 'conflict': -2, 'conflicting': -2, 'conflictive': -2, 'conflicts': -2, 'confuse': -2, 'confused': -2, 'confusing': -2, 'congrats': 2, 'congratulate': 2, 'congratulation': 2, 'congratulations': 2, 'consent': 2, 'consents': 2, 'consolable': 2, 'conspiracy': -3, 'constrained': -2, 'contagion': -2, 'contagions': -2, 'contagious': -1, 'contempt': -2, 'contemptuous': -2, 'contemptuously': -2, 'contend': -1, 'contender': -1, 'contending': -1, 'contentious': -2, 'contestable': -2, 'controversial': -2, 'controversially': -2, 'convince': 1, 'convinced': 1, 'convinces': 1, 'convivial': 2, 'cool': 1, 'cool stuff': 3, 'cornered': -2, 'corpse': -1, 'costly': -2, 'courage': 2, 'courageous': 2, 'courteous': 2, 'courtesy': 2, 'cover-up': -3, 'coward': -2, 'cowardly': -2, 'coziness': 2, 'cramp': -1, 'crap': -3, 'crash': -2, 'crazier': -2, 'craziest': -2, 'crazy': -2, 'creative': 2, 'crestfallen': -2, 'cried': -2, 'cries': -2, 'crime': -3, 'criminal': -3, 'criminals': -3, 'crisis': -3, 'critic': -2, 'criticism': -2, 'criticize': -2, 'criticized': -2, 'criticizes': -2, 'criticizing': -2, 'critics': -2, 'cruel': -3, 'cruelty': -3, 'crush': -1, 'crushed': -2, 'crushes': -1, 'crushing': -1, 'cry': -1, 'crying': -2, 'cunt': -5, 'curious': 1, 'curse': -1, 'cut': -1, 'cute': 2, 'cuts': -1, 'cutting': -1, 'cynic': -2, 'cynical': -2, 'cynicism': -2, 'damage': -3, 'damages': -3, 'damn': -4, 'damned': -4, 'damnit': -4, 'danger': -2, 'daredevil': 2, 'daring': 2, 'darkest': -2, 'darkness': -1, 'dauntless': 2, 'dead': -3, 'deadlock': -2, 'deafening': -1, 'dear': 2, 'dearly': 3, 'death': -2, 'debonair': 2, 'debt': -2, 'deceit': -3, 'deceitful': -3, 'deceive': -3, 'deceived': -3, 'deceives': -3, 'deceiving': -3, 'deception': -3, 'decisive': 1, 'dedicated': 2, 'defeated': -2, 'defect': -3, 'defects': -3, 'defender': 2, 'defenders': 2, 'defenseless': -2, 'defer': -1, 'deferring': -1, 'defiant': -1, 'deficit': -2, 'degrade': -2, 'degraded': -2, 'degrades': -2, 'dehumanize': -2, 'dehumanized': -2, 'dehumanizes': -2, 'dehumanizing': -2, 'deject': -2, 'dejected': -2, 'dejecting': -2, 'dejects': -2, 'delay': -1, 'delayed': -1, 'delight': 3, 'delighted': 3, 'delighting': 3, 'delights': 3, 'demand': -1, 'demanded': -1, 'demanding': -1, 'demands': -1, 'demonstration': -1, 'demoralized': -2, 'denied': -2, 'denier': -2, 'deniers': -2, 'denies': -2, 'denounce': -2, 'denounces': -2, 'deny': -2, 'denying': -2, 'depressed': -2, 'depressing': -2, 'derail': -2, 'derailed': -2, 'derails': -2, 'deride': -2, 'derided': -2, 'derides': -2, 'deriding': -2, 'derision': -2, 'desirable': 2, 'desire': 1, 'desired': 2, 'desirous': 2, 'despair': -3, 'despairing': -3, 'despairs': -3, 'desperate': -3, 'desperately': -3, 'despondent': -3, 'destroy': -3, 'destroyed': -3, 'destroying': -3, 'destroys': -3, 'destruction': -3, 'destructive': -3, 'detached': -1, 'detain': -2, 'detained': -2, 'detention': -2, 'determined': 2, 'devastate': -2, 'devastated': -2, 'devastating': -2, 'devoted': 3, 'diamond': 1, 'dick': -4, 'dickhead': -4, 'die': -3, 'died': -3, 'difficult': -1, 'diffident': -2, 'dilemma': -1, 'dipshit': -3, 'dire': -3, 'direful': -3, 'dirt': -2, 'dirtier': -2, 'dirtiest': -2, 'dirty': -2, 'disabling': -1, 'disadvantage': -2, 'disadvantaged': -2, 'disappear': -1, 'disappeared': -1, 'disappears': -1, 'disappoint': -2, 'disappointed': -2, 'disappointing': -2, 'disappointment': -2, 'disappointments': -2, 'disappoints': -2, 'disaster': -2, 'disasters': -2, 'disastrous': -3, 'disbelieve': -2, 'discard': -1, 'discarded': -1, 'discarding': -1, 'discards': -1, 'disconsolate': -2, 'disconsolation': -2, 'discontented': -2, 'discord': -2, 'discounted': -1, 'discouraged': -2, 'discredited': -2, 'disdain': -2, 'disgrace': -2, 'disgraced': -2, 'disguise': -1, 'disguised': -1, 'disguises': -1, 'disguising': -1, 'disgust': -3, 'disgusted': -3, 'disgusting': -3, 'disheartened': -2, 'dishonest': -2, 'disillusioned': -2, 'disinclined': -2, 'disjointed': -2, 'dislike': -2, 'dismal': -2, 'dismayed': -2, 'disorder': -2, 'disorganized': -2, 'disoriented': -2, 'disparage': -2, 'disparaged': -2, 'disparages': -2, 'disparaging': -2, 'displeased': -2, 'dispute': -2, 'disputed': -2, 'disputes': -2, 'disputing': -2, 'disqualified': -2, 'disquiet': -2, 'disregard': -2, 'disregarded': -2, 'disregarding': -2, 'disregards': -2, 'disrespect': -2, 'disrespected': -2, 'disruption': -2, 'disruptions': -2, 'disruptive': -2, 'dissatisfied': -2, 'distort': -2, 'distorted': -2, 'distorting': -2, 'distorts': -2, 'distract': -2, 'distracted': -2, 'distraction': -2, 'distracts': -2, 'distress': -2, 'distressed': -2, 'distresses': -2, 'distressing': -2, 'distrust': -3, 'distrustful': -3, 'disturb': -2, 'disturbed': -2, 'disturbing': -2, 'disturbs': -2, 'dithering': -2, 'dizzy': -1, 'dodging': -2, 'dodgy': -2, 'does not work': -3, 'dolorous': -2, 'dont like': -2, 'doom': -2, 'doomed': -2, 'doubt': -1, 'doubted': -1, 'doubtful': -1, 'doubting': -1, 'doubts': -1, 'douche': -3, 'douchebag': -3, 'downcast': -2, 'downhearted': -2, 'downside': -2, 'drag': -1, 'dragged': -1, 'drags': -1, 'drained': -2, 'dread': -2, 'dreaded': -2, 'dreadful': -3, 'dreading': -2, 'dream': 1, 'dreams': 1, 'dreary': -2, 'droopy': -2, 'drop': -1, 'drown': -2, 'drowned': -2, 'drowns': -2, 'drunk': -2, 'dubious': -2, 'dud': -2, 'dull': -2, 'dumb': -3, 'dumbass': -3, 'dump': -1, 'dumped': -2, 'dumps': -1, 'dupe': -2, 'duped': -2, 'dysfunction': -2, 'eager': 2, 'earnest': 2, 'ease': 2, 'easy': 1, 'ecstatic': 4, 'eerie': -2, 'eery': -2, 'effective': 2, 'effectively': 2, 'elated': 3, 'elation': 3, 'elegant': 2, 'elegantly': 2, 'embarrass': -2, 'embarrassed': -2, 'embarrasses': -2, 'embarrassing': -2, 'embarrassment': -2, 'embittered': -2, 'embrace': 1, 'emergency': -2, 'empathetic': 2, 'emptiness': -1, 'empty': -1, 'enchanted': 2, 'encourage': 2, 'encouraged': 2, 'encouragement': 2, 'encourages': 2, 'endorse': 2, 'endorsed': 2, 'endorsement': 2, 'endorses': 2, 'enemies': -2, 'enemy': -2, 'energetic': 2, 'engage': 1, 'engages': 1, 'engrossed': 1, 'enjoy': 2, 'enjoying': 2, 'enjoys': 2, 'enlighten': 2, 'enlightened': 2, 'enlightening': 2, 'enlightens': 2, 'ennui': -2, 'enrage': -2, 'enraged': -2, 'enrages': -2, 'enraging': -2, 'enrapture': 3, 'enslave': -2, 'enslaved': -2, 'enslaves': -2, 'ensure': 1, 'ensuring': 1, 'enterprising': 1, 'entertaining': 2, 'enthral': 3, 'enthusiastic': 3, 'entitled': 1, 'entrusted': 2, 'envies': -1, 'envious': -2, 'envy': -1, 'envying': -1, 'erroneous': -2, 'error': -2, 'errors': -2, 'escape': -1, 'escapes': -1, 'escaping': -1, 'esteemed': 2, 'ethical': 2, 'euphoria': 3, 'euphoric': 4, 'eviction': -1, 'evil': -3, 'exaggerate': -2, 'exaggerated': -2, 'exaggerates': -2, 'exaggerating': -2, 'exasperated': 2, 'excellence': 3, 'excellent': 3, 'excite': 3, 'excited': 3, 'excitement': 3, 'exciting': 3, 'exclude': -1, 'excluded': -2, 'exclusion': -1, 'exclusive': 2, 'excuse': -1, 'exempt': -1, 'exhausted': -2, 'exhilarated': 3, 'exhilarates': 3, 'exhilarating': 3, 'exonerate': 2, 'exonerated': 2, 'exonerates': 2, 'exonerating': 2, 'expand': 1, 'expands': 1, 'expel': -2, 'expelled': -2, 'expelling': -2, 'expels': -2, 'exploit': -2, 'exploited': -2, 'exploiting': -2, 'exploits': -2, 'exploration': 1, 'explorations': 1, 'expose': -1, 'exposed': -1, 'exposes': -1, 'exposing': -1, 'extend': 1, 'extends': 1, 'exuberant': 4, 'exultant': 3, 'exultantly': 3, 'fabulous': 4, 'fad': -2, 'fag': -3, 'faggot': -3, 'faggots': -3, 'fail': -2, 'failed': -2, 'failing': -2, 'fails': -2, 'failure': -2, 'failures': -2, 'fainthearted': -2, 'fair': 2, 'faith': 1, 'faithful': 3, 'fake': -3, 'fakes': -3, 'faking': -3, 'fallen': -2, 'falling': -1, 'falsified': -3, 'falsify': -3, 'fame': 1, 'fan': 3, 'fantastic': 4, 'farce': -1, 'fascinate': 3, 'fascinated': 3, 'fascinates': 3, 'fascinating': 3, 'fascist': -2, 'fascists': -2, 'fatalities': -3, 'fatality': -3, 'fatigue': -2, 'fatigued': -2, 'fatigues': -2, 'fatiguing': -2, 'favor': 2, 'favored': 2, 'favorite': 2, 'favorited': 2, 'favorites': 2, 'favors': 2, 'fear': -2, 'fearful': -2, 'fearing': -2, 'fearless': 2, 'fearsome': -2, 'fed up': -3, 'feeble': -2, 'feeling': 1, 'felonies': -3, 'felony': -3, 'fervent': 2, 'fervid': 2, 'festive': 2, 'fiasco': -3, 'fidgety': -2, 'fight': -1, 'fine': 2, 'fire': -2, 'fired': -2, 'firing': -2, 'fit': 1, 'fitness': 1, 'flagship': 2, 'flees': -1, 'flop': -2, 'flops': -2, 'flu': -2, 'flustered': -2, 'focused': 2, 'fond': 2, 'fondness': 2, 'fool': -2, 'foolish': -2, 'fools': -2, 'forced': -1, 'foreclosure': -2, 'foreclosures': -2, 'forget': -1, 'forgetful': -2, 'forgive': 1, 'forgiving': 1, 'forgotten': -1, 'fortunate': 2, 'frantic': -1, 'fraud': -4, 'frauds': -4, 'fraudster': -4, 'fraudsters': -4, 'fraudulence': -4, 'fraudulent': -4, 'free': 1, 'freedom': 2, 'frenzy': -3, 'fresh': 1, 'friendly': 2, 'fright': -2, 'frightened': -2, 'frightening': -3, 'frikin': -2, 'frisky': 2, 'frowning': -1, 'frustrate': -2, 'frustrated': -2, 'frustrates': -2, 'frustrating': -2, 'frustration': -2, 'ftw': 3, 'fuck': -4, 'fucked': -10, 'fucker': -4, 'fuckers': -4, 'fuckface': -4, 'fuckhead': -4, 'fucktard': -4, 'fud': -3, 'fuked': -4, 'fuking': -4, 'fulfill': 2, 'fulfilled': 2, 'fulfills': 2, 'fuming': -2, 'fun': 4, 'funeral': -1, 'funerals': -1, 'funky': 2, 'funnier': 4, 'funny': 4, 'furious': -3, 'futile': 2, 'gag': -2, 'gagged': -2, 'gain': 2, 'gained': 2, 'gaining': 2, 'gains': 2, 'gallant': 3, 'gallantly': 3, 'gallantry': 3, 'generous': 2, 'genial': 3, 'ghost': -1, 'giddy': -2, 'gift': 2, 'glad': 3, 'glamorous': 3, 'glamourous': 3, 'glee': 3, 'gleeful': 3, 'gloom': -1, 'gloomy': -2, 'glorious': 2, 'glory': 2, 'glum': -2, 'god': 1, 'goddamn': -3, 'godsend': 4, 'good': 3, 'goodness': 3, 'grace': 1, 'gracious': 3, 'grand': 3, 'grant': 1, 'granted': 1, 'granting': 1, 'grants': 1, 'grateful': 3, 'gratification': 2, 'grave': -2, 'gray': -1, 'great': 3, 'greater': 3, 'greatest': 3, 'greed': -3, 'greedy': -2, 'green wash': -3, 'green washing': -3, 'greenwash': -3, 'greenwasher': -3, 'greenwashers': -3, 'greenwashing': -3, 'greet': 1, 'greeted': 1, 'greeting': 1, 'greetings': 2, 'greets': 1, 'grey': -1, 'grief': -2, 'grieved': -2, 'gross': -2, 'growing': 1, 'growth': 2, 'guarantee': 1, 'guilt': -3, 'guilty': -3, 'gullibility': -2, 'gullible': -2, 'gun': -1, 'ha': 2, 'hacked': -1, 'haha': 3, 'hahaha': 3, 'hahahah': 3, 'hail': 2, 'hailed': 2, 'hapless': -2, 'haplessness': -2, 'happiness': 3, 'happy': 3, 'hard': -1, 'hardier': 2, 'hardship': -2, 'hardy': 2, 'harm': -2, 'harmed': -2, 'harmful': -2, 'harming': -2, 'harms': -2, 'harried': -2, 'harsh': -2, 'harsher': -2, 'harshest': -2, 'hate': -3, 'hated': -3, 'haters': -3, 'hates': -3, 'hating': -3, 'haunt': -1, 'haunted': -2, 'haunting': 1, 'haunts': -1, 'havoc': -2, 'healthy': 2, 'heartbreaking': -3, 'heartbroken': -3, 'heartfelt': 3, 'heaven': 2, 'heavenly': 4, 'heavyhearted': -2, 'hell': -4, 'help': 2, 'helpful': 2, 'helping': 2, 'helpless': -2, 'helps': 2, 'hero': 2, 'heroes': 2, 'heroic': 3, 'hesitant': -2, 'hesitate': -2, 'hid': -1, 'hide': -1, 'hides': -1, 'hiding': -1, 'highlight': 2, 'hilarious': 2, 'hindrance': -2, 'hoax': -2, 'homesick': -2, 'honest': 2, 'honor': 2, 'honored': 2, 'honoring': 2, 'honour': 2, 'honoured': 2, 'honouring': 2, 'hooligan': -2, 'hooliganism': -2, 'hooligans': -2, 'hope': 2, 'hopeful': 2, 'hopefully': 2, 'hopeless': -2, 'hopelessness': -2, 'hopes': 2, 'hoping': 2, 'horrendous': -3, 'horrible': -3, 'horrific': -3, 'horrified': -3, 'hostile': -2, 'huckster': -2, 'hug': 2, 'huge': 1, 'hugs': 2, 'humerous': 3, 'humiliated': -3, 'humiliation': -3, 'humor': 2, 'humorous': 2, 'humour': 2, 'humourous': 2, 'hunger': -2, 'hurrah': 5, 'hurt': -2, 'hurting': -2, 'hurts': -2, 'hypocritical': -2, 'hysteria': -3, 'hysterical': -3, 'hysterics': -3, 'idiot': -3, 'idiotic': -3, 'ignorance': -2, 'ignorant': -2, 'ignore': -1, 'ignored': -2, 'ignores': -1, 'ill': -2, 'illegal': -3, 'illiteracy': -2, 'illness': -2, 'illnesses': -2, 'imbecile': -3, 'immobilized': -1, 'immortal': 2, 'immune': 1, 'impatient': -2, 'imperfect': -2, 'importance': 2, 'important': 2, 'impose': -1, 'imposed': -1, 'imposes': -1, 'imposing': -1, 'impotent': -2, 'impress': 3, 'impressed': 3, 'impresses': 3, 'impressive': 3, 'imprisoned': -2, 'improve': 2, 'improved': 2, 'improvement': 2, 'improves': 2, 'improving': 2, 'inability': -2, 'inaction': -2, 'inadequate': -2, 'incapable': -2, 'incapacitated': -2, 'incensed': -2, 'incompetence': -2, 'incompetent': -2, 'inconsiderate': -2, 'inconvenience': -2, 'inconvenient': -2, 'increase': 1, 'increased': 1, 'indecisive': -2, 'indestructible': 2, 'indifference': -2, 'indifferent': -2, 'indignant': -2, 'indignation': -2, 'indoctrinate': -2, 'indoctrinated': -2, 'indoctrinates': -2, 'indoctrinating': -2, 'ineffective': -2, 'ineffectively': -2, 'infatuated': 2, 'infatuation': 2, 'infected': -2, 'inferior': -2, 'inflamed': -2, 'influential': 2, 'infringement': -2, 'infuriate': -2, 'infuriated': -2, 'infuriates': -2, 'infuriating': -2, 'inhibit': -1, 'injured': -2, 'injury': -2, 'injustice': -2, 'innovate': 1, 'innovates': 1, 'innovation': 1, 'innovative': 2, 'inquisition': -2, 'inquisitive': 2, 'insane': -2, 'insanity': -2, 'insecure': -2, 'insensitive': -2, 'insensitivity': -2, 'insignificant': -2, 'insipid': -2, 'inspiration': 2, 'inspirational': 2, 'inspire': 2, 'inspired': 2, 'inspires': 2, 'inspiring': 3, 'insult': -2, 'insulted': -2, 'insulting': -2, 'insults': -2, 'intact': 2, 'integrity': 2, 'intelligent': 2, 'intense': 1, 'interest': 1, 'interested': 2, 'interesting': 2, 'interests': 1, 'interrogated': -2, 'interrupt': -2, 'interrupted': -2, 'interrupting': -2, 'interruption': -2, 'interrupts': -2, 'intimidate': -2, 'intimidated': -2, 'intimidates': -2, 'intimidating': -2, 'intimidation': -2, 'intricate': 2, 'intrigues': 1, 'invincible': 2, 'invite': 1, 'inviting': 1, 'invulnerable': 2, 'irate': -3, 'ironic': -1, 'irony': -1, 'irrational': -1, 'irresistible': 2, 'irresolute': -2, 'irresponsible': 2, 'irreversible': -1, 'irritate': -3, 'irritated': -3, 'irritating': -3, 'isolated': -1, 'itchy': -2, 'jackass': -4, 'jackasses': -4, 'jailed': -2, 'jaunty': 2, 'jealous': -2, 'jeopardy': -2, 'jerk': -3, 'jesus': 1, 'jewel': 1, 'jewels': 1, 'jocular': 2, 'join': 1, 'joke': 2, 'jokes': 2, 'jolly': 2, 'jovial': 2, 'joy': 3, 'joyful': 3, 'joyfully': 3, 'joyless': -2, 'joyous': 3, 'jubilant': 3, 'jumpy': -1, 'justice': 2, 'justifiably': 2, 'justified': 2, 'keen': 1, 'kill': -3, 'killed': -3, 'killing': -3, 'kills': -3, 'kind': 2, 'kinder': 2, 'kiss': 2, 'kudos': 3, 'lack': -2, 'lackadaisical': -2, 'lag': -1, 'lagged': -2, 'lagging': -2, 'lags': -2, 'lame': -2, 'landmark': 2, 'laugh': 1, 'laughed': 1, 'laughing': 1, 'laughs': 1, 'laughting': 1, 'launched': 1, 'lawl': 3, 'lawsuit': -2, 'lawsuits': -2, 'lazy': -1, 'leak': -1, 'leaked': -1, 'leave': -1, 'legal': 1, 'legally': 1, 'lenient': 1, 'lethargic': -2, 'lethargy': -2, 'liar': -3, 'liars': -3, 'libelous': -2, 'lied': -2, 'lifesaver': 4, 'lighthearted': 1, 'like': 2, 'liked': 2, 'likes': 2, 'limitation': -1, 'limited': -1, 'limits': -1, 'litigation': -1, 'litigious': -2, 'lively': 2, 'livid': -2, 'lmao': 4, 'lmfao': 4, 'loathe': -3, 'loathed': -3, 'loathes': -3, 'loathing': -3, 'lobby': -2, 'lobbying': -2, 'lol': 3, 'lonely': -2, 'lonesome': -2, 'long': -3, 'longer': -3, 'longing': -1, 'loom': -1, 'loomed': -1, 'looming': -1, 'looms': -1, 'loose': -3, 'looses': -3, 'loser': -3, 'losing': -3, 'loss': -3, 'lost': -3, 'lovable': 3, 'love': 3, 'loved': 3, 'lovelies': 3, 'lovely': 3, 'loving': 2, 'lowest': -1, 'loyal': 3, 'loyalty': 3, 'luck': 3, 'luckily': 3, 'lucky': 3, 'lugubrious': -2, 'lunatic': -3, 'lunatics': -3, 'lurk': -1, 'lurking': -1, 'lurks': -1, 'mad': -3, 'maddening': -3, 'made-up': -1, 'madly': -3, 'madness': -3, 'mandatory': -1, 'manipulated': -1, 'manipulating': -1, 'manipulation': -1, 'marvel': 3, 'marvelous': 3, 'marvels': 3, 'masterpiece': 4, 'masterpieces': 4, 'matter': 1, 'matters': 1, 'mature': 2, 'meaningful': 2, 'meaningless': -2, 'medal': 3, 'mediocrity': -3, 'meditative': 1, 'melancholy': -2, 'menace': -2, 'menaced': -2, 'mercy': 2, 'merry': 3, 'mess': -2, 'messed': -2, 'messing up': -2, 'methodical': 2, 'mindless': -2, 'miracle': 4, 'mirth': 3, 'mirthful': 3, 'mirthfully': 3, 'misbehave': -2, 'misbehaved': -2, 'misbehaves': -2, 'misbehaving': -2, 'mischief': -1, 'mischiefs': -1, 'miserable': -3, 'misery': -2, 'misgiving': -2, 'misinformation': -2, 'misinformed': -2, 'misinterpreted': -2, 'misleading': -3, 'misread': -1, 'misreporting': -2, 'misrepresentation': -2, 'miss': -2, 'missed': -2, 'missing': -2, 'mistake': -2, 'mistaken': -2, 'mistakes': -2, 'mistaking': -2, 'misunderstand': -2, 'misunderstanding': -2, 'misunderstands': -2, 'misunderstood': -2, 'moan': -2, 'moaned': -2, 'moaning': -2, 'moans': -2, 'mock': -2, 'mocked': -2, 'mocking': -2, 'mocks': -2, 'mongering': -2, 'monopolize': -2, 'monopolized': -2, 'monopolizes': -2, 'monopolizing': -2, 'moody': -1, 'mope': -1, 'moping': -1, 'moron': -3, 'motherfucker': -5, 'motherfucking': -5, 'motivate': 1, 'motivated': 2, 'motivating': 2, 'motivation': 1, 'mourn': -2, 'mourned': -2, 'mournful': -2, 'mourning': -2, 'mourns': -2, 'mumpish': -2, 'murder': -2, 'murderer': -2, 'murdering': -3, 'murderous': -3, 'murders': -2, 'myth': -1, 'n00b': -2, 'naive': -2, 'nasty': -3, 'natural': 1, 'naïve': -2, 'need': -1, 'needy': -2, 'negative': -2, 'negativity': -2, 'neglect': -2, 'neglected': -2, 'neglecting': -2, 'neglects': -2, 'nerves': -1, 'nervous': -2, 'nervously': -2, 'nice': 3, 'nifty': 2, 'niggas': -5, 'nigger': -5, 'no': -1, 'no fun': -3, 'noble': 2, 'noisy': -1, 'nonsense': -2, 'noob': -2, 'nosey': -2, 'not good': -2, 'not working': -3, 'notorious': -2, 'novel': 2, 'now': -2, 'numb': -1, 'nuts': -3, 'obliterate': -2, 'obliterated': -2, 'obnoxious': -3, 'obscene': -2, 'obsessed': 2, 'obsolete': -2, 'obstacle': -2, 'obstacles': -2, 'obstinate': -2, 'odd': -2, 'offend': -2, 'offended': -2, 'offender': -2, 'offending': -2, 'offends': -2, 'offline': -1, 'oks': 2, 'ominous': 3, 'once-in-a-lifetime': 3, 'opportunities': 2, 'opportunity': 2, 'oppressed': -2, 'oppressive': -2, 'optimism': 2, 'optimistic': 2, 'optionless': -2, 'outcry': -2, 'outmaneuvered': -2, 'outrage': -3, 'outraged': -3, 'outreach': 2, 'outstanding': 5, 'overjoyed': 4, 'overload': -1, 'overlooked': -1, 'overreact': -2, 'overreacted': -2, 'overreaction': -2, 'overreacts': -2, 'oversell': -2, 'overselling': -2, 'oversells': -2, 'oversimplification': -2, 'oversimplified': -2, 'oversimplifies': -2, 'oversimplify': -2, 'overstatement': -2, 'overstatements': -2, 'overweight': -1, 'oxymoron': -1, 'pain': -2, 'pained': -2, 'panic': -3, 'panicked': -3, 'panics': -3, 'paradise': 3, 'paradox': -1, 'pardon': 2, 'pardoned': 2, 'pardoning': 2, 'pardons': 2, 'parley': -1, 'passionate': 2, 'passive': -1, 'passively': -1, 'pathetic': -2, 'pay': -1, 'peace': 2, 'peaceful': 2, 'peacefully': 2, 'penalty': -2, 'pensive': -1, 'perfect': 3, 'perfected': 2, 'perfectly': 3, 'perfects': 2, 'peril': -2, 'perjury': -3, 'perpetrator': -2, 'perpetrators': -2, 'perplexed': -2, 'persecute': -2, 'persecuted': -2, 'persecutes': -2, 'persecuting': -2, 'perturbed': -2, 'pesky': -2, 'pessimism': -2, 'pessimistic': -2, 'petrified': -2, 'phobic': -2, 'picturesque': 2, 'pileup': -1, 'pique': -2, 'piqued': -2, 'piss': -4, 'pissed': -4, 'pissing': -3, 'piteous': -2, 'pitied': -1, 'pity': -2, 'playful': 2, 'pleasant': 3, 'please': 1, 'pleased': 3, 'pleasure': 3, 'poised': -2, 'poison': -2, 'poisoned': -2, 'poisons': -2, 'pollute': -2, 'polluted': -2, 'polluter': -2, 'polluters': -2, 'pollutes': -2, 'poor': -2, 'poorer': -2, 'poorest': -2, 'popular': 3, 'positive': 2, 'positively': 2, 'possessive': -2, 'postpone': -1, 'postponed': -1, 'postpones': -1, 'postponing': -1, 'poverty': -1, 'powerful': 2, 'powerless': -2, 'praise': 3, 'praised': 3, 'praises': 3, 'praising': 3, 'pray': 1, 'praying': 1, 'prays': 1, 'prblm': -2, 'prblms': -2, 'prepared': 1, 'pressure': -1, 'pressured': -2, 'pretend': -1, 'pretending': -1, 'pretends': -1, 'pretty': 1, 'prevent': -1, 'prevented': -1, 'preventing': -1, 'prevents': -1, 'prick': -5, 'prison': -2, 'prisoner': -2, 'prisoners': -2, 'privileged': 2, 'proactive': 2, 'problem': -2, 'problems': -2, 'profiteer': -2, 'progress': 2, 'prominent': 2, 'promise': 1, 'promised': 1, 'promises': 1, 'promote': 1, 'promoted': 1, 'promotes': 1, 'promoting': 1, 'propaganda': -2, 'prosecute': -1, 'prosecuted': -2, 'prosecutes': -1, 'prosecution': -1, 'prospect': 1, 'prospects': 1, 'prosperous': 3, 'protect': 1, 'protected': 1, 'protects': 1, 'protest': -2, 'protesters': -2, 'protesting': -2, 'protests': -2, 'proud': 2, 'proudly': 2, 'provoke': -1, 'provoked': -1, 'provokes': -1, 'provoking': -1, 'pseudoscience': -3, 'punish': -2, 'punished': -2, 'punishes': -2, 'punitive': -2, 'pushy': -1, 'puzzled': -2, 'quaking': -2, 'questionable': -2, 'questioned': -1, 'questioning': -1, 'racism': -3, 'racist': -3, 'racists': -3, 'rage': -2, 'rageful': -2, 'rainy': -1, 'rant': -3, 'ranter': -3, 'ranters': -3, 'rants': -3, 'rape': -4, 'rapist': -4, 'rapture': 2, 'raptured': 2, 'raptures': 2, 'rapturous': 4, 'rash': -2, 'ratified': 2, 'reach': 1, 'reached': 1, 'reaches': 1, 'reaching': 1, 'reassure': 1, 'reassured': 1, 'reassures': 1, 'reassuring': 2, 'rebellion': -2, 'recession': -2, 'reckless': -2, 'recommend': 2, 'recommended': 2, 'recommends': 2, 'redeemed': 2, 'refuse': -2, 'refused': -2, 'refusing': -2, 'regret': -2, 'regretful': -2, 'regrets': -2, 'regretted': -2, 'regretting': -2, 'reject': -1, 'rejected': -1, 'rejecting': -1, 'rejects': -1, 'rejoice': 4, 'rejoiced': 4, 'rejoices': 4, 'rejoicing': 4, 'relaxed': 2, 'relentless': -1, 'reliant': 2, 'relieve': 1, 'relieved': 2, 'relieves': 1, 'relieving': 2, 'relishing': 2, 'remarkable': 2, 'remorse': -2, 'repulse': -1, 'repulsed': -2, 'rescue': 2, 'rescued': 2, 'rescues': 2, 'resentful': -2, 'resign': -1, 'resigned': -1, 'resigning': -1, 'resigns': -1, 'resolute': 2, 'resolve': 2, 'resolved': 2, 'resolves': 2, 'resolving': 2, 'respected': 2, 'responsible': 2, 'responsive': 2, 'restful': 2, 'restless': -2, 'restore': 1, 'restored': 1, 'restores': 1, 'restoring': 1, 'restrict': -2, 'restricted': -2, 'restricting': -2, 'restriction': -2, 'restricts': -2, 'retained': -1, 'retard': -2, 'retarded': -2, 'retreat': -1, 'revenge': -2, 'revengeful': -2, 'revered': 2, 'revive': 2, 'revives': 2, 'reward': 2, 'rewarded': 2, 'rewarding': 2, 'rewards': 2, 'rich': 2, 'ridiculous': -3, 'rig': -1, 'rigged': -1, 'right direction': 3, 'rigorous': 3, 'rigorously': 3, 'riot': -2, 'riots': -2, 'risk': -2, 'risks': -2, 'rob': -2, 'robber': -2, 'robed': -2, 'robing': -2, 'robs': -2, 'robust': 2, 'rofl': 4, 'roflcopter': 4, 'roflmao': 4, 'romance': 2, 'rotfl': 4, 'rotflmfao': 4, 'rotflol': 4, 'ruin': -2, 'ruined': -2, 'ruining': -2, 'ruins': -2, 'sabotage': -2, 'sad': -2, 'sadden': -2, 'saddened': -2, 'sadly': -2, 'safe': 1, 'safely': 1, 'safety': 1, 'salient': 1, 'sappy': -1, 'sarcastic': -2, 'satisfied': 2, 'save': 2, 'saved': 2, 'scam': -2, 'scams': -2, 'scandal': -3, 'scandalous': -3, 'scandals': -3, 'scapegoat': -2, 'scapegoats': -2, 'scare': -2, 'scared': -2, 'scary': -2, 'sceptical': -2, 'scold': -2, 'scoop': 3, 'scorn': -2, 'scornful': -2, 'scream': -2, 'screamed': -2, 'screaming': -2, 'screams': -2, 'screwed': -2, 'screwed up': -3, 'scumbag': -4, 'secure': 2, 'secured': 2, 'secures': 2, 'sedition': -2, 'seditious': -2, 'seduced': -1, 'self-confident': 2, 'self-deluded': -2, 'selfish': -3, 'selfishness': -3, 'sentence': -2, 'sentenced': -2, 'sentences': -2, 'sentencing': -2, 'serene': 2, 'severe': -2, 'sexy': 3, 'shaky': -2, 'shame': -2, 'shamed': -2, 'shameful': -2, 'share': 1, 'shared': 1, 'shares': 1, 'shattered': -2, 'shit': -7, 'shithead': -4, 'shitty': -3, 'shock': -2, 'shocked': -2, 'shocking': -2, 'shocks': -2, 'shoot': -1, 'short-sighted': -2, 'short-sightedness': -2, 'shortage': -2, 'shortages': -2, 'shrew': -4, 'shy': -1, 'sick': -2, 'sigh': -2, 'significance': 1, 'significant': 1, 'silencing': -1, 'silly': -1, 'sincere': 2, 'sincerely': 2, 'sincerest': 2, 'sincerity': 2, 'sinful': -3, 'singleminded': -2, 'skeptic': -2, 'skeptical': -2, 'skepticism': -2, 'skeptics': -2, 'slam': -2, 'slash': -2, 'slashed': -2, 'slashes': -2, 'slashing': -2, 'slavery': -3, 'sleeplessness': -2, 'slick': 2, 'slicker': 2, 'slickest': 2, 'sluggish': -2, 'slut': -5, 'smart': 1, 'smarter': 2, 'smartest': 2, 'smear': -2, 'smile': 2, 'smiled': 2, 'smiles': 2, 'smiling': 2, 'smog': -2, 'sneaky': -1, 'snub': -2, 'snubbed': -2, 'snubbing': -2, 'snubs': -2, 'sobering': 1, 'solemn': -1, 'solid': 2, 'solidarity': 2, 'solution': 1, 'solutions': 1, 'solve': 1, 'solved': 1, 'solves': 1, 'solving': 1, 'somber': -2, 'some kind': 0, 'son-of-a-bitch': -5, 'soothe': 3, 'soothed': 3, 'soothing': 3, 'sophisticated': 2, 'sore': -1, 'sorrow': -2, 'sorrowful': -2, 'sorry': -1, 'spam': -2, 'spammer': -3, 'spammers': -3, 'spamming': -2, 'spark': 1, 'sparkle': 3, 'sparkles': 3, 'sparkling': 3, 'speculative': -2, 'spirit': 1, 'spirited': 2, 'spiritless': -2, 'spiteful': -2, 'splendid': 3, 'sprightly': 2, 'squelched': -1, 'stab': -2, 'stabbed': -2, 'stable': 2, 'stabs': -2, 'stall': -2, 'stalled': -2, 'stalling': -2, 'stamina': 2, 'stampede': -2, 'startled': -2, 'starve': -2, 'starved': -2, 'starves': -2, 'starving': -2, 'steadfast': 2, 'steal': -2, 'steals': -2, 'stereotype': -2, 'stereotyped': -2, 'stifled': -1, 'stimulate': 1, 'stimulated': 1, 'stimulates': 1, 'stimulating': 2, 'stingy': -2, 'stolen': -2, 'stop': -1, 'stopped': -1, 'stopping': -1, 'stops': -1, 'stout': 2, 'straight': 1, 'strange': -1, 'strangely': -1, 'strangled': -2, 'strength': 2, 'strengthen': 2, 'strengthened': 2, 'strengthening': 2, 'strengthens': 2, 'stressed': -2, 'stressor': -2, 'stressors': -2, 'stricken': -2, 'strike': -1, 'strikers': -2, 'strikes': -1, 'strong': 2, 'stronger': 2, 'strongest': 2, 'struck': -1, 'struggle': -2, 'struggled': -2, 'struggles': -2, 'struggling': -2, 'stubborn': -2, 'stuck': -2, 'stunned': -2, 'stunning': 4, 'stupid': -2, 'stupidly': -2, 'suave': 2, 'substantial': 1, 'substantially': 1, 'subversive': -2, 'success': 2, 'successful': 3, 'suck': -3, 'sucks': -3, 'suffer': -2, 'suffering': -2, 'suffers': -2, 'suicidal': -2, 'suicide': -2, 'suing': -2, 'sulking': -2, 'sulky': -2, 'sullen': -2, 'sunshine': 2, 'super': 3, 'superb': 5, 'superior': 2, 'support': 2, 'supported': 2, 'supporter': 1, 'supporters': 1, 'supporting': 1, 'supportive': 2, 'supports': 2, 'survived': 2, 'surviving': 2, 'survivor': 2, 'suspect': -1, 'suspected': -1, 'suspecting': -1, 'suspects': -1, 'suspend': -1, 'suspended': -1, 'suspicious': -2, 'swear': -2, 'swearing': -2, 'swears': -2, 'sweet': 2, 'swift': 2, 'swiftly': 2, 'swindle': -3, 'swindles': -3, 'swindling': -3, 'sympathetic': 2, 'sympathy': 2, 'tard': -2, 'tears': -2, 'tender': 2, 'tense': -2, 'tension': -1, 'terrible': -3, 'terribly': -3, 'terrific': 4, 'terrified': -3, 'terror': -3, 'terrorize': -3, 'terrorized': -3, 'terrorizes': -3, 'thank': 2, 'thankful': 2, 'thanks': 2, 'thorny': -2, 'thoughtful': 2, 'thoughtless': -2, 'threat': -2, 'threaten': -2, 'threatened': -2, 'threatening': -2, 'threatens': -2, 'threats': -2, 'thrilled': 5, 'thwart': -2, 'thwarted': -2, 'thwarting': -2, 'thwarts': -2, 'timid': -2, 'timorous': -2, 'tired': -2, 'tits': -2, 'tolerant': 2, 'toothless': -2, 'top': 2, 'tops': 2, 'torn': -2, 'torture': -4, 'tortured': -4, 'tortures': -4, 'torturing': -4, 'totalitarian': -2, 'totalitarianism': -2, 'tout': -2, 'touted': -2, 'touting': -2, 'touts': -2, 'tragedy': -2, 'tragic': -2, 'tranquil': 2, 'trap': -1, 'trapped': -2, 'trauma': -3, 'traumatic': -3, 'travesty': -2, 'treason': -3, 'treasonous': -3, 'treasure': 2, 'treasures': 2, 'trembling': -2, 'tremulous': -2, 'tricked': -2, 'trickery': -2, 'triumph': 4, 'triumphant': 4, 'trouble': -2, 'troubled': -2, 'troubles': -2, 'true': 2, 'trust': 1, 'trusted': 2, 'tumor': -2, 'twat': -5, 'ugly': -3, 'unacceptable': -2, 'unappreciated': -2, 'unapproved': -2, 'unaware': -2, 'unbelievable': -1, 'unbelieving': -1, 'unbiased': 2, 'uncertain': -1, 'unclear': -1, 'uncomfortable': -2, 'unconcerned': -2, 'unconfirmed': -1, 'unconvinced': -1, 'uncredited': -1, 'undecided': -1, 'underestimate': -1, 'underestimated': -1, 'underestimates': -1, 'underestimating': -1, 'undermine': -2, 'undermined': -2, 'undermines': -2, 'undermining': -2, 'undeserving': -2, 'undesirable': -2, 'uneasy': -2, 'unemployment': -2, 'unequal': -1, 'unequaled': 2, 'unethical': -2, 'unfair': -2, 'unfocused': -2, 'unfulfilled': -2, 'unhappy': -2, 'unhealthy': -2, 'unified': 1, 'unimpressed': -2, 'unintelligent': -2, 'united': 1, 'unjust': -2, 'unlovable': -2, 'unloved': -2, 'unmatched': 1, 'unmotivated': -2, 'unprofessional': -2, 'unresearched': -2, 'unsatisfied': -2, 'unsecured': -2, 'unsettled': -1, 'unsophisticated': -2, 'unstable': -2, 'unstoppable': 2, 'unsupported': -2, 'unsure': -1, 'untarnished': 2, 'unwanted': -2, 'unworthy': -2, 'upset': -2, 'upsets': -2, 'upsetting': -2, 'uptight': -2, 'urgent': -1, 'useful': 2, 'usefulness': 2, 'useless': -2, 'uselessness': -2, 'vague': -2, 'validate': 1, 'validated': 1, 'validates': 1, 'validating': 1, 'verdict': -1, 'verdicts': -1, 'vested': 1, 'vexation': -2, 'vexing': -2, 'vibrant': 3, 'vicious': -2, 'victim': -3, 'victimize': -3, 'victimized': -3, 'victimizes': -3, 'victimizing': -3, 'victims': -3, 'vigilant': 3, 'vile': -3, 'vindicate': 2, 'vindicated': 2, 'vindicates': 2, 'vindicating': 2, 'violate': -2, 'violated': -2, 'violates': -2, 'violating': -2, 'violence': -3, 'violent': -3, 'virtuous': 2, 'virulent': -2, 'vision': 1, 'visionary': 3, 'visioning': 1, 'visions': 1, 'vitality': 3, 'vitamin': 1, 'vitriolic': -3, 'vivacious': 3, 'vociferous': -1, 'vulnerability': -2, 'vulnerable': -2, 'wait': -2, 'walkout': -2, 'walkouts': -2, 'wanker': -3, 'want': 1, 'war': -2, 'warfare': -2, 'warm': 1, 'warmth': 2, 'warn': -2, 'warned': -2, 'warning': -3, 'warnings': -3, 'warns': -2, 'waste': -1, 'wasted': -2, 'wasting': -2, 'wavering': -1, 'weak': -2, 'weakness': -2, 'wealth': 3, 'wealthy': 2, 'weary': -2, 'weep': -2, 'weeping': -2, 'weird': -2, 'welcome': 2, 'welcomed': 2, 'welcomes': 2, 'whimsical': 1, 'whitewash': -3, 'whore': -4, 'wicked': -2, 'widowed': -1, 'willingness': 2, 'win': 4, 'winner': 4, 'winning': 4, 'wins': 4, 'winwin': 3, 'wish': 1, 'wishes': 1, 'wishing': 1, 'withdrawal': -3, 'woebegone': -2, 'woeful': -3, 'won': 3, 'wonderful': 4, 'woo': 3, 'woohoo': 3, 'wooo': 4, 'woow': 4, 'worn': -1, 'worried': -3, 'worry': -3, 'worrying': -3, 'worse': -3, 'worsen': -3, 'worsened': -3, 'worsening': -3, 'worsens': -3, 'worshiped': 3, 'worst': -3, 'worth': 2, 'worthless': -2, 'worthy': 2, 'wow': 4, 'wowow': 4, 'wowww': 4, 'wrathful': -3, 'wreck': -2, 'wrong': -2, 'wronged': -2, 'wtf': -4, 'yeah': 1, 'yearning': 1, 'yeees': 2, 'yes': 1, 'youthful': 2, 'yucky': -2, 'yummy': 3, 'zealot': -2, 'zealots': -2, 'zealous': 2, ':S': -3, ':)': 2, ':(': -2, 'terrorizing': -3 };
exports.SENTIMENT_SCORES = SENTIMENT_SCORES;
var PREFIX_MODIFIERS = { 'really': 2, 'fucking': 3, 'fricking': 2, 'damn': 2, 'bloody': 2, 'not': -1, 'can\'t': -1, 'such': 2, 'too': 2, 'so': 1 };
exports.PREFIX_MODIFIERS = PREFIX_MODIFIERS;
var POSTFIX_MODIFIERS = { '!': 2 };
exports.POSTFIX_MODIFIERS = POSTFIX_MODIFIERS;

},{}],5:[function(require,module,exports){
//test

'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _addHookToGmailJs = require('./addHookToGmail.js');

var gmailListener = _interopRequireWildcard(_addHookToGmailJs);

var _analyseSentimentJs = require('./analyseSentiment.js');

var sentimentAnalyser = _interopRequireWildcard(_analyseSentimentJs);

var _analyseDISCProfileJs = require('./analyseDISCProfile.js');

var analyseDISC = _interopRequireWildcard(_analyseDISCProfileJs);

var _utilsEmailParseUtilJs = require('./utils/emailParseUtil.js');

var emailParser = _interopRequireWildcard(_utilsEmailParseUtilJs);

var _utilsResultsLightboxJs = require('./utils/resultsLightbox.js');

var lightBoxUtil = _interopRequireWildcard(_utilsResultsLightboxJs);

var _utilsCalculateReadingLevelJs = require('./utils/calculateReadingLevel.js');

var readabilityAnalyser = _interopRequireWildcard(_utilsCalculateReadingLevelJs);

(function () {

    'use strict';
    startSleepOnIt();
    console.log('***starting app with disc profile analysis');

    function startSleepOnIt() {
        gmailListener.startApp();
        gmailListener.setSendButtonClickHandler(sleepOnItHandler);
    }

    function sleepOnItHandler(event) {
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
        } else if (sentiment.score > 15) {
            handleHappyEmail(results, sentiment.positive.length, event);
        } else {
            showResultsInLightbox(results);
            sendEmailAnyway();
        }
    }

    function handleHappyEmail(results, numberOfIssues, event) {
        results = 'Wow! Someone\'s in a good mood:)<br>It looks like you\'re about to do something you won\'t regret at all.<br>Sleep On It has detected ' + getCorrectPlural(numberOfIssues, 'happy word') + ' in your ' + 'email:<br>' + results;

        showResultsInLightbox(results);

        sendEmailAnyway();
        event.preventDefault();
        return false;
    }

    function handleBlandEmail(failMessage, score, event) {
        failMessage = 'Hmm this email is pretty bland and emotionless. The sentiment score is only ' + score + '.\nIf you don\'t want the recipient to think you\'re a robot, try injecting some pizazz into your email ;)\nNot fussed? Click Ok to send the email anyway. Click cancel to cancel sending.';

        if (!window.confirm(failMessage)) {
            event.preventDefault();
            return false;
        } else {
            sendEmailAnyway();
        }
    }

    function handleAngryEmail(failMessage, numberOfIssues, event) {
        failMessage = 'INTERVENTION!\nIt looks like you\'re about to do something you might regret.\nSleep On It has detected ' + getCorrectPlural(numberOfIssues, 'issue') + ' with your ' + 'email:\n' + failMessage.replace(/<br>/g, '\n') + 'Click Ok to send the email anyway. Click cancel to cancel sending.';

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

    function sendEmailAnyway() {
        gmailListener.triggerEmailSend();
        console.log('***Sending email anyway');
    }

    function getCorrectPlural(number, word) {
        if (number === 1) {
            return '1 ' + word;
        }
        return number + ' ' + word + 's';
    }
})();

},{"./addHookToGmail.js":1,"./analyseDISCProfile.js":2,"./analyseSentiment.js":3,"./utils/calculateReadingLevel.js":6,"./utils/emailParseUtil.js":8,"./utils/resultsLightbox.js":10}],6:[function(require,module,exports){
//adapted from https://www.npmjs.com/package/automated-readability-index

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.calculateReadabilityScore = calculateReadabilityScore;
exports.getQualitativeVocabularyLevel = getQualitativeVocabularyLevel;

function calculateReadabilityScore(text) {
  if (text.length) {
    return analyseText(text);
  }

  return 0;
}

function getQualitativeVocabularyLevel(text) {
  var readingLevel = calculateReadabilityScore(text);
  var ADVANCED_THRESHOLD = 8,
      SUPER_ADVANCED_THRESHOLD = 12;

  if (readingLevel < ADVANCED_THRESHOLD) {
    return 'basic';
  } else if (readingLevel >= ADVANCED_THRESHOLD && readingLevel < SUPER_ADVANCED_THRESHOLD) {
    return 'advanced';
  } else if (readingLevel >= SUPER_ADVANCED_THRESHOLD) {
    return 'very advanced';
  }
}

var NON_WORD_CHARACTERS = /['";:,.?¿\-\—!¡]+/g;

function analyseText(text) {
  var strippedText = text.replace(NON_WORD_CHARACTERS, ''),
      words = strippedText.match(/\S+/g),
      numWords = 0,
      numCharacters,
      readabilityScore;

  if (words) {
    numWords = words.length;
  };

  numCharacters = strippedText.replace(/\s/g, '').length;
  readabilityScore = getAutomatedReadabilityIndex(numWords, numCharacters);

  console.log('chars', numCharacters, 'words', numWords, 'score', readabilityScore, 'strippedText', strippedText);

  return readabilityScore;
}

var getAutomatedReadabilityIndex = function getAutomatedReadabilityIndex(numWords, numCharacters) {
  return (numCharacters / numWords).toFixed(1);
};

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var analyseEgoism = function analyseEgoism(text) {
  if (text.length) {
    return analyseText(text);
  }

  return {
    selfish: 0,
    controlling: 0,
    conforming: 0
  };
};

exports.analyseEgoism = analyseEgoism;
var NON_WORD_CHARACTERS = /[";:,.?¿\-\—!¡]+/g,
    SELFISH_WORDS = /( i | my | mine | i'm | i'll )/g,
    IMPERATIVE_WORDS = /( you | your | yours | you're | you'll )/g,
    SELFLESS_WORDS = /( we | our | ours | let's | we're | we'll | you all | y'all | all of you | team )/g;

function analyseText(text) {
  var textWithLeadingAndTrailingSpace = ' ' + text + ' ',
      words = textWithLeadingAndTrailingSpace.toLowerCase().replace(NON_WORD_CHARACTERS, ''),
      selfishWords = words.match(SELFISH_WORDS),
      controllingWords = words.match(IMPERATIVE_WORDS),
      conformingWords = words.match(SELFLESS_WORDS);

  return {
    selfish: selfishWords ? selfishWords.length : 0,
    controlling: controllingWords ? controllingWords.length : 0,
    conforming: conformingWords ? conformingWords.length : 0
  };
}

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = (function () {

    'use strict';

    /**
    * Emails often come with copies of old emails from earlier in the thread
    * We don't want to process the old emails when we're analysing as we'll have a false positive otherwise
    **/
    function removeQuotedTextFromEmail(emailContents) {
        var selectorForQuotedReplies = '<div class="gmail_quote">',
            endOfNewContent = emailContents.indexOf(selectorForQuotedReplies);

        if (endOfNewContent > -1) {
            return emailContents.substring(0, endOfNewContent);
        }

        return emailContents;
    }

    return {
        removeQuotedTextFromEmail: removeQuotedTextFromEmail
    };
})();

module.exports = exports['default'];

},{}],9:[function(require,module,exports){
//modified from https://www.npmjs.com/package/emoji-regex/
//added text emojis: :) and wrapped in capture group

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var EMOJI_REGEX = /((?:0\u20E3|1\u20E3|2\u20E3|3\u20E3|4\u20E3|5\u20E3|6\u20E3|7\u20E3|8\u20E3|9\u20E3|#\u20E3|\*\u20E3|\uD83C(?:\uDDE6\uD83C(?:\uDDE8|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDEE|\uDDF1|\uDDF2|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFC|\uDDFD|\uDDFF)|\uDDE7\uD83C(?:\uDDE6|\uDDE7|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDEF|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFB|\uDDFC|\uDDFE|\uDDFF)|\uDDE8\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF5|\uDDF7|\uDDFA|\uDDFB|\uDDFC|\uDDFD|\uDDFE|\uDDFF)|\uDDE9\uD83C(?:\uDDEA|\uDDEC|\uDDEF|\uDDF0|\uDDF2|\uDDF4|\uDDFF)|\uDDEA\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEC|\uDDED|\uDDF7|\uDDF8|\uDDF9|\uDDFA)|\uDDEB\uD83C(?:\uDDEE|\uDDEF|\uDDF0|\uDDF2|\uDDF4|\uDDF7)|\uDDEC\uD83C(?:\uDDE6|\uDDE7|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDF1|\uDDF2|\uDDF3|\uDDF5|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFC|\uDDFE)|\uDDED\uD83C(?:\uDDF0|\uDDF2|\uDDF3|\uDDF7|\uDDF9|\uDDFA)|\uDDEE\uD83C(?:\uDDE8|\uDDE9|\uDDEA|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9)|\uDDEF\uD83C(?:\uDDEA|\uDDF2|\uDDF4|\uDDF5)|\uDDF0\uD83C(?:\uDDEA|\uDDEC|\uDDED|\uDDEE|\uDDF2|\uDDF3|\uDDF5|\uDDF7|\uDDFC|\uDDFE|\uDDFF)|\uDDF1\uD83C(?:\uDDE6|\uDDE7|\uDDE8|\uDDEE|\uDDF0|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFB|\uDDFE)|\uDDF2\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF5|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFB|\uDDFC|\uDDFD|\uDDFE|\uDDFF)|\uDDF3\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEB|\uDDEC|\uDDEE|\uDDF1|\uDDF4|\uDDF5|\uDDF7|\uDDFA|\uDDFF)|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C(?:\uDDE6|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF7|\uDDF8|\uDDF9|\uDDFC|\uDDFE)|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C(?:\uDDEA|\uDDF4|\uDDF8|\uDDFA|\uDDFC)|\uDDF8\uD83C(?:\uDDE6|\uDDE7|\uDDE8|\uDDE9|\uDDEA|\uDDEC|\uDDED|\uDDEE|\uDDEF|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF7|\uDDF8|\uDDF9|\uDDFB|\uDDFD|\uDDFE|\uDDFF)|\uDDF9\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEB|\uDDEC|\uDDED|\uDDEF|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF7|\uDDF9|\uDDFB|\uDDFC|\uDDFF)|\uDDFA\uD83C(?:\uDDE6|\uDDEC|\uDDF2|\uDDF8|\uDDFE|\uDDFF)|\uDDFB\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEC|\uDDEE|\uDDF3|\uDDFA)|\uDDFC\uD83C(?:\uDDEB|\uDDF8)|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C(?:\uDDEA|\uDDF9)|\uDDFF\uD83C(?:\uDDE6|\uDDF2|\uDDFC)))|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2694\u2696\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD79\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED0\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3]|\uD83E[\uDD10-\uDD18\uDD80-\uDD84\uDDC0]|:\)|:\()/g;
exports.EMOJI_REGEX = EMOJI_REGEX;

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = (function () {

    function displayContentInLightbox(insertContent) {

        // add lightbox/shadow <div/>'s if not previously added
        var lightBoxDiv = document.querySelector('#lightbox');
        if (!lightBoxDiv) {
            lightBoxDiv = document.createElement('div');
            lightBoxDiv.id = 'lightbox';

            document.body.appendChild(lightBoxDiv);
        }

        // insert HTML content
        if (insertContent != null) {
            lightBoxDiv.innerHTML = insertContent + '<br><br>(Hiding in 6 seconds)';
        }

        // move the lightbox to the current window top + 100px
        lightBoxDiv.style.top = document.body.scrollTop + 100 + 'px';
        lightBoxDiv.style.display = 'block';

        console.log('showing lightbox with ' + insertContent);

        window.setTimeout(function hideLightbox() {
            lightBoxDiv.style.display = 'none';
        }, 6000);
    }

    function addLightBoxCSS() {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = '#lightbox { margin: 70px auto; padding: 20px; background: #D3D1EC; border-radius: 5px; width: 200px; position: absolute; transition: all 5s ease-in-out; font-family: Tahoma, Arial, sans-serif; }';
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    return {
        displayContentInLightbox: displayContentInLightbox,
        addLightBoxCSS: addLightBoxCSS
    };
})();

module.exports = exports['default'];

},{}],11:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamVyZW15bmFnZWwvRG9jdW1lbnRzL2Rldi9wZXJzb25hbC9zbGVlcG9uaXQvU2xlZXBPbkl0L2pzL2FkZEhvb2tUb0dtYWlsLmpzIiwiL1VzZXJzL2plcmVteW5hZ2VsL0RvY3VtZW50cy9kZXYvcGVyc29uYWwvc2xlZXBvbml0L1NsZWVwT25JdC9qcy9hbmFseXNlRElTQ1Byb2ZpbGUuanMiLCIvVXNlcnMvamVyZW15bmFnZWwvRG9jdW1lbnRzL2Rldi9wZXJzb25hbC9zbGVlcG9uaXQvU2xlZXBPbkl0L2pzL2FuYWx5c2VTZW50aW1lbnQuanMiLCIvVXNlcnMvamVyZW15bmFnZWwvRG9jdW1lbnRzL2Rldi9wZXJzb25hbC9zbGVlcG9uaXQvU2xlZXBPbkl0L2pzL3NlbnRpbWVudFdvcmRMaXN0LmpzIiwiL1VzZXJzL2plcmVteW5hZ2VsL0RvY3VtZW50cy9kZXYvcGVyc29uYWwvc2xlZXBvbml0L1NsZWVwT25JdC9qcy9zbGVlcE9uSXQuanMiLCIvVXNlcnMvamVyZW15bmFnZWwvRG9jdW1lbnRzL2Rldi9wZXJzb25hbC9zbGVlcG9uaXQvU2xlZXBPbkl0L2pzL3V0aWxzL2NhbGN1bGF0ZVJlYWRpbmdMZXZlbC5qcyIsIi9Vc2Vycy9qZXJlbXluYWdlbC9Eb2N1bWVudHMvZGV2L3BlcnNvbmFsL3NsZWVwb25pdC9TbGVlcE9uSXQvanMvdXRpbHMvZWdvaXNtQW5hbHlzZXIuanMiLCIvVXNlcnMvamVyZW15bmFnZWwvRG9jdW1lbnRzL2Rldi9wZXJzb25hbC9zbGVlcG9uaXQvU2xlZXBPbkl0L2pzL3V0aWxzL2VtYWlsUGFyc2VVdGlsLmpzIiwiL1VzZXJzL2plcmVteW5hZ2VsL0RvY3VtZW50cy9kZXYvcGVyc29uYWwvc2xlZXBvbml0L1NsZWVwT25JdC9qcy91dGlscy9yZWdleExpc3QuanMiLCIvVXNlcnMvamVyZW15bmFnZWwvRG9jdW1lbnRzL2Rldi9wZXJzb25hbC9zbGVlcG9uaXQvU2xlZXBPbkl0L2pzL3V0aWxzL3Jlc3VsdHNMaWdodGJveC5qcyIsIm5vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztzQ0NBOEIsNEJBQTRCOztJQUE5QyxZQUFZOztxQkFFVCxDQUFDLFlBQVk7O0FBRXhCLGdCQUFZLENBQUM7O0FBRWIsUUFBSSxXQUFXO1FBQUUsVUFBVTtRQUN2Qiw0QkFBNEIsR0FBRyxFQUFFO1FBQ2pDLHVCQUF1QixDQUFDOztBQUU1QixhQUFTLFFBQVEsR0FBRztBQUNoQixlQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDdkMsY0FBTSxDQUFDLGdCQUFnQixDQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDdEQ7O0FBRUQsYUFBUyxTQUFTLEdBQUc7QUFDakIsWUFBSSxPQUFPLDRCQUE0QixLQUFLLFFBQVEsRUFBRTtBQUNsRCx3QkFBWSxDQUFFLDRCQUE0QixDQUFDLENBQUM7QUFDNUMsd0NBQTRCLEdBQUksRUFBRSxDQUFDO1NBQ3RDOztBQUVELGdCQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQy9FOztBQUVELGFBQVMsZ0JBQWdCLEdBQUc7QUFDeEIsWUFBSSxPQUFPLDRCQUE0QixLQUFLLFFBQVEsRUFBRTtBQUNsRCx3QkFBWSxDQUFFLDRCQUE0QixDQUFDLENBQUM7QUFDNUMsd0NBQTRCLEdBQUcsRUFBRSxDQUFDO1NBQ3JDOztBQUVELG9DQUE0QixHQUFHLFVBQVUsQ0FBRSxZQUFXO0FBQ2xELDRCQUFnQixFQUFHLENBQUM7U0FDdkIsRUFBRSxHQUFHLENBQUMsQ0FBQztLQUNYOztBQUVELGFBQVMsZ0JBQWdCLEdBQUc7QUFDeEIsMkJBQW1CLENBQUUsaUJBQWlCLEVBQUUsZ0JBQWdC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QUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLGVBQWUsRUFBQyxDQUFDLENBQUMsRUFBQyxnQkFBZ0IsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxFQUFDLGdCQUFnQixFQUFDLENBQUMsRUFBQyxpQkFBaUIsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLGdCQUFnQixFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQyxFQUFDLGlCQUFpQixFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQyxFQUFDLGdCQUFnQixFQUFDLENBQUMsQ0FBQyxFQUFDLGlCQUFpQixFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxnQkFBZ0IsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLGVBQWUsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFFLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLGVBQWUsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLGVBQWUsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLGVBQWUsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGdCQUFnQixFQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLGVBQWUsRUFBQyxDQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLGVBQWUsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLGVBQWUsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGVBQWUsRUFBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxnQkFBZ0IsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsbUJBQW1CLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLGVBQWUsRUFBQyxDQUFDLENBQUMsRUFBQyxrQkFBa0IsRUFBQyxDQUFDLENBQUMsRUFBQyxnQkFBZ0IsRUFBQyxDQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsb0JBQW9CLEVBQUMsQ0FBQyxFQUFDLGVBQWUsRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLGVBQWUsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLG9CQUFvQixFQUFDLENBQUMsQ0FBQyxFQUFDLGdCQUFnQixFQUFDLENBQUMsQ0FBQyxFQUFDLGdCQUFnQixFQUFDLENBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsaUJBQWlCLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZ0JBQWdCLEVBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDLEVBQUMsbUJBQW1CLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLGNBQWMsRUFBQyxDQUFDLENBQUMsRUFBQyxpQkFBaUIsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQyxFQUFDLGdCQUFnQixFQUFDLENBQUMsQ0FBQyxFQUFDLGdCQUFnQixFQUFDLENBQUMsQ0FBQyxFQUFDLGlCQUFpQixFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFDLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLGlCQUFpQixFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxD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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAqIGFzIGxpZ2h0Qm94VXRpbCBmcm9tICcuL3V0aWxzL3Jlc3VsdHNMaWdodGJveC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgc2VuZEJ1dHRvbnMsIHdyYXBwZXJEaXYsXG4gICAgICAgIHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIgPSAnJyxcbiAgICAgICAgX3NlbmRCdXR0b25DbGlja0hhbmRsZXI7XG5cbiAgICBmdW5jdGlvbiBzdGFydEFwcCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJyoqKlNsZWVwIE9uIEl0IFN0YXJ0aW5nJyk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICgnbG9hZCcsIGxvY2FsTWFpbiwgZmFsc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvY2FsTWFpbigpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB6R2JsX1BhZ2VDaGFuZ2VkQnlBSkFYX1RpbWVyID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0ICh6R2JsX1BhZ2VDaGFuZ2VkQnlBSkFYX1RpbWVyKTtcbiAgICAgICAgICAgIHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIgID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIgKCdET01Ob2RlSW5zZXJ0ZWQnLCBwYWdlQml0SGFzTG9hZGVkLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFnZUJpdEhhc0xvYWRlZCgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB6R2JsX1BhZ2VDaGFuZ2VkQnlBSkFYX1RpbWVyID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0ICh6R2JsX1BhZ2VDaGFuZ2VkQnlBSkFYX1RpbWVyKTtcbiAgICAgICAgICAgIHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIgPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIgPSBzZXRUaW1lb3V0IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGhhbmRsZVBhZ2VDaGFuZ2UgKCk7IFxuICAgICAgICB9LCA2NjYpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZVBhZ2VDaGFuZ2UoKSB7XG4gICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIgKCdET01Ob2RlSW5zZXJ0ZWQnLCBwYWdlQml0SGFzTG9hZGVkLCBmYWxzZSk7XG4gICAgICAgIHZhciBoYXNTZW5kQnV0dG9uT25QYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2W2FyaWEtbGFiZWwqPVNlbmRdJykgIT09IG51bGw7XG4gICAgICAgIGlmIChoYXNTZW5kQnV0dG9uT25QYWdlKSB7XG4gICAgICAgICAgICBzZXRVcFNsZWVwT25JdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0VXBTbGVlcE9uSXQoKSB7XG4gICAgICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NsZWVwT25JdFNlbmRCbG9ja2VyJykpIHtcblxuICAgICAgICAgICAgc2VuZEJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXZbYXJpYS1sYWJlbCo9U2VuZF0nKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcqKipTbGVlcCBvbiBpdCBmb3VuZCAnICsgc2VuZEJ1dHRvbnMubGVuZ3RoICsgJyBzZW5kIGJ1dHRvbnMuIEFkZGluZyB3cmFwcGVyIGRpdnMnKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZW5kQnV0dG9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBzZW5kQnV0dG9uID0gc2VuZEJ1dHRvbnNbaV07XG5cbiAgICAgICAgICAgICAgICB3cmFwU2VuZEJ1dHRvbihzZW5kQnV0dG9uKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGlnaHRCb3hVdGlsLmFkZExpZ2h0Qm94Q1NTKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3cmFwU2VuZEJ1dHRvbihzZW5kQnV0dG9uKSB7XG4gICAgICAgIHdyYXBwZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29uc29sZS5sb2coJyoqKkFkZGluZyB3cmFwcGVyIGRpdiB0byAnICsgc2VuZEJ1dHRvbik7XG5cbiAgICAgICAgd3JhcHBlckRpdi5pZCA9ICdzbGVlcE9uSXRTZW5kQmxvY2tlcic7XG4gICAgICAgIHdyYXBwZXJEaXYuc3R5bGUubWFyZ2luID0gJzBweCc7XG4gICAgICAgIHdyYXBwZXJEaXYuc3R5bGUucGFkZGluZyA9ICcwcHgnO1xuICAgICAgICB3cmFwcGVyRGl2LnN0eWxlLmJvcmRlciA9ICdub25lJztcbiAgICAgICAgc2VuZEJ1dHRvbi5zdHlsZS5tYXJnaW5Ub3AgPSAnLTE1cHgnO1xuXG4gICAgICAgIHNlbmRCdXR0b24uaW5uZXJIVE1MID0gJ1NlbmQgPGltZyBzdHlsZT1cXCd3aWR0aDoxNXB4O1xcJyBzcmM9XFwnaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tLzRPYVJFX3hiSFFlNGZXYVJCZmxKRUlUTFRjOUxaZGRTNDlhRHdMdEFQQVk0VEEwLUlrazM0T1Uxd0JjVGQ2UTdGTTQ2a3U2YT1zMjYtaDI2LWUzNjUtcndcXCcvPic7XG5cbiAgICAgICAgd3JhcHBlckRpdi5pbm5lckhUTUwgPSBzZW5kQnV0dG9uLm91dGVySFRNTDtcbiAgICAgICAgc2VuZEJ1dHRvbi5wYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHdyYXBwZXJEaXYpO1xuICAgICAgICBzZW5kQnV0dG9uLnJlbW92ZSgpO1xuICAgICAgICBcbiAgICAgICAgd3JhcHBlckRpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF9zZW5kQnV0dG9uQ2xpY2tIYW5kbGVyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRTZW5kQnV0dG9uQ2xpY2tIYW5kbGVyKHNlbmRCdXR0b25DbGlja0hhbmRsZXIpIHtcbiAgICAgICAgX3NlbmRCdXR0b25DbGlja0hhbmRsZXIgPSBzZW5kQnV0dG9uQ2xpY2tIYW5kbGVyO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyaWdnZXJFbWFpbFNlbmQoKSB7XG4gICAgICAgIHZhciBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudHMnKTtcbiAgICAgICAgXG4gICAgICAgIGV2dC5pbml0TW91c2VFdmVudCgnY2xpY2snLCB0cnVlLCB0cnVlLCB3aW5kb3csIDEsIDAsIDAsIDAsIDAsXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCAwLCBudWxsKTtcblxuICAgICAgICBzZW5kQnV0dG9uc1swXS5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnRBcHAsXG4gICAgICAgIHNldFNlbmRCdXR0b25DbGlja0hhbmRsZXIsXG4gICAgICAgIHRyaWdnZXJFbWFpbFNlbmRcbiAgICB9O1xuXG59KSgpOyIsImltcG9ydCAqIGFzIHNlbnRpbWVudEFuYWx5c2VyIGZyb20gJy4vYW5hbHlzZVNlbnRpbWVudC5qcyc7XG5pbXBvcnQgKiBhcyBlZ29pc21BbmFseXNlciBmcm9tICcuL3V0aWxzL2Vnb2lzbUFuYWx5c2VyLmpzJztcblxuZXhwb3J0IHZhciBkaXNjUHJvZmlsZUFuYWx5c2VyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgc2VudGltZW50U2NvcmVzLFxuICAgICAgICBwcmVmaXhNb2RpZmllcnMsXG4gICAgICAgIHBvc3RmaXhNb2RpZmllcnMsXG4gICAgICAgIGN1cnJlbnRQcmVmaXhNb2RpZmllclNjb3JlLFxuICAgICAgICBjdXJyZW50UG9zdGZpeE1vZGlmaWVyU2NvcmUsXG4gICAgICAgIGxhc3ROb3JtYWxUb2tlblNlbnRpbWVudFNjb3JlO1xuXG4gICAgZnVuY3Rpb24gZ2V0VXNlclJlYWRhYmxlRElTQ1Byb2ZpbGUoZW1haWxDb250ZW50cywgcmVhZGFiaWxpdHlTY29yZSkge1xuICAgICAgICB2YXIgYmVzdEd1ZXNzQXRESVNDUHJvZmlsZSA9IGFuYWx5c2VFbWFpbChlbWFpbENvbnRlbnRzLCByZWFkYWJpbGl0eVNjb3JlKSxcbiAgICAgICAgICAgIGhpZ2hlc3RQcm9maWxlU2NvcmUgPSAxLFxuICAgICAgICAgICAgaGlnaGVzdFByb2ZpbGUgPSAnJyxcbiAgICAgICAgICAgIHNlY29uZEhpZ2hlc3RQcm9maWxlU2NvcmUgPSAxLFxuICAgICAgICAgICAgc2Vjb25kSGlnaGVzdFByb2ZpbGUgPSAnJztcblxuICAgICAgICBPYmplY3Qua2V5cyhiZXN0R3Vlc3NBdERJU0NQcm9maWxlKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gICAgICAgICAgICBpZiAoYmVzdEd1ZXNzQXRESVNDUHJvZmlsZVtwcm9maWxlXSA+IGhpZ2hlc3RQcm9maWxlU2NvcmUpIHtcbiAgICAgICAgICAgICAgICBoaWdoZXN0UHJvZmlsZSA9IHByb2ZpbGU7XG4gICAgICAgICAgICAgICAgaGlnaGVzdFByb2ZpbGVTY29yZSA9IGJlc3RHdWVzc0F0RElTQ1Byb2ZpbGVbcHJvZmlsZV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGJlc3RHdWVzc0F0RElTQ1Byb2ZpbGVbcHJvZmlsZV0gPiBzZWNvbmRIaWdoZXN0UHJvZmlsZVNjb3JlKSB7XG4gICAgICAgICAgICAgICAgc2Vjb25kSGlnaGVzdFByb2ZpbGUgPSBwcm9maWxlO1xuICAgICAgICAgICAgICAgIHNlY29uZEhpZ2hlc3RQcm9maWxlU2NvcmUgPSBiZXN0R3Vlc3NBdERJU0NQcm9maWxlW3Byb2ZpbGVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gaGlnaGVzdFByb2ZpbGUgKyBzZWNvbmRIaWdoZXN0UHJvZmlsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRlbXB0cyB0byBndWVzcyB0aGUgRElTQyBwcm9maWxlIG9mIGEgc2VuZGVyIGJhc2VkIG9uIGFuIGVtYWlsIHRoZXkndmUgc2VudFxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGVtYWlsQ29udGVudHMgIENvbnRlbnRzIG9mIGVtYWlsIHRvIGFuYWx5c2VcbiAgICAgKiBAcGFyYW0ge0ludGVnZXJ9IHJlYWRhYmlsaXR5U2NvcmUgIFJlYWRhYmlsaXR5IHNjb3JlIG9mIGVtYWlsIChhbmFseXNlZCBhbHJlYWR5KVxuICAgICAqXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFuYWx5c2VFbWFpbChlbWFpbENvbnRlbnRzID0gJycsIHJlYWRhYmlsaXR5U2NvcmUpIHtcblxuICAgICAgICB2YXIgZ3Vlc3NBdERJU0NQcm9maWxlID0ge1xuICAgICAgICAgICAgICAgICdEJzogMSxcbiAgICAgICAgICAgICAgICAnSSc6IDEsXG4gICAgICAgICAgICAgICAgJ1MnOiAxLFxuICAgICAgICAgICAgICAgICdDJzogMSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgYWRkR3Vlc3NCYXNlZE9uU2VudGltZW50KGVtYWlsQ29udGVudHMsIGd1ZXNzQXRESVNDUHJvZmlsZSk7XG5cbiAgICAgICAgYWRkR3Vlc3NCYXNlZE9uVm9jYWJ1bGFyeShyZWFkYWJpbGl0eVNjb3JlLCBndWVzc0F0RElTQ1Byb2ZpbGUpO1xuXG4gICAgICAgIGFkZEd1ZXNzQmFzZWRPbkVnb2lzbShlbWFpbENvbnRlbnRzLCBndWVzc0F0RElTQ1Byb2ZpbGUpO1xuXG4gICAgICAgIHJlZHVjZUd1ZXNzZXNUaGF0RXhjZWVkVGhyZXNob2xkKGd1ZXNzQXRESVNDUHJvZmlsZSk7XG5cbiAgICAgICAgcmV0dXJuIGd1ZXNzQXRESVNDUHJvZmlsZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRHdWVzc0Jhc2VkT25TZW50aW1lbnQoZW1haWxDb250ZW50cywgZ3Vlc3NBdERJU0NQcm9maWxlKSB7XG4gICAgICAgIHZhciBzZW50aW1lbnRTY29yZSA9IHNlbnRpbWVudEFuYWx5c2VyLmFuYWx5c2VTZW50aW1lbnQoZW1haWxDb250ZW50cykuc2NvcmUsXG4gICAgICAgICAgICBsZW5ndGhPZkVtYWlsID0gZW1haWxDb250ZW50cy5sZW5ndGgsXG4gICAgICAgICAgICBMRU5HVEhfT0ZfU0hPUlRfRU1BSUwgPSAzMDtcblxuICAgICAgICBjb25zdCBDSEVFUkZVTF9TRU5USU1FTlRfU0NPUkUgPSA1LFxuICAgICAgICAgICAgSFlQRVJfQ0hFRVJGVUxfU0VOVElNRU5UX1NDT1JFID0gMTU7XG5cbiAgICAgICAgaWYgKHNlbnRpbWVudFNjb3JlIDwgQ0hFRVJGVUxfU0VOVElNRU5UX1NDT1JFKSB7XG4gICAgICAgICAgICBpZiAobGVuZ3RoT2ZFbWFpbCA8IExFTkdUSF9PRl9TSE9SVF9FTUFJTCkge1xuICAgICAgICAgICAgICAgIGd1ZXNzQXRESVNDUHJvZmlsZS5EICs9IDQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBndWVzc0F0RElTQ1Byb2ZpbGUuQyArPSAzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNlbnRpbWVudFNjb3JlID4gSFlQRVJfQ0hFRVJGVUxfU0VOVElNRU5UX1NDT1JFKSB7XG4gICAgICAgICAgICAgICAgZ3Vlc3NBdERJU0NQcm9maWxlLkkgKz0gNTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ3Vlc3NBdERJU0NQcm9maWxlLlMgKz0gMztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZEd1ZXNzQmFzZWRPblZvY2FidWxhcnkocmVhZGFiaWxpdHlTY29yZSwgZ3Vlc3NBdERJU0NQcm9maWxlKSB7XG4gICAgICAgIGNvbnN0IEFEVkFOQ0VEX1ZPQ0FCX0xFVkVMID0gNC4wO1xuXG4gICAgICAgIGlmIChyZWFkYWJpbGl0eVNjb3JlID49IEFEVkFOQ0VEX1ZPQ0FCX0xFVkVMKSB7XG4gICAgICAgICAgICBndWVzc0F0RElTQ1Byb2ZpbGUuQyArPSAyO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkR3Vlc3NCYXNlZE9uRWdvaXNtKGVtYWlsQ29udGVudHMsIGd1ZXNzQXRESVNDUHJvZmlsZSkge1xuICAgICAgICB2YXIgZWdvaXNtU2NvcmVzID0gZWdvaXNtQW5hbHlzZXIuYW5hbHlzZUVnb2lzbShlbWFpbENvbnRlbnRzKTtcblxuICAgICAgICBpZiAoZWdvaXNtU2NvcmVzLnNlbGZpc2ggPiBlZ29pc21TY29yZXMuY29udHJvbGxpbmcgJiYgXG4gICAgICAgICAgICBlZ29pc21TY29yZXMuc2VsZmlzaCA+IGVnb2lzbVNjb3Jlcy5jb25mb3JtaW5nKSB7XG5cbiAgICAgICAgICAgIGd1ZXNzQXRESVNDUHJvZmlsZS5JICs9IDI7XG5cbiAgICAgICAgfSBlbHNlIGlmIChlZ29pc21TY29yZXMuY29udHJvbGxpbmcgPiBlZ29pc21TY29yZXMuc2VsZmlzaCAmJiBcbiAgICAgICAgICAgIGVnb2lzbVNjb3Jlcy5jb250cm9sbGluZyA+IGVnb2lzbVNjb3Jlcy5jb25mb3JtaW5nKSB7XG5cbiAgICAgICAgICAgIGd1ZXNzQXRESVNDUHJvZmlsZS5EICs9IDI7XG5cbiAgICAgICAgfSBlbHNlIGlmIChlZ29pc21TY29yZXMuY29uZm9ybWluZyA+IGVnb2lzbVNjb3Jlcy5jb250cm9sbGluZykge1xuXG4gICAgICAgICAgICBndWVzc0F0RElTQ1Byb2ZpbGUuUyArPSAyO1xuXG4gICAgICAgIH0gXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVkdWNlR3Vlc3Nlc1RoYXRFeGNlZWRUaHJlc2hvbGQoZ3Vlc3NBdERJU0NQcm9maWxlKSB7XG4gICAgICAgIGNvbnN0IE1BWF9TQ09SRSA9IDc7XG5cbiAgICAgICAgT2JqZWN0LmtleXMoZ3Vlc3NBdERJU0NQcm9maWxlKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gICAgICAgICAgICBpZiAoZ3Vlc3NBdERJU0NQcm9maWxlW3Byb2ZpbGVdID4gTUFYX1NDT1JFKSB7XG4gICAgICAgICAgICAgICAgZ3Vlc3NBdERJU0NQcm9maWxlW3Byb2ZpbGVdID0gTUFYX1NDT1JFO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhbmFseXNlRW1haWw6IGFuYWx5c2VFbWFpbCxcbiAgICAgICAgZ2V0VXNlclJlYWRhYmxlRElTQ1Byb2ZpbGU6IGdldFVzZXJSZWFkYWJsZURJU0NQcm9maWxlXG4gICAgfTtcblxufSkoKTsiLCJpbXBvcnQgXyBmcm9tICcuLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS91bmRlcnNjb3JlLmpzJztcbmltcG9ydCAqIGFzIHNlbnRpbWVudFdvcmRMaXN0IGZyb20gJy4vc2VudGltZW50V29yZExpc3QuanMnO1xuaW1wb3J0ICogYXMgcmVnZXhMaXN0IGZyb20gJy4vdXRpbHMvcmVnZXhMaXN0LmpzJztcblxuZXhwb3J0IHZhciBhbmFseXNlU2VudGltZW50ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgc2VudGltZW50U2NvcmVzLFxuICAgICAgICBwcmVmaXhNb2RpZmllcnMsXG4gICAgICAgIHBvc3RmaXhNb2RpZmllcnMsXG4gICAgICAgIGN1cnJlbnRQcmVmaXhNb2RpZmllclNjb3JlLFxuICAgICAgICBjdXJyZW50UG9zdGZpeE1vZGlmaWVyU2NvcmUsXG4gICAgICAgIGxhc3ROb3JtYWxUb2tlblNlbnRpbWVudFNjb3JlO1xuXG4gICAgLyoqXG4gICAgICogRnJvbSBodHRwczovL2dpdGh1Yi5jb20vdGhpc2FuZGFnYWluL3NlbnRpbWVudC9ibG9iL21hc3Rlci9saWIvaW5kZXguanNcbiAgICAgKiBQZXJmb3JtcyBzZW50aW1lbnQgYW5hbHlzaXMgb24gdGhlIHByb3ZpZGVkIGlucHV0IFwicGhyYXNlXCIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gSW5wdXQgcGhyYXNlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IE9wdGlvbmFsIHNlbnRpbWVudCBhZGRpdGlvbnMgdG8gc2VudGltZW50U2NvcmVzIChoYXNoIGsvdiBwYWlycylcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhbmFseXNlU2VudGltZW50IChwaHJhc2UgPSAnJywgaW5qZWN0ID0gbnVsbCwgY2FsbGJhY2sgPSBudWxsKSB7XG4gICAgICAgIHNldHVwV29yZExpc3QoaW5qZWN0KTtcblxuICAgICAgICAvLyBTdG9yYWdlIG9iamVjdHNcbiAgICAgICAgbGV0IHRva2VucyAgICAgID0gdG9rZW5pemUocGhyYXNlKSxcbiAgICAgICAgICAgIHNjb3JlICAgICAgID0gMCxcbiAgICAgICAgICAgIHdvcmRzICAgICAgID0gW10sXG4gICAgICAgICAgICBwb3NpdGl2ZSAgICA9IFtdLFxuICAgICAgICAgICAgbmVnYXRpdmUgICAgPSBbXTtcblxuICAgICAgICBjdXJyZW50UHJlZml4TW9kaWZpZXJTY29yZSA9IDE7XG4gICAgICAgIGN1cnJlbnRQb3N0Zml4TW9kaWZpZXJTY29yZSA9IDE7XG4gICAgICAgIGxhc3ROb3JtYWxUb2tlblNlbnRpbWVudFNjb3JlID0gMDtcblxuICAgICAgICB0b2tlbnMuZm9yRWFjaChmdW5jdGlvbih3b3JkLCBpbmRleCkge1xuICAgICAgICAgICAgbGV0IHdvcmRTZW50aW1lbnRTY29yZSA9IGFuYWx5c2VTZW50aW1lbnRGb3JXb3JkKHdvcmQpO1xuXG4gICAgICAgICAgICBpZiAoIXdvcmRTZW50aW1lbnRTY29yZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd29yZHMucHVzaCh3b3JkKTtcblxuICAgICAgICAgICAgaWYgKHdvcmRTZW50aW1lbnRTY29yZSA+IDApIHtcbiAgICAgICAgICAgICAgICBwb3NpdGl2ZS5wdXNoKHdvcmQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh3b3JkU2VudGltZW50U2NvcmUgPCAwKSB7XG4gICAgICAgICAgICAgICAgbmVnYXRpdmUucHVzaCh3b3JkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2NvcmUgKz0gd29yZFNlbnRpbWVudFNjb3JlO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBIYW5kbGUgb3B0aW9uYWwgYXN5bmMgaW50ZXJmYWNlXG4gICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICBzY29yZTogICAgICAgICAgc2NvcmUsXG4gICAgICAgICAgICBjb21wYXJhdGl2ZTogICAgc2NvcmUgLyB0b2tlbnMubGVuZ3RoLFxuICAgICAgICAgICAgdG9rZW5zOiAgICAgICAgIHRva2VucyxcbiAgICAgICAgICAgIHdvcmRzOiAgICAgICAgICB3b3JkcyxcbiAgICAgICAgICAgIHBvc2l0aXZlOiAgICAgICBwb3NpdGl2ZSxcbiAgICAgICAgICAgIG5lZ2F0aXZlOiAgICAgICBuZWdhdGl2ZVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uZGVmZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYW5hbHlzZVNlbnRpbWVudEZvcldvcmQod29yZCkge1xuICAgICAgICB2YXIgbG93ZXJDYXNlV29yZCA9IHdvcmQudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgIHRva2VuUHJlZml4TW9kaWZpZXJTY29yZSA9IHByZWZpeE1vZGlmaWVyc1tsb3dlckNhc2VXb3JkXSxcbiAgICAgICAgICAgIHRva2VuUG9zdGZpeE1vZGlmaWVyU2NvcmUgPSBwb3N0Zml4TW9kaWZpZXJzW2xvd2VyQ2FzZVdvcmRdLFxuICAgICAgICAgICAgdG9rZW5TZW50aW1lbnRTY29yZSA9IHNlbnRpbWVudFNjb3Jlc1tsb3dlckNhc2VXb3JkXSxcbiAgICAgICAgICAgIHByb2Nlc3NlZFNlbnRpbWVudFNjb3JlID0gMCxcbiAgICAgICAgICAgIGlzQWxsVXBwZXJDYXNlID0gd29yZC50b1VwcGVyQ2FzZSgpID09PSB3b3JkLFxuICAgICAgICAgICAgTVVMVElQTElFUl9GT1JfQUxMX1VQUEVSX0NBU0UgPSAyLFxuICAgICAgICAgICAgc2hvdWxkQWRkVG9TY29yZSA9IHRva2VuUHJlZml4TW9kaWZpZXJTY29yZSB8fCB0b2tlblBvc3RmaXhNb2RpZmllclNjb3JlIHx8IHRva2VuU2VudGltZW50U2NvcmU7XG5cbiAgICAgICAgaWYgKHRva2VuUHJlZml4TW9kaWZpZXJTY29yZSkge1xuICAgICAgICAgICAgLy9zdWJ0cmFjdCAxIGJlY2F1c2UgdGhlIG1vZGlmaWVyIHN0YXJ0cyBhdCB4MSByYXRoZXIgdGhhbiB4MFxuICAgICAgICAgICAgLy9pZiBtb2RpZmllciA9PSAyLCB3ZSB3YW50IHgyIG5vdCB4M1xuICAgICAgICAgICAgY3VycmVudFByZWZpeE1vZGlmaWVyU2NvcmUgKz0gdG9rZW5QcmVmaXhNb2RpZmllclNjb3JlIC0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0b2tlblBvc3RmaXhNb2RpZmllclNjb3JlKSB7XG4gICAgICAgICAgICBjdXJyZW50UG9zdGZpeE1vZGlmaWVyU2NvcmUgKz0gdG9rZW5Qb3N0Zml4TW9kaWZpZXJTY29yZSAtIDE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodG9rZW5TZW50aW1lbnRTY29yZSkge1xuICAgICAgICAgICAgbGFzdE5vcm1hbFRva2VuU2VudGltZW50U2NvcmUgPSB0b2tlblNlbnRpbWVudFNjb3JlO1xuXG4gICAgICAgICAgICBpZiAoaXNBbGxVcHBlckNhc2UpIHtcbiAgICAgICAgICAgICAgICBsYXN0Tm9ybWFsVG9rZW5TZW50aW1lbnRTY29yZSAqPSBNVUxUSVBMSUVSX0ZPUl9BTExfVVBQRVJfQ0FTRTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsYXN0Tm9ybWFsVG9rZW5TZW50aW1lbnRTY29yZSAmJiBzaG91bGRBZGRUb1Njb3JlKSB7XG4gICAgICAgICAgICBwcm9jZXNzZWRTZW50aW1lbnRTY29yZSA9IGxhc3ROb3JtYWxUb2tlblNlbnRpbWVudFNjb3JlICogY3VycmVudFByZWZpeE1vZGlmaWVyU2NvcmUgKiBjdXJyZW50UG9zdGZpeE1vZGlmaWVyU2NvcmU7XG4gICAgICAgICAgICBjdXJyZW50UHJlZml4TW9kaWZpZXJTY29yZSA9IDE7XG4gICAgICAgICAgICBjdXJyZW50UG9zdGZpeE1vZGlmaWVyU2NvcmUgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByb2Nlc3NlZFNlbnRpbWVudFNjb3JlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldHVwV29yZExpc3QoaW5qZWN0KSB7XG4gICAgICAgIGlmICghc2VudGltZW50U2NvcmVzKSB7XG4gICAgICAgICAgICBzZW50aW1lbnRTY29yZXMgPSBfLmNsb25lKHNlbnRpbWVudFdvcmRMaXN0LlNFTlRJTUVOVF9TQ09SRVMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwcmVmaXhNb2RpZmllcnMpIHtcbiAgICAgICAgICAgIHByZWZpeE1vZGlmaWVycyA9IF8uY2xvbmUoc2VudGltZW50V29yZExpc3QuUFJFRklYX01PRElGSUVSUyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBvc3RmaXhNb2RpZmllcnMpIHtcbiAgICAgICAgICAgIHBvc3RmaXhNb2RpZmllcnMgPSBfLmNsb25lKHNlbnRpbWVudFdvcmRMaXN0LlBPU1RGSVhfTU9ESUZJRVJTKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1lcmdlXG4gICAgICAgIGlmIChpbmplY3QgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHNlbnRpbWVudFNjb3JlcyA9IF8uZXh0ZW5kKHNlbnRpbWVudFNjb3JlcywgaW5qZWN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRva2VuaXplcyBhbiBpbnB1dCBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gSW5wdXRcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRva2VuaXplIChpbnB1dCkge1xuXG4gICAgICAgIGlmICghaW5wdXQpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IEJSX1RhZ3MgPSAnZGl2YnInLFxuICAgICAgICAgICAgICBFWENMQU1BVElPTl9NQVJLUyA9IC8oXFwhKS9nLFxuICAgICAgICAgICAgICBRVUVTVElPTl9NQVJLUyA9IC9cXD8vZyxcbiAgICAgICAgICAgICAgRVhUUkFfU1BBQ0VTID0gJy8gezIsfS8nO1xuXG4gICAgICAgIHJldHVybiBpbnB1dFxuICAgICAgICAgICAgLnJlcGxhY2UocmVnZXhMaXN0LkVNT0pJX1JFR0VYLCAnICQxICcpXG4gICAgICAgICAgICAucmVwbGFjZShCUl9UYWdzLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKEVYQ0xBTUFUSU9OX01BUktTLCAnICQxICcpXG4gICAgICAgICAgICAucmVwbGFjZShRVUVTVElPTl9NQVJLUywgJyA/ICcpXG4gICAgICAgICAgICAucmVwbGFjZShFWFRSQV9TUEFDRVMsJyAnKVxuICAgICAgICAgICAgLnNwbGl0KCcgJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFuYWx5c2VTZW50aW1lbnQ7XG59KSgpOyIsIlxuLyoqXG4qKlxuQ29weXJpZ2h0IChjKSAyMDEyIC0gMjAxNCBBbmRyZXcgU2xpd2luc2tpLlxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlICdTb2Z0d2FyZScpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiovXG5cbmV4cG9ydCBjb25zdCBTRU5USU1FTlRfU0NPUkVTID0geydhYmFuZG9uJzotMiwnYWJhbmRvbmVkJzotMiwnYWJhbmRvbnMnOi0yLCdhYmR1Y3RlZCc6LTIsJ2FiZHVjdGlvbic6LTIsJ2FiZHVjdGlvbnMnOi0yLCdhYmhvcic6LTMsJ2FiaG9ycmVkJzotMywnYWJob3JyZW50JzotMywnYWJob3JzJzotMywnYWJpbGl0aWVzJzoyLCdhYmlsaXR5JzoyLCdhYm9hcmQnOjEsJ2Fic2VudGVlJzotMSwnYWJzZW50ZWVzJzotMSwnYWJzb2x2ZSc6MiwnYWJzb2x2ZWQnOjIsJ2Fic29sdmVzJzoyLCdhYnNvbHZpbmcnOjIsJ2Fic29yYmVkJzoxLCdhYnVzZSc6LTMsJ2FidXNlZCc6LTMsJ2FidXNlcyc6LTMsJ2FidXNpdmUnOi0zLCdhY2NlcHQnOjEsJ2FjY2VwdGVkJzoxLCdhY2NlcHRpbmcnOjEsJ2FjY2VwdHMnOjEsJ2FjY2lkZW50JzotMiwnYWNjaWRlbnRhbCc6LTIsJ2FjY2lkZW50YWxseSc6LTIsJ2FjY2lkZW50cyc6LTIsJ2FjY29tcGxpc2gnOjIsJ2FjY29tcGxpc2hlZCc6MiwnYWNjb21wbGlzaGVzJzoyLCdhY2N1c2F0aW9uJzotMiwnYWNjdXNhdGlvbnMnOi0yLCdhY2N1c2UnOi0yLCdhY2N1c2VkJzotMiwnYWNjdXNlcyc6LTIsJ2FjY3VzaW5nJzotMiwnYWNoZSc6LTIsJ2FjaGlldmFibGUnOjEsJ2FjaGluZyc6LTIsJ2FjcXVpdCc6MiwnYWNxdWl0cyc6MiwnYWNxdWl0dGVkJzoyLCdhY3F1aXR0aW5nJzoyLCdhY3JpbW9uaW91cyc6LTMsJ2FjdGl2ZSc6MSwnYWRlcXVhdGUnOjEsJ2FkbWlyZSc6MywnYWRtaXJlZCc6MywnYWRtaXJlcyc6MywnYWRtaXJpbmcnOjMsJ2FkbWl0JzotMSwnYWRtaXRzJzotMSwnYWRtaXR0ZWQnOi0xLCdhZG1vbmlzaCc6LTIsJ2FkbW9uaXNoZWQnOi0yLCdhZG9wdCc6MSwnYWRvcHRzJzoxLCdhZG9yYWJsZSc6MywnYWRvcmUnOjMsJ2Fkb3JlZCc6MywnYWRvcmVzJzozLCdhZHZhbmNlZCc6MSwnYWR2YW50YWdlJzoyLCdhZHZhbnRhZ2VzJzoyLCdhZHZlbnR1cmUnOjIsJ2FkdmVudHVyZXMnOjIsJ2FkdmVudHVyb3VzJzoyLCdhZmZlY3RlZCc6LTEsJ2FmZmVjdGlvbic6MywnYWZmZWN0aW9uYXRlJzozLCdhZmZsaWN0ZWQnOi0xLCdhZmZyb250ZWQnOi0xLCdhZnJhaWQnOi0yLCdhZ2dyYXZhdGUnOi0yLCdhZ2dyYXZhdGVkJzotMiwnYWdncmF2YXRlcyc6LTIsJ2FnZ3JhdmF0aW5nJzotMiwnYWdncmVzc2lvbic6LTIsJ2FnZ3Jlc3Npb25zJzotMiwnYWdncmVzc2l2ZSc6LTIsJ2FnaGFzdCc6LTIsJ2Fnb2cnOjIsJ2Fnb25pc2UnOi0zLCdhZ29uaXNlZCc6LTMsJ2Fnb25pc2VzJzotMywnYWdvbmlzaW5nJzotMywnYWdvbml6ZSc6LTMsJ2Fnb25pemVkJzotMywnYWdvbml6ZXMnOi0zLCdhZ29uaXppbmcnOi0zLCdhZ3JlZSc6MSwnYWdyZWVhYmxlJzoyLCdhZ3JlZWQnOjEsJ2FncmVlbWVudCc6MSwnYWdyZWVzJzoxLCdhbGFybSc6LTIsJ2FsYXJtZWQnOi0yLCdhbGFybWlzdCc6LTIsJ2FsYXJtaXN0cyc6LTIsJ2FsYXMnOi0xLCdhbGVydCc6LTEsJ2FsaWVuYXRpb24nOi0yLCdhbGl2ZSc6MSwgJ2FsbCc6MiwgJ2FsbGVyZ2ljJzotMiwnYWxsb3cnOjEsJ2Fsb25lJzotMiwnYW1hemUnOjIsJ2FtYXplZCc6MiwnYW1hemVzJzoyLCdhbWF6aW5nJzo0LCdhbWJpdGlvdXMnOjIsJ2FtYml2YWxlbnQnOi0xLCdhbXVzZSc6MywnYW11c2VkJzozLCdhbXVzZW1lbnQnOjMsJ2FtdXNlbWVudHMnOjMsJ2FuZ2VyJzotMywnYW5nZXJzJzotMywnYW5ncnknOi0zLCdhbmd1aXNoJzotMywnYW5ndWlzaGVkJzotMywnYW5pbW9zaXR5JzotMiwnYW5ub3knOi0yLCdhbm5veWFuY2UnOi0yLCdhbm5veWVkJzotMiwnYW5ub3lpbmcnOi0yLCdhbm5veXMnOi0yLCdhbnRhZ29uaXN0aWMnOi0yLCdhbnRpJzotMSwnYW50aWNpcGF0aW9uJzoxLCdhbnhpZXR5JzotMiwnYW54aW91cyc6LTIsJ2FwYXRoZXRpYyc6LTMsJ2FwYXRoeSc6LTMsJ2FwZXNoaXQnOi0zLCdhcG9jYWx5cHRpYyc6LTIsJ2Fwb2xvZ2lzZSc6LTEsJ2Fwb2xvZ2lzZWQnOi0xLCdhcG9sb2dpc2VzJzotMSwnYXBvbG9naXNpbmcnOi0xLCdhcG9sb2dpemUnOi0xLCdhcG9sb2dpemVkJzotMSwnYXBvbG9naXplcyc6LTEsJ2Fwb2xvZ2l6aW5nJzotMSwnYXBvbG9neSc6LTEsJ2FwcGFsbGVkJzotMiwnYXBwYWxsaW5nJzotMiwnYXBwZWFzZSc6MiwnYXBwZWFzZWQnOjIsJ2FwcGVhc2VzJzoyLCdhcHBlYXNpbmcnOjIsJ2FwcGxhdWQnOjIsJ2FwcGxhdWRlZCc6MiwnYXBwbGF1ZGluZyc6MiwnYXBwbGF1ZHMnOjIsJ2FwcGxhdXNlJzoyLCdhcHByZWNpYXRlJzoyLCdhcHByZWNpYXRlZCc6MiwnYXBwcmVjaWF0ZXMnOjIsJ2FwcHJlY2lhdGluZyc6MiwnYXBwcmVjaWF0aW9uJzoyLCdhcHByZWhlbnNpdmUnOi0yLCdhcHByb3ZhbCc6MiwnYXBwcm92ZWQnOjIsJ2FwcHJvdmVzJzoyLCdhcmRlbnQnOjEsJ2FycmVzdCc6LTIsJ2FycmVzdGVkJzotMywnYXJyZXN0cyc6LTIsJ2Fycm9nYW50JzotMiwnYXNoYW1lJzotMiwnYXNoYW1lZCc6LTIsJ2Fzcyc6LTQsJ2Fzc2Fzc2luYXRpb24nOi0zLCdhc3Nhc3NpbmF0aW9ucyc6LTMsJ2Fzc2V0JzoyLCdhc3NldHMnOjIsJ2Fzc2Z1Y2tpbmcnOi00LCdhc3Nob2xlJzotNCwnYXN0b25pc2hlZCc6MiwnYXN0b3VuZCc6MywnYXN0b3VuZGVkJzozLCdhc3RvdW5kaW5nJzozLCdhc3RvdW5kaW5nbHknOjMsJ2FzdG91bmRzJzozLCdhdHRhY2snOi0xLCdhdHRhY2tlZCc6LTEsJ2F0dGFja2luZyc6LTEsJ2F0dGFja3MnOi0xLCdhdHRyYWN0JzoxLCdhdHRyYWN0ZWQnOjEsJ2F0dHJhY3RpbmcnOjIsJ2F0dHJhY3Rpb24nOjIsJ2F0dHJhY3Rpb25zJzoyLCdhdHRyYWN0cyc6MSwnYXVkYWNpb3VzJzozLCdhdXRob3JpdHknOjEsJ2F2ZXJ0JzotMSwnYXZlcnRlZCc6LTEsJ2F2ZXJ0cyc6LTEsJ2F2aWQnOjIsJ2F2b2lkJzotMSwnYXZvaWRlZCc6LTEsJ2F2b2lkcyc6LTEsJ2F3YWl0JzotMSwnYXdhaXRlZCc6LTEsJ2F3YWl0cyc6LTEsJ2F3YXJkJzozLCdhd2FyZGVkJzozLCdhd2FyZHMnOjMsJ2F3ZXNvbWUnOjQsJ2F3ZnVsJzotMywnYXdrd2FyZCc6LTIsJ2F4ZSc6LTEsJ2F4ZWQnOi0xLCdiYWNrZWQnOjEsJ2JhY2tpbmcnOjIsJ2JhY2tzJzoxLCdiYWQnOi0zLCdiYWRhc3MnOi0zLCdiYWRseSc6LTMsJ2JhaWxvdXQnOi0yLCdiYW1ib296bGUnOi0yLCdiYW1ib296bGVkJzotMiwnYmFtYm9vemxlcyc6LTIsJ2Jhbic6LTIsJ2JhbmlzaCc6LTEsJ2JhbmtydXB0JzotMywnYmFua3N0ZXInOi0zLCdiYW5uZWQnOi0yLCdiYXJnYWluJzoyLCdiYXJyaWVyJzotMiwnYmFzdGFyZCc6LTUsJ2Jhc3RhcmRzJzotNSwnYmF0dGxlJzotMSwnYmF0dGxlcyc6LTEsJ2JlYXRlbic6LTIsJ2JlYXRpZmljJzozLCdiZWF0aW5nJzotMSwnYmVhdXRpZXMnOjMsJ2JlYXV0aWZ1bCc6MywnYmVhdXRpZnVsbHknOjMsJ2JlYXV0aWZ5JzozLCdiZWxpdHRsZSc6LTIsJ2JlbGl0dGxlZCc6LTIsJ2JlbG92ZWQnOjMsJ2JlbmVmaXQnOjIsJ2JlbmVmaXRzJzoyLCdiZW5lZml0dGVkJzoyLCdiZW5lZml0dGluZyc6MiwnYmVyZWF2ZSc6LTIsJ2JlcmVhdmVkJzotMiwnYmVyZWF2ZXMnOi0yLCdiZXJlYXZpbmcnOi0yLCdiZXN0JzozLCdiZXRyYXknOi0zLCdiZXRyYXlhbCc6LTMsJ2JldHJheWVkJzotMywnYmV0cmF5aW5nJzotMywnYmV0cmF5cyc6LTMsJ2JldHRlcic6MiwnYmlhcyc6LTEsJ2JpYXNlZCc6LTIsJ2JpZyc6MSwnYml0Y2gnOi01LCdiaXRjaGVzJzotNSwnYml0dGVyJzotMiwnYml0dGVybHknOi0yLCdiaXphcnJlJzotMiwnYmxhaCc6LTIsJ2JsYW1lJzotMiwnYmxhbWVkJzotMiwnYmxhbWVzJzotMiwnYmxhbWluZyc6LTIsICdibGFzdCc6IDIsICdibGVzcyc6MiwnYmxlc3Nlcyc6MiwnYmxlc3NpbmcnOjMsJ2JsaW5kJzotMSwnYmxpc3MnOjMsJ2JsaXNzZnVsJzozLCdibGl0aGUnOjIsJ2Jsb2NrJzotMSwnYmxvY2tidXN0ZXInOjMsJ2Jsb2NrZWQnOi0xLCdibG9ja2luZyc6LTEsJ2Jsb2Nrcyc6LTEsJ2JsdXJyeSc6LTIsJ2JvYXN0ZnVsJzotMiwnYm9sZCc6MiwnYm9sZGx5JzoyLCdib21iJzotMSwnYm9vc3QnOjEsJ2Jvb3N0ZWQnOjEsJ2Jvb3N0aW5nJzoxLCdib29zdHMnOjEsJ2JvcmUnOi0yLCdib3JlZCc6LTIsJ2JvcmluZyc6LTMsJ2JvdGhlcic6LTIsJ2JvdGhlcmVkJzotMiwnYm90aGVycyc6LTIsJ2JvdGhlcnNvbWUnOi0yLCdib3ljb3R0JzotMiwnYm95Y290dGVkJzotMiwnYm95Y290dGluZyc6LTIsJ2JveWNvdHRzJzotMiwnYnJhaW53YXNoaW5nJzotMywnYnJhdmUnOjIsJ2JyZWFrdGhyb3VnaCc6MywnYnJlYXRodGFraW5nJzo1LCdicmliZSc6LTMsJ2JyaWdodCc6MSwnYnJpZ2h0ZXN0JzoyLCdicmlnaHRuZXNzJzoxLCdicmlsbGlhbnQnOjQsJ2JyaXNrJzoyLCdicm9rZSc6LTEsJ2Jyb2tlbic6LTEsJ2Jyb29kaW5nJzotMiwnYnVsbGllZCc6LTIsJ2J1bGxzaGl0JzotNCwnYnVsbHknOi0yLCdidWxseWluZyc6LTIsJ2J1bW1lcic6LTIsJ2J1b3lhbnQnOjIsJ2J1cmRlbic6LTIsJ2J1cmRlbmVkJzotMiwnYnVyZGVuaW5nJzotMiwnYnVyZGVucyc6LTIsJ2NhbG0nOjIsJ2NhbG1lZCc6MiwnY2FsbWluZyc6MiwnY2FsbXMnOjIsJ2NhblxcJ3Qgc3RhbmQnOi0zLCdjYW5jZWwnOi0xLCdjYW5jZWxsZWQnOi0xLCdjYW5jZWxsaW5nJzotMSwnY2FuY2Vscyc6LTEsJ2NhbmNlcic6LTEsJ2NhcGFibGUnOjEsJ2NhcHRpdmF0ZWQnOjMsJ2NhcmUnOjIsJ2NhcmVmcmVlJzoxLCdjYXJlZnVsJzoyLCdjYXJlZnVsbHknOjIsJ2NhcmVsZXNzJzotMiwnY2FyZXMnOjIsJ2Nhc2hpbmcgaW4nOi0yLCdjYXN1YWx0eSc6LTIsJ2NhdGFzdHJvcGhlJzotMywnY2F0YXN0cm9waGljJzotNCwnY2F1dGlvdXMnOi0xLCdjZWxlYnJhdGUnOjMsJ2NlbGVicmF0ZWQnOjMsJ2NlbGVicmF0ZXMnOjMsJ2NlbGVicmF0aW5nJzozLCdjZW5zb3InOi0yLCdjZW5zb3JlZCc6LTIsJ2NlbnNvcnMnOi0yLCdjZXJ0YWluJzoxLCdjaGFncmluJzotMiwnY2hhZ3JpbmVkJzotMiwnY2hhbGxlbmdlJzotMSwnY2hhbmNlJzoyLCdjaGFuY2VzJzoyLCdjaGFvcyc6LTIsJ2NoYW90aWMnOi0yLCdjaGFyZ2VkJzotMywnY2hhcmdlcyc6LTIsJ2NoYXJtJzozLCdjaGFybWluZyc6MywnY2hhcm1sZXNzJzotMywnY2hhc3Rpc2UnOi0zLCdjaGFzdGlzZWQnOi0zLCdjaGFzdGlzZXMnOi0zLCdjaGFzdGlzaW5nJzotMywnY2hlYXQnOi0zLCdjaGVhdGVkJzotMywnY2hlYXRlcic6LTMsJ2NoZWF0ZXJzJzotMywnY2hlYXRzJzotMywnY2hlZXInOjIsJ2NoZWVyZWQnOjIsJ2NoZWVyZnVsJzoyLCdjaGVlcmluZyc6MiwnY2hlZXJsZXNzJzotMiwnY2hlZXJzJzoyLCdjaGVlcnknOjMsJ2NoZXJpc2gnOjIsJ2NoZXJpc2hlZCc6MiwnY2hlcmlzaGVzJzoyLCdjaGVyaXNoaW5nJzoyLCdjaGljJzoyLCdjaGlsZGlzaCc6LTIsJ2NoaWxsaW5nJzotMSwnY2hva2UnOi0yLCdjaG9rZWQnOi0yLCdjaG9rZXMnOi0yLCdjaG9raW5nJzotMiwnY2xhcmlmaWVzJzoyLCdjbGFyaXR5JzoyLCdjbGFzaCc6LTIsJ2NsYXNzeSc6MywnY2xlYW4nOjIsJ2NsZWFuZXInOjIsJ2NsZWFyJzoxLCdjbGVhcmVkJzoxLCdjbGVhcmx5JzoxLCdjbGVhcnMnOjEsJ2NsZXZlcic6MiwnY2xvdWRlZCc6LTEsJ2NsdWVsZXNzJzotMiwnY29jayc6LTUsJ2NvY2tzdWNrZXInOi01LCdjb2Nrc3Vja2Vycyc6LTUsJ2NvY2t5JzotMiwnY29lcmNlZCc6LTIsJ2NvbGxhcHNlJzotMiwnY29sbGFwc2VkJzotMiwnY29sbGFwc2VzJzotMiwnY29sbGFwc2luZyc6LTIsJ2NvbGxpZGUnOi0xLCdjb2xsaWRlcyc6LTEsJ2NvbGxpZGluZyc6LTEsJ2NvbGxpc2lvbic6LTIsJ2NvbGxpc2lvbnMnOi0yLCdjb2xsdWRpbmcnOi0zLCdjb21iYXQnOi0xLCdjb21iYXRzJzotMSwnY29tZWR5JzoxLCdjb21mb3J0JzoyLCdjb21mb3J0YWJsZSc6MiwnY29tZm9ydGluZyc6MiwnY29tZm9ydHMnOjIsJ2NvbW1lbmQnOjIsJ2NvbW1lbmRlZCc6MiwnY29tbWl0JzoxLCdjb21taXRtZW50JzoyLCdjb21taXRzJzoxLCdjb21taXR0ZWQnOjEsJ2NvbW1pdHRpbmcnOjEsJ2NvbXBhc3Npb25hdGUnOjIsJ2NvbXBlbGxlZCc6MSwnY29tcGV0ZW50JzoyLCdjb21wZXRpdGl2ZSc6MiwnY29tcGxhY2VudCc6LTIsJ2NvbXBsYWluJzotMiwnY29tcGxhaW5lZCc6LTIsJ2NvbXBsYWlucyc6LTIsJ2NvbXByZWhlbnNpdmUnOjIsJ2NvbmNpbGlhdGUnOjIsJ2NvbmNpbGlhdGVkJzoyLCdjb25jaWxpYXRlcyc6MiwnY29uY2lsaWF0aW5nJzoyLCdjb25kZW1uJzotMiwnY29uZGVtbmF0aW9uJzotMiwnY29uZGVtbmVkJzotMiwnY29uZGVtbnMnOi0yLCdjb25maWRlbmNlJzoyLCdjb25maWRlbnQnOjIsJ2NvbmZsaWN0JzotMiwnY29uZmxpY3RpbmcnOi0yLCdjb25mbGljdGl2ZSc6LTIsJ2NvbmZsaWN0cyc6LTIsJ2NvbmZ1c2UnOi0yLCdjb25mdXNlZCc6LTIsJ2NvbmZ1c2luZyc6LTIsJ2NvbmdyYXRzJzoyLCdjb25ncmF0dWxhdGUnOjIsJ2NvbmdyYXR1bGF0aW9uJzoyLCdjb25ncmF0dWxhdGlvbnMnOjIsJ2NvbnNlbnQnOjIsJ2NvbnNlbnRzJzoyLCdjb25zb2xhYmxlJzoyLCdjb25zcGlyYWN5JzotMywnY29uc3RyYWluZWQnOi0yLCdjb250YWdpb24nOi0yLCdjb250YWdpb25zJzotMiwnY29udGFnaW91cyc6LTEsJ2NvbnRlbXB0JzotMiwnY29udGVtcHR1b3VzJzotMiwnY29udGVtcHR1b3VzbHknOi0yLCdjb250ZW5kJzotMSwnY29udGVuZGVyJzotMSwnY29udGVuZGluZyc6LTEsJ2NvbnRlbnRpb3VzJzotMiwnY29udGVzdGFibGUnOi0yLCdjb250cm92ZXJzaWFsJzotMiwnY29udHJvdmVyc2lhbGx5JzotMiwnY29udmluY2UnOjEsJ2NvbnZpbmNlZCc6MSwnY29udmluY2VzJzoxLCdjb252aXZpYWwnOjIsJ2Nvb2wnOjEsJ2Nvb2wgc3R1ZmYnOjMsJ2Nvcm5lcmVkJzotMiwnY29ycHNlJzotMSwnY29zdGx5JzotMiwnY291cmFnZSc6MiwnY291cmFnZW91cyc6MiwnY291cnRlb3VzJzoyLCdjb3VydGVzeSc6MiwnY292ZXItdXAnOi0zLCdjb3dhcmQnOi0yLCdjb3dhcmRseSc6LTIsJ2NvemluZXNzJzoyLCdjcmFtcCc6LTEsJ2NyYXAnOi0zLCdjcmFzaCc6LTIsJ2NyYXppZXInOi0yLCdjcmF6aWVzdCc6LTIsJ2NyYXp5JzotMiwnY3JlYXRpdmUnOjIsJ2NyZXN0ZmFsbGVuJzotMiwnY3JpZWQnOi0yLCdjcmllcyc6LTIsJ2NyaW1lJzotMywnY3JpbWluYWwnOi0zLCdjcmltaW5hbHMnOi0zLCdjcmlzaXMnOi0zLCdjcml0aWMnOi0yLCdjcml0aWNpc20nOi0yLCdjcml0aWNpemUnOi0yLCdjcml0aWNpemVkJzotMiwnY3JpdGljaXplcyc6LTIsJ2NyaXRpY2l6aW5nJzotMiwnY3JpdGljcyc6LTIsJ2NydWVsJzotMywnY3J1ZWx0eSc6LTMsJ2NydXNoJzotMSwnY3J1c2hlZCc6LTIsJ2NydXNoZXMnOi0xLCdjcnVzaGluZyc6LTEsJ2NyeSc6LTEsJ2NyeWluZyc6LTIsJ2N1bnQnOi01LCdjdXJpb3VzJzoxLCdjdXJzZSc6LTEsJ2N1dCc6LTEsJ2N1dGUnOjIsJ2N1dHMnOi0xLCdjdXR0aW5nJzotMSwnY3luaWMnOi0yLCdjeW5pY2FsJzotMiwnY3luaWNpc20nOi0yLCdkYW1hZ2UnOi0zLCdkYW1hZ2VzJzotMywnZGFtbic6LTQsJ2RhbW5lZCc6LTQsJ2RhbW5pdCc6LTQsJ2Rhbmdlcic6LTIsJ2RhcmVkZXZpbCc6MiwnZGFyaW5nJzoyLCdkYXJrZXN0JzotMiwnZGFya25lc3MnOi0xLCdkYXVudGxlc3MnOjIsJ2RlYWQnOi0zLCdkZWFkbG9jayc6LTIsJ2RlYWZlbmluZyc6LTEsJ2RlYXInOjIsJ2RlYXJseSc6MywnZGVhdGgnOi0yLCdkZWJvbmFpcic6MiwnZGVidCc6LTIsJ2RlY2VpdCc6LTMsJ2RlY2VpdGZ1bCc6LTMsJ2RlY2VpdmUnOi0zLCdkZWNlaXZlZCc6LTMsJ2RlY2VpdmVzJzotMywnZGVjZWl2aW5nJzotMywnZGVjZXB0aW9uJzotMywnZGVjaXNpdmUnOjEsJ2RlZGljYXRlZCc6MiwnZGVmZWF0ZWQnOi0yLCdkZWZlY3QnOi0zLCdkZWZlY3RzJzotMywnZGVmZW5kZXInOjIsJ2RlZmVuZGVycyc6MiwnZGVmZW5zZWxlc3MnOi0yLCdkZWZlcic6LTEsJ2RlZmVycmluZyc6LTEsJ2RlZmlhbnQnOi0xLCdkZWZpY2l0JzotMiwnZGVncmFkZSc6LTIsJ2RlZ3JhZGVkJzotMiwnZGVncmFkZXMnOi0yLCdkZWh1bWFuaXplJzotMiwnZGVodW1hbml6ZWQnOi0yLCdkZWh1bWFuaXplcyc6LTIsJ2RlaHVtYW5pemluZyc6LTIsJ2RlamVjdCc6LTIsJ2RlamVjdGVkJzotMiwnZGVqZWN0aW5nJzotMiwnZGVqZWN0cyc6LTIsJ2RlbGF5JzotMSwnZGVsYXllZCc6LTEsJ2RlbGlnaHQnOjMsJ2RlbGlnaHRlZCc6MywnZGVsaWdodGluZyc6MywnZGVsaWdodHMnOjMsJ2RlbWFuZCc6LTEsJ2RlbWFuZGVkJzotMSwnZGVtYW5kaW5nJzotMSwnZGVtYW5kcyc6LTEsJ2RlbW9uc3RyYXRpb24nOi0xLCdkZW1vcmFsaXplZCc6LTIsJ2RlbmllZCc6LTIsJ2Rlbmllcic6LTIsJ2RlbmllcnMnOi0yLCdkZW5pZXMnOi0yLCdkZW5vdW5jZSc6LTIsJ2Rlbm91bmNlcyc6LTIsJ2RlbnknOi0yLCdkZW55aW5nJzotMiwnZGVwcmVzc2VkJzotMiwnZGVwcmVzc2luZyc6LTIsJ2RlcmFpbCc6LTIsJ2RlcmFpbGVkJzotMiwnZGVyYWlscyc6LTIsJ2RlcmlkZSc6LTIsJ2RlcmlkZWQnOi0yLCdkZXJpZGVzJzotMiwnZGVyaWRpbmcnOi0yLCdkZXJpc2lvbic6LTIsJ2Rlc2lyYWJsZSc6MiwnZGVzaXJlJzoxLCdkZXNpcmVkJzoyLCdkZXNpcm91cyc6MiwnZGVzcGFpcic6LTMsJ2Rlc3BhaXJpbmcnOi0zLCdkZXNwYWlycyc6LTMsJ2Rlc3BlcmF0ZSc6LTMsJ2Rlc3BlcmF0ZWx5JzotMywnZGVzcG9uZGVudCc6LTMsJ2Rlc3Ryb3knOi0zLCdkZXN0cm95ZWQnOi0zLCdkZXN0cm95aW5nJzotMywnZGVzdHJveXMnOi0zLCdkZXN0cnVjdGlvbic6LTMsJ2Rlc3RydWN0aXZlJzotMywnZGV0YWNoZWQnOi0xLCdkZXRhaW4nOi0yLCdkZXRhaW5lZCc6LTIsJ2RldGVudGlvbic6LTIsJ2RldGVybWluZWQnOjIsJ2RldmFzdGF0ZSc6LTIsJ2RldmFzdGF0ZWQnOi0yLCdkZXZhc3RhdGluZyc6LTIsJ2Rldm90ZWQnOjMsJ2RpYW1vbmQnOjEsJ2RpY2snOi00LCdkaWNraGVhZCc6LTQsJ2RpZSc6LTMsJ2RpZWQnOi0zLCdkaWZmaWN1bHQnOi0xLCdkaWZmaWRlbnQnOi0yLCdkaWxlbW1hJzotMSwnZGlwc2hpdCc6LTMsJ2RpcmUnOi0zLCdkaXJlZnVsJzotMywnZGlydCc6LTIsJ2RpcnRpZXInOi0yLCdkaXJ0aWVzdCc6LTIsJ2RpcnR5JzotMiwnZGlzYWJsaW5nJzotMSwnZGlzYWR2YW50YWdlJzotMiwnZGlzYWR2YW50YWdlZCc6LTIsJ2Rpc2FwcGVhcic6LTEsJ2Rpc2FwcGVhcmVkJzotMSwnZGlzYXBwZWFycyc6LTEsJ2Rpc2FwcG9pbnQnOi0yLCdkaXNhcHBvaW50ZWQnOi0yLCdkaXNhcHBvaW50aW5nJzotMiwnZGlzYXBwb2ludG1lbnQnOi0yLCdkaXNhcHBvaW50bWVudHMnOi0yLCdkaXNhcHBvaW50cyc6LTIsJ2Rpc2FzdGVyJzotMiwnZGlzYXN0ZXJzJzotMiwnZGlzYXN0cm91cyc6LTMsJ2Rpc2JlbGlldmUnOi0yLCdkaXNjYXJkJzotMSwnZGlzY2FyZGVkJzotMSwnZGlzY2FyZGluZyc6LTEsJ2Rpc2NhcmRzJzotMSwnZGlzY29uc29sYXRlJzotMiwnZGlzY29uc29sYXRpb24nOi0yLCdkaXNjb250ZW50ZWQnOi0yLCdkaXNjb3JkJzotMiwnZGlzY291bnRlZCc6LTEsJ2Rpc2NvdXJhZ2VkJzotMiwnZGlzY3JlZGl0ZWQnOi0yLCdkaXNkYWluJzotMiwnZGlzZ3JhY2UnOi0yLCdkaXNncmFjZWQnOi0yLCdkaXNndWlzZSc6LTEsJ2Rpc2d1aXNlZCc6LTEsJ2Rpc2d1aXNlcyc6LTEsJ2Rpc2d1aXNpbmcnOi0xLCdkaXNndXN0JzotMywnZGlzZ3VzdGVkJzotMywnZGlzZ3VzdGluZyc6LTMsJ2Rpc2hlYXJ0ZW5lZCc6LTIsJ2Rpc2hvbmVzdCc6LTIsJ2Rpc2lsbHVzaW9uZWQnOi0yLCdkaXNpbmNsaW5lZCc6LTIsJ2Rpc2pvaW50ZWQnOi0yLCdkaXNsaWtlJzotMiwnZGlzbWFsJzotMiwnZGlzbWF5ZWQnOi0yLCdkaXNvcmRlcic6LTIsJ2Rpc29yZ2FuaXplZCc6LTIsJ2Rpc29yaWVudGVkJzotMiwnZGlzcGFyYWdlJzotMiwnZGlzcGFyYWdlZCc6LTIsJ2Rpc3BhcmFnZXMnOi0yLCdkaXNwYXJhZ2luZyc6LTIsJ2Rpc3BsZWFzZWQnOi0yLCdkaXNwdXRlJzotMiwnZGlzcHV0ZWQnOi0yLCdkaXNwdXRlcyc6LTIsJ2Rpc3B1dGluZyc6LTIsJ2Rpc3F1YWxpZmllZCc6LTIsJ2Rpc3F1aWV0JzotMiwnZGlzcmVnYXJkJzotMiwnZGlzcmVnYXJkZWQnOi0yLCdkaXNyZWdhcmRpbmcnOi0yLCdkaXNyZWdhcmRzJzotMiwnZGlzcmVzcGVjdCc6LTIsJ2Rpc3Jlc3BlY3RlZCc6LTIsJ2Rpc3J1cHRpb24nOi0yLCdkaXNydXB0aW9ucyc6LTIsJ2Rpc3J1cHRpdmUnOi0yLCdkaXNzYXRpc2ZpZWQnOi0yLCdkaXN0b3J0JzotMiwnZGlzdG9ydGVkJzotMiwnZGlzdG9ydGluZyc6LTIsJ2Rpc3RvcnRzJzotMiwnZGlzdHJhY3QnOi0yLCdkaXN0cmFjdGVkJzotMiwnZGlzdHJhY3Rpb24nOi0yLCdkaXN0cmFjdHMnOi0yLCdkaXN0cmVzcyc6LTIsJ2Rpc3RyZXNzZWQnOi0yLCdkaXN0cmVzc2VzJzotMiwnZGlzdHJlc3NpbmcnOi0yLCdkaXN0cnVzdCc6LTMsJ2Rpc3RydXN0ZnVsJzotMywnZGlzdHVyYic6LTIsJ2Rpc3R1cmJlZCc6LTIsJ2Rpc3R1cmJpbmcnOi0yLCdkaXN0dXJicyc6LTIsJ2RpdGhlcmluZyc6LTIsJ2Rpenp5JzotMSwnZG9kZ2luZyc6LTIsJ2RvZGd5JzotMiwnZG9lcyBub3Qgd29yayc6LTMsJ2RvbG9yb3VzJzotMiwnZG9udCBsaWtlJzotMiwnZG9vbSc6LTIsJ2Rvb21lZCc6LTIsJ2RvdWJ0JzotMSwnZG91YnRlZCc6LTEsJ2RvdWJ0ZnVsJzotMSwnZG91YnRpbmcnOi0xLCdkb3VidHMnOi0xLCdkb3VjaGUnOi0zLCdkb3VjaGViYWcnOi0zLCdkb3duY2FzdCc6LTIsJ2Rvd25oZWFydGVkJzotMiwnZG93bnNpZGUnOi0yLCdkcmFnJzotMSwnZHJhZ2dlZCc6LTEsJ2RyYWdzJzotMSwnZHJhaW5lZCc6LTIsJ2RyZWFkJzotMiwnZHJlYWRlZCc6LTIsJ2RyZWFkZnVsJzotMywnZHJlYWRpbmcnOi0yLCdkcmVhbSc6MSwnZHJlYW1zJzoxLCdkcmVhcnknOi0yLCdkcm9vcHknOi0yLCdkcm9wJzotMSwnZHJvd24nOi0yLCdkcm93bmVkJzotMiwnZHJvd25zJzotMiwnZHJ1bmsnOi0yLCdkdWJpb3VzJzotMiwnZHVkJzotMiwnZHVsbCc6LTIsJ2R1bWInOi0zLCdkdW1iYXNzJzotMywnZHVtcCc6LTEsJ2R1bXBlZCc6LTIsJ2R1bXBzJzotMSwnZHVwZSc6LTIsJ2R1cGVkJzotMiwnZHlzZnVuY3Rpb24nOi0yLCdlYWdlcic6MiwnZWFybmVzdCc6MiwnZWFzZSc6MiwnZWFzeSc6MSwnZWNzdGF0aWMnOjQsJ2VlcmllJzotMiwnZWVyeSc6LTIsJ2VmZmVjdGl2ZSc6MiwnZWZmZWN0aXZlbHknOjIsJ2VsYXRlZCc6MywnZWxhdGlvbic6MywnZWxlZ2FudCc6MiwnZWxlZ2FudGx5JzoyLCdlbWJhcnJhc3MnOi0yLCdlbWJhcnJhc3NlZCc6LTIsJ2VtYmFycmFzc2VzJzotMiwnZW1iYXJyYXNzaW5nJzotMiwnZW1iYXJyYXNzbWVudCc6LTIsJ2VtYml0dGVyZWQnOi0yLCdlbWJyYWNlJzoxLCdlbWVyZ2VuY3knOi0yLCdlbXBhdGhldGljJzoyLCdlbXB0aW5lc3MnOi0xLCdlbXB0eSc6LTEsJ2VuY2hhbnRlZCc6MiwnZW5jb3VyYWdlJzoyLCdlbmNvdXJhZ2VkJzoyLCdlbmNvdXJhZ2VtZW50JzoyLCdlbmNvdXJhZ2VzJzoyLCdlbmRvcnNlJzoyLCdlbmRvcnNlZCc6MiwnZW5kb3JzZW1lbnQnOjIsJ2VuZG9yc2VzJzoyLCdlbmVtaWVzJzotMiwnZW5lbXknOi0yLCdlbmVyZ2V0aWMnOjIsJ2VuZ2FnZSc6MSwnZW5nYWdlcyc6MSwnZW5ncm9zc2VkJzoxLCdlbmpveSc6MiwnZW5qb3lpbmcnOjIsJ2Vuam95cyc6MiwnZW5saWdodGVuJzoyLCdlbmxpZ2h0ZW5lZCc6MiwnZW5saWdodGVuaW5nJzoyLCdlbmxpZ2h0ZW5zJzoyLCdlbm51aSc6LTIsJ2VucmFnZSc6LTIsJ2VucmFnZWQnOi0yLCdlbnJhZ2VzJzotMiwnZW5yYWdpbmcnOi0yLCdlbnJhcHR1cmUnOjMsJ2Vuc2xhdmUnOi0yLCdlbnNsYXZlZCc6LTIsJ2Vuc2xhdmVzJzotMiwnZW5zdXJlJzoxLCdlbnN1cmluZyc6MSwnZW50ZXJwcmlzaW5nJzoxLCdlbnRlcnRhaW5pbmcnOjIsJ2VudGhyYWwnOjMsJ2VudGh1c2lhc3RpYyc6MywnZW50aXRsZWQnOjEsJ2VudHJ1c3RlZCc6MiwnZW52aWVzJzotMSwnZW52aW91cyc6LTIsJ2VudnknOi0xLCdlbnZ5aW5nJzotMSwnZXJyb25lb3VzJzotMiwnZXJyb3InOi0yLCdlcnJvcnMnOi0yLCdlc2NhcGUnOi0xLCdlc2NhcGVzJzotMSwnZXNjYXBpbmcnOi0xLCdlc3RlZW1lZCc6MiwnZXRoaWNhbCc6MiwnZXVwaG9yaWEnOjMsJ2V1cGhvcmljJzo0LCdldmljdGlvbic6LTEsJ2V2aWwnOi0zLCdleGFnZ2VyYXRlJzotMiwnZXhhZ2dlcmF0ZWQnOi0yLCdleGFnZ2VyYXRlcyc6LTIsJ2V4YWdnZXJhdGluZyc6LTIsJ2V4YXNwZXJhdGVkJzoyLCdleGNlbGxlbmNlJzozLCdleGNlbGxlbnQnOjMsJ2V4Y2l0ZSc6MywnZXhjaXRlZCc6MywnZXhjaXRlbWVudCc6MywnZXhjaXRpbmcnOjMsJ2V4Y2x1ZGUnOi0xLCdleGNsdWRlZCc6LTIsJ2V4Y2x1c2lvbic6LTEsJ2V4Y2x1c2l2ZSc6MiwnZXhjdXNlJzotMSwnZXhlbXB0JzotMSwnZXhoYXVzdGVkJzotMiwnZXhoaWxhcmF0ZWQnOjMsJ2V4aGlsYXJhdGVzJzozLCdleGhpbGFyYXRpbmcnOjMsJ2V4b25lcmF0ZSc6MiwnZXhvbmVyYXRlZCc6MiwnZXhvbmVyYXRlcyc6MiwnZXhvbmVyYXRpbmcnOjIsJ2V4cGFuZCc6MSwnZXhwYW5kcyc6MSwnZXhwZWwnOi0yLCdleHBlbGxlZCc6LTIsJ2V4cGVsbGluZyc6LTIsJ2V4cGVscyc6LTIsJ2V4cGxvaXQnOi0yLCdleHBsb2l0ZWQnOi0yLCdleHBsb2l0aW5nJzotMiwnZXhwbG9pdHMnOi0yLCdleHBsb3JhdGlvbic6MSwnZXhwbG9yYXRpb25zJzoxLCdleHBvc2UnOi0xLCdleHBvc2VkJzotMSwnZXhwb3Nlcyc6LTEsJ2V4cG9zaW5nJzotMSwnZXh0ZW5kJzoxLCdleHRlbmRzJzoxLCdleHViZXJhbnQnOjQsJ2V4dWx0YW50JzozLCdleHVsdGFudGx5JzozLCdmYWJ1bG91cyc6NCwnZmFkJzotMiwnZmFnJzotMywnZmFnZ290JzotMywnZmFnZ290cyc6LTMsJ2ZhaWwnOi0yLCdmYWlsZWQnOi0yLCdmYWlsaW5nJzotMiwnZmFpbHMnOi0yLCdmYWlsdXJlJzotMiwnZmFpbHVyZXMnOi0yLCdmYWludGhlYXJ0ZWQnOi0yLCdmYWlyJzoyLCdmYWl0aCc6MSwnZmFpdGhmdWwnOjMsJ2Zha2UnOi0zLCdmYWtlcyc6LTMsJ2Zha2luZyc6LTMsJ2ZhbGxlbic6LTIsJ2ZhbGxpbmcnOi0xLCdmYWxzaWZpZWQnOi0zLCdmYWxzaWZ5JzotMywnZmFtZSc6MSwnZmFuJzozLCdmYW50YXN0aWMnOjQsJ2ZhcmNlJzotMSwnZmFzY2luYXRlJzozLCdmYXNjaW5hdGVkJzozLCdmYXNjaW5hdGVzJzozLCdmYXNjaW5hdGluZyc6MywnZmFzY2lzdCc6LTIsJ2Zhc2Npc3RzJzotMiwnZmF0YWxpdGllcyc6LTMsJ2ZhdGFsaXR5JzotMywnZmF0aWd1ZSc6LTIsJ2ZhdGlndWVkJzotMiwnZmF0aWd1ZXMnOi0yLCdmYXRpZ3VpbmcnOi0yLCdmYXZvcic6MiwnZmF2b3JlZCc6MiwnZmF2b3JpdGUnOjIsJ2Zhdm9yaXRlZCc6MiwnZmF2b3JpdGVzJzoyLCdmYXZvcnMnOjIsJ2ZlYXInOi0yLCdmZWFyZnVsJzotMiwnZmVhcmluZyc6LTIsJ2ZlYXJsZXNzJzoyLCdmZWFyc29tZSc6LTIsJ2ZlZCB1cCc6LTMsJ2ZlZWJsZSc6LTIsJ2ZlZWxpbmcnOjEsJ2ZlbG9uaWVzJzotMywnZmVsb255JzotMywnZmVydmVudCc6MiwnZmVydmlkJzoyLCdmZXN0aXZlJzoyLCdmaWFzY28nOi0zLCdmaWRnZXR5JzotMiwnZmlnaHQnOi0xLCdmaW5lJzoyLCdmaXJlJzotMiwnZmlyZWQnOi0yLCdmaXJpbmcnOi0yLCdmaXQnOjEsJ2ZpdG5lc3MnOjEsJ2ZsYWdzaGlwJzoyLCdmbGVlcyc6LTEsJ2Zsb3AnOi0yLCdmbG9wcyc6LTIsJ2ZsdSc6LTIsJ2ZsdXN0ZXJlZCc6LTIsJ2ZvY3VzZWQnOjIsJ2ZvbmQnOjIsJ2ZvbmRuZXNzJzoyLCdmb29sJzotMiwnZm9vbGlzaCc6LTIsJ2Zvb2xzJzotMiwnZm9yY2VkJzotMSwnZm9yZWNsb3N1cmUnOi0yLCdmb3JlY2xvc3VyZXMnOi0yLCdmb3JnZXQnOi0xLCdmb3JnZXRmdWwnOi0yLCdmb3JnaXZlJzoxLCdmb3JnaXZpbmcnOjEsJ2ZvcmdvdHRlbic6LTEsJ2ZvcnR1bmF0ZSc6MiwnZnJhbnRpYyc6LTEsJ2ZyYXVkJzotNCwnZnJhdWRzJzotNCwnZnJhdWRzdGVyJzotNCwnZnJhdWRzdGVycyc6LTQsJ2ZyYXVkdWxlbmNlJzotNCwnZnJhdWR1bGVudCc6LTQsJ2ZyZWUnOjEsJ2ZyZWVkb20nOjIsJ2ZyZW56eSc6LTMsJ2ZyZXNoJzoxLCdmcmllbmRseSc6MiwnZnJpZ2h0JzotMiwnZnJpZ2h0ZW5lZCc6LTIsJ2ZyaWdodGVuaW5nJzotMywnZnJpa2luJzotMiwnZnJpc2t5JzoyLCdmcm93bmluZyc6LTEsJ2ZydXN0cmF0ZSc6LTIsJ2ZydXN0cmF0ZWQnOi0yLCdmcnVzdHJhdGVzJzotMiwnZnJ1c3RyYXRpbmcnOi0yLCdmcnVzdHJhdGlvbic6LTIsJ2Z0dyc6MywnZnVjayc6LTQsJ2Z1Y2tlZCc6LTEwLCdmdWNrZXInOi00LCdmdWNrZXJzJzotNCwnZnVja2ZhY2UnOi00LCdmdWNraGVhZCc6LTQsJ2Z1Y2t0YXJkJzotNCwnZnVkJzotMywnZnVrZWQnOi00LCdmdWtpbmcnOi00LCdmdWxmaWxsJzoyLCdmdWxmaWxsZWQnOjIsJ2Z1bGZpbGxzJzoyLCdmdW1pbmcnOi0yLCdmdW4nOjQsJ2Z1bmVyYWwnOi0xLCdmdW5lcmFscyc6LTEsJ2Z1bmt5JzoyLCdmdW5uaWVyJzo0LCdmdW5ueSc6NCwnZnVyaW91cyc6LTMsJ2Z1dGlsZSc6MiwnZ2FnJzotMiwnZ2FnZ2VkJzotMiwnZ2Fpbic6MiwnZ2FpbmVkJzoyLCdnYWluaW5nJzoyLCdnYWlucyc6MiwnZ2FsbGFudCc6MywnZ2FsbGFudGx5JzozLCdnYWxsYW50cnknOjMsJ2dlbmVyb3VzJzoyLCdnZW5pYWwnOjMsJ2dob3N0JzotMSwnZ2lkZHknOi0yLCdnaWZ0JzoyLCdnbGFkJzozLCdnbGFtb3JvdXMnOjMsJ2dsYW1vdXJvdXMnOjMsJ2dsZWUnOjMsJ2dsZWVmdWwnOjMsJ2dsb29tJzotMSwnZ2xvb215JzotMiwnZ2xvcmlvdXMnOjIsJ2dsb3J5JzoyLCdnbHVtJzotMiwnZ29kJzoxLCdnb2RkYW1uJzotMywnZ29kc2VuZCc6NCwnZ29vZCc6MywnZ29vZG5lc3MnOjMsJ2dyYWNlJzoxLCdncmFjaW91cyc6MywnZ3JhbmQnOjMsJ2dyYW50JzoxLCdncmFudGVkJzoxLCdncmFudGluZyc6MSwnZ3JhbnRzJzoxLCdncmF0ZWZ1bCc6MywnZ3JhdGlmaWNhdGlvbic6MiwnZ3JhdmUnOi0yLCdncmF5JzotMSwnZ3JlYXQnOjMsJ2dyZWF0ZXInOjMsJ2dyZWF0ZXN0JzozLCdncmVlZCc6LTMsJ2dyZWVkeSc6LTIsJ2dyZWVuIHdhc2gnOi0zLCdncmVlbiB3YXNoaW5nJzotMywnZ3JlZW53YXNoJzotMywnZ3JlZW53YXNoZXInOi0zLCdncmVlbndhc2hlcnMnOi0zLCdncmVlbndhc2hpbmcnOi0zLCdncmVldCc6MSwnZ3JlZXRlZCc6MSwnZ3JlZXRpbmcnOjEsJ2dyZWV0aW5ncyc6MiwnZ3JlZXRzJzoxLCdncmV5JzotMSwnZ3JpZWYnOi0yLCdncmlldmVkJzotMiwnZ3Jvc3MnOi0yLCdncm93aW5nJzoxLCdncm93dGgnOjIsJ2d1YXJhbnRlZSc6MSwnZ3VpbHQnOi0zLCdndWlsdHknOi0zLCdndWxsaWJpbGl0eSc6LTIsJ2d1bGxpYmxlJzotMiwnZ3VuJzotMSwnaGEnOjIsJ2hhY2tlZCc6LTEsJ2hhaGEnOjMsJ2hhaGFoYSc6MywnaGFoYWhhaCc6MywnaGFpbCc6MiwnaGFpbGVkJzoyLCdoYXBsZXNzJzotMiwnaGFwbGVzc25lc3MnOi0yLCdoYXBwaW5lc3MnOjMsJ2hhcHB5JzozLCdoYXJkJzotMSwnaGFyZGllcic6MiwnaGFyZHNoaXAnOi0yLCdoYXJkeSc6MiwnaGFybSc6LTIsJ2hhcm1lZCc6LTIsJ2hhcm1mdWwnOi0yLCdoYXJtaW5nJzotMiwnaGFybXMnOi0yLCdoYXJyaWVkJzotMiwnaGFyc2gnOi0yLCdoYXJzaGVyJzotMiwnaGFyc2hlc3QnOi0yLCdoYXRlJzotMywnaGF0ZWQnOi0zLCdoYXRlcnMnOi0zLCdoYXRlcyc6LTMsJ2hhdGluZyc6LTMsJ2hhdW50JzotMSwnaGF1bnRlZCc6LTIsJ2hhdW50aW5nJzoxLCdoYXVudHMnOi0xLCdoYXZvYyc6LTIsJ2hlYWx0aHknOjIsJ2hlYXJ0YnJlYWtpbmcnOi0zLCdoZWFydGJyb2tlbic6LTMsJ2hlYXJ0ZmVsdCc6MywnaGVhdmVuJzoyLCdoZWF2ZW5seSc6NCwnaGVhdnloZWFydGVkJzotMiwnaGVsbCc6LTQsJ2hlbHAnOjIsJ2hlbHBmdWwnOjIsJ2hlbHBpbmcnOjIsJ2hlbHBsZXNzJzotMiwnaGVscHMnOjIsJ2hlcm8nOjIsJ2hlcm9lcyc6MiwnaGVyb2ljJzozLCdoZXNpdGFudCc6LTIsJ2hlc2l0YXRlJzotMiwnaGlkJzotMSwnaGlkZSc6LTEsJ2hpZGVzJzotMSwnaGlkaW5nJzotMSwnaGlnaGxpZ2h0JzoyLCdoaWxhcmlvdXMnOjIsJ2hpbmRyYW5jZSc6LTIsJ2hvYXgnOi0yLCdob21lc2ljayc6LTIsJ2hvbmVzdCc6MiwnaG9ub3InOjIsJ2hvbm9yZWQnOjIsJ2hvbm9yaW5nJzoyLCdob25vdXInOjIsJ2hvbm91cmVkJzoyLCdob25vdXJpbmcnOjIsJ2hvb2xpZ2FuJzotMiwnaG9vbGlnYW5pc20nOi0yLCdob29saWdhbnMnOi0yLCdob3BlJzoyLCdob3BlZnVsJzoyLCdob3BlZnVsbHknOjIsJ2hvcGVsZXNzJzotMiwnaG9wZWxlc3NuZXNzJzotMiwnaG9wZXMnOjIsJ2hvcGluZyc6MiwnaG9ycmVuZG91cyc6LTMsJ2hvcnJpYmxlJzotMywnaG9ycmlmaWMnOi0zLCdob3JyaWZpZWQnOi0zLCdob3N0aWxlJzotMiwnaHVja3N0ZXInOi0yLCdodWcnOjIsJ2h1Z2UnOjEsJ2h1Z3MnOjIsJ2h1bWVyb3VzJzozLCdodW1pbGlhdGVkJzotMywnaHVtaWxpYXRpb24nOi0zLCdodW1vcic6MiwnaHVtb3JvdXMnOjIsJ2h1bW91cic6MiwnaHVtb3Vyb3VzJzoyLCdodW5nZXInOi0yLCdodXJyYWgnOjUsJ2h1cnQnOi0yLCdodXJ0aW5nJzotMiwnaHVydHMnOi0yLCdoeXBvY3JpdGljYWwnOi0yLCdoeXN0ZXJpYSc6LTMsJ2h5c3RlcmljYWwnOi0zLCdoeXN0ZXJpY3MnOi0zLCdpZGlvdCc6LTMsJ2lkaW90aWMnOi0zLCdpZ25vcmFuY2UnOi0yLCdpZ25vcmFudCc6LTIsJ2lnbm9yZSc6LTEsJ2lnbm9yZWQnOi0yLCdpZ25vcmVzJzotMSwnaWxsJzotMiwnaWxsZWdhbCc6LTMsJ2lsbGl0ZXJhY3knOi0yLCdpbGxuZXNzJzotMiwnaWxsbmVzc2VzJzotMiwnaW1iZWNpbGUnOi0zLCdpbW1vYmlsaXplZCc6LTEsJ2ltbW9ydGFsJzoyLCdpbW11bmUnOjEsJ2ltcGF0aWVudCc6LTIsJ2ltcGVyZmVjdCc6LTIsJ2ltcG9ydGFuY2UnOjIsJ2ltcG9ydGFudCc6MiwnaW1wb3NlJzotMSwnaW1wb3NlZCc6LTEsJ2ltcG9zZXMnOi0xLCdpbXBvc2luZyc6LTEsJ2ltcG90ZW50JzotMiwnaW1wcmVzcyc6MywnaW1wcmVzc2VkJzozLCdpbXByZXNzZXMnOjMsJ2ltcHJlc3NpdmUnOjMsJ2ltcHJpc29uZWQnOi0yLCdpbXByb3ZlJzoyLCdpbXByb3ZlZCc6MiwnaW1wcm92ZW1lbnQnOjIsJ2ltcHJvdmVzJzoyLCdpbXByb3ZpbmcnOjIsJ2luYWJpbGl0eSc6LTIsJ2luYWN0aW9uJzotMiwnaW5hZGVxdWF0ZSc6LTIsJ2luY2FwYWJsZSc6LTIsJ2luY2FwYWNpdGF0ZWQnOi0yLCdpbmNlbnNlZCc6LTIsJ2luY29tcGV0ZW5jZSc6LTIsJ2luY29tcGV0ZW50JzotMiwnaW5jb25zaWRlcmF0ZSc6LTIsJ2luY29udmVuaWVuY2UnOi0yLCdpbmNvbnZlbmllbnQnOi0yLCdpbmNyZWFzZSc6MSwnaW5jcmVhc2VkJzoxLCdpbmRlY2lzaXZlJzotMiwnaW5kZXN0cnVjdGlibGUnOjIsJ2luZGlmZmVyZW5jZSc6LTIsJ2luZGlmZmVyZW50JzotMiwnaW5kaWduYW50JzotMiwnaW5kaWduYXRpb24nOi0yLCdpbmRvY3RyaW5hdGUnOi0yLCdpbmRvY3RyaW5hdGVkJzotMiwnaW5kb2N0cmluYXRlcyc6LTIsJ2luZG9jdHJpbmF0aW5nJzotMiwnaW5lZmZlY3RpdmUnOi0yLCdpbmVmZmVjdGl2ZWx5JzotMiwnaW5mYXR1YXRlZCc6MiwnaW5mYXR1YXRpb24nOjIsJ2luZmVjdGVkJzotMiwnaW5mZXJpb3InOi0yLCdpbmZsYW1lZCc6LTIsJ2luZmx1ZW50aWFsJzoyLCdpbmZyaW5nZW1lbnQnOi0yLCdpbmZ1cmlhdGUnOi0yLCdpbmZ1cmlhdGVkJzotMiwnaW5mdXJpYXRlcyc6LTIsJ2luZnVyaWF0aW5nJzotMiwnaW5oaWJpdCc6LTEsJ2luanVyZWQnOi0yLCdpbmp1cnknOi0yLCdpbmp1c3RpY2UnOi0yLCdpbm5vdmF0ZSc6MSwnaW5ub3ZhdGVzJzoxLCdpbm5vdmF0aW9uJzoxLCdpbm5vdmF0aXZlJzoyLCdpbnF1aXNpdGlvbic6LTIsJ2lucXVpc2l0aXZlJzoyLCdpbnNhbmUnOi0yLCdpbnNhbml0eSc6LTIsJ2luc2VjdXJlJzotMiwnaW5zZW5zaXRpdmUnOi0yLCdpbnNlbnNpdGl2aXR5JzotMiwnaW5zaWduaWZpY2FudCc6LTIsJ2luc2lwaWQnOi0yLCdpbnNwaXJhdGlvbic6MiwnaW5zcGlyYXRpb25hbCc6MiwnaW5zcGlyZSc6MiwnaW5zcGlyZWQnOjIsJ2luc3BpcmVzJzoyLCdpbnNwaXJpbmcnOjMsJ2luc3VsdCc6LTIsJ2luc3VsdGVkJzotMiwnaW5zdWx0aW5nJzotMiwnaW5zdWx0cyc6LTIsJ2ludGFjdCc6MiwnaW50ZWdyaXR5JzoyLCdpbnRlbGxpZ2VudCc6MiwnaW50ZW5zZSc6MSwnaW50ZXJlc3QnOjEsJ2ludGVyZXN0ZWQnOjIsJ2ludGVyZXN0aW5nJzoyLCdpbnRlcmVzdHMnOjEsJ2ludGVycm9nYXRlZCc6LTIsJ2ludGVycnVwdCc6LTIsJ2ludGVycnVwdGVkJzotMiwnaW50ZXJydXB0aW5nJzotMiwnaW50ZXJydXB0aW9uJzotMiwnaW50ZXJydXB0cyc6LTIsJ2ludGltaWRhdGUnOi0yLCdpbnRpbWlkYXRlZCc6LTIsJ2ludGltaWRhdGVzJzotMiwnaW50aW1pZGF0aW5nJzotMiwnaW50aW1pZGF0aW9uJzotMiwnaW50cmljYXRlJzoyLCdpbnRyaWd1ZXMnOjEsJ2ludmluY2libGUnOjIsJ2ludml0ZSc6MSwnaW52aXRpbmcnOjEsJ2ludnVsbmVyYWJsZSc6MiwnaXJhdGUnOi0zLCdpcm9uaWMnOi0xLCdpcm9ueSc6LTEsJ2lycmF0aW9uYWwnOi0xLCdpcnJlc2lzdGlibGUnOjIsJ2lycmVzb2x1dGUnOi0yLCdpcnJlc3BvbnNpYmxlJzoyLCdpcnJldmVyc2libGUnOi0xLCdpcnJpdGF0ZSc6LTMsJ2lycml0YXRlZCc6LTMsJ2lycml0YXRpbmcnOi0zLCdpc29sYXRlZCc6LTEsJ2l0Y2h5JzotMiwnamFja2Fzcyc6LTQsJ2phY2thc3Nlcyc6LTQsJ2phaWxlZCc6LTIsJ2phdW50eSc6MiwnamVhbG91cyc6LTIsJ2plb3BhcmR5JzotMiwnamVyayc6LTMsJ2plc3VzJzoxLCdqZXdlbCc6MSwnamV3ZWxzJzoxLCdqb2N1bGFyJzoyLCdqb2luJzoxLCdqb2tlJzoyLCdqb2tlcyc6Miwnam9sbHknOjIsJ2pvdmlhbCc6Miwnam95JzozLCdqb3lmdWwnOjMsJ2pveWZ1bGx5JzozLCdqb3lsZXNzJzotMiwnam95b3VzJzozLCdqdWJpbGFudCc6MywnanVtcHknOi0xLCdqdXN0aWNlJzoyLCdqdXN0aWZpYWJseSc6MiwnanVzdGlmaWVkJzoyLCdrZWVuJzoxLCdraWxsJzotMywna2lsbGVkJzotMywna2lsbGluZyc6LTMsJ2tpbGxzJzotMywna2luZCc6Miwna2luZGVyJzoyLCdraXNzJzoyLCdrdWRvcyc6MywnbGFjayc6LTIsJ2xhY2thZGFpc2ljYWwnOi0yLCdsYWcnOi0xLCdsYWdnZWQnOi0yLCdsYWdnaW5nJzotMiwnbGFncyc6LTIsJ2xhbWUnOi0yLCdsYW5kbWFyayc6MiwnbGF1Z2gnOjEsJ2xhdWdoZWQnOjEsJ2xhdWdoaW5nJzoxLCdsYXVnaHMnOjEsJ2xhdWdodGluZyc6MSwnbGF1bmNoZWQnOjEsJ2xhd2wnOjMsJ2xhd3N1aXQnOi0yLCdsYXdzdWl0cyc6LTIsJ2xhenknOi0xLCdsZWFrJzotMSwnbGVha2VkJzotMSwnbGVhdmUnOi0xLCdsZWdhbCc6MSwnbGVnYWxseSc6MSwnbGVuaWVudCc6MSwnbGV0aGFyZ2ljJzotMiwnbGV0aGFyZ3knOi0yLCdsaWFyJzotMywnbGlhcnMnOi0zLCdsaWJlbG91cyc6LTIsJ2xpZWQnOi0yLCdsaWZlc2F2ZXInOjQsJ2xpZ2h0aGVhcnRlZCc6MSwnbGlrZSc6MiwnbGlrZWQnOjIsJ2xpa2VzJzoyLCdsaW1pdGF0aW9uJzotMSwnbGltaXRlZCc6LTEsJ2xpbWl0cyc6LTEsJ2xpdGlnYXRpb24nOi0xLCdsaXRpZ2lvdXMnOi0yLCdsaXZlbHknOjIsJ2xpdmlkJzotMiwnbG1hbyc6NCwnbG1mYW8nOjQsJ2xvYXRoZSc6LTMsJ2xvYXRoZWQnOi0zLCdsb2F0aGVzJzotMywnbG9hdGhpbmcnOi0zLCdsb2JieSc6LTIsJ2xvYmJ5aW5nJzotMiwnbG9sJzozLCdsb25lbHknOi0yLCdsb25lc29tZSc6LTIsICdsb25nJzotMywgJ2xvbmdlcic6IC0zLCAnbG9uZ2luZyc6LTEsJ2xvb20nOi0xLCdsb29tZWQnOi0xLCdsb29taW5nJzotMSwnbG9vbXMnOi0xLCdsb29zZSc6LTMsJ2xvb3Nlcyc6LTMsJ2xvc2VyJzotMywnbG9zaW5nJzotMywnbG9zcyc6LTMsJ2xvc3QnOi0zLCdsb3ZhYmxlJzozLCdsb3ZlJzozLCdsb3ZlZCc6MywnbG92ZWxpZXMnOjMsJ2xvdmVseSc6MywnbG92aW5nJzoyLCdsb3dlc3QnOi0xLCdsb3lhbCc6MywnbG95YWx0eSc6MywnbHVjayc6MywnbHVja2lseSc6MywnbHVja3knOjMsJ2x1Z3VicmlvdXMnOi0yLCdsdW5hdGljJzotMywnbHVuYXRpY3MnOi0zLCdsdXJrJzotMSwnbHVya2luZyc6LTEsJ2x1cmtzJzotMSwnbWFkJzotMywnbWFkZGVuaW5nJzotMywnbWFkZS11cCc6LTEsJ21hZGx5JzotMywnbWFkbmVzcyc6LTMsJ21hbmRhdG9yeSc6LTEsJ21hbmlwdWxhdGVkJzotMSwnbWFuaXB1bGF0aW5nJzotMSwnbWFuaXB1bGF0aW9uJzotMSwnbWFydmVsJzozLCdtYXJ2ZWxvdXMnOjMsJ21hcnZlbHMnOjMsJ21hc3RlcnBpZWNlJzo0LCdtYXN0ZXJwaWVjZXMnOjQsJ21hdHRlcic6MSwnbWF0dGVycyc6MSwnbWF0dXJlJzoyLCdtZWFuaW5nZnVsJzoyLCdtZWFuaW5nbGVzcyc6LTIsJ21lZGFsJzozLCdtZWRpb2NyaXR5JzotMywnbWVkaXRhdGl2ZSc6MSwnbWVsYW5jaG9seSc6LTIsJ21lbmFjZSc6LTIsJ21lbmFjZWQnOi0yLCdtZXJjeSc6MiwnbWVycnknOjMsJ21lc3MnOi0yLCdtZXNzZWQnOi0yLCdtZXNzaW5nIHVwJzotMiwnbWV0aG9kaWNhbCc6MiwnbWluZGxlc3MnOi0yLCdtaXJhY2xlJzo0LCdtaXJ0aCc6MywnbWlydGhmdWwnOjMsJ21pcnRoZnVsbHknOjMsJ21pc2JlaGF2ZSc6LTIsJ21pc2JlaGF2ZWQnOi0yLCdtaXNiZWhhdmVzJzotMiwnbWlzYmVoYXZpbmcnOi0yLCdtaXNjaGllZic6LTEsJ21pc2NoaWVmcyc6LTEsJ21pc2VyYWJsZSc6LTMsJ21pc2VyeSc6LTIsJ21pc2dpdmluZyc6LTIsJ21pc2luZm9ybWF0aW9uJzotMiwnbWlzaW5mb3JtZWQnOi0yLCdtaXNpbnRlcnByZXRlZCc6LTIsJ21pc2xlYWRpbmcnOi0zLCdtaXNyZWFkJzotMSwnbWlzcmVwb3J0aW5nJzotMiwnbWlzcmVwcmVzZW50YXRpb24nOi0yLCdtaXNzJzotMiwnbWlzc2VkJzotMiwnbWlzc2luZyc6LTIsJ21pc3Rha2UnOi0yLCdtaXN0YWtlbic6LTIsJ21pc3Rha2VzJzotMiwnbWlzdGFraW5nJzotMiwnbWlzdW5kZXJzdGFuZCc6LTIsJ21pc3VuZGVyc3RhbmRpbmcnOi0yLCdtaXN1bmRlcnN0YW5kcyc6LTIsJ21pc3VuZGVyc3Rvb2QnOi0yLCdtb2FuJzotMiwnbW9hbmVkJzotMiwnbW9hbmluZyc6LTIsJ21vYW5zJzotMiwnbW9jayc6LTIsJ21vY2tlZCc6LTIsJ21vY2tpbmcnOi0yLCdtb2Nrcyc6LTIsJ21vbmdlcmluZyc6LTIsJ21vbm9wb2xpemUnOi0yLCdtb25vcG9saXplZCc6LTIsJ21vbm9wb2xpemVzJzotMiwnbW9ub3BvbGl6aW5nJzotMiwnbW9vZHknOi0xLCdtb3BlJzotMSwnbW9waW5nJzotMSwnbW9yb24nOi0zLCdtb3RoZXJmdWNrZXInOi01LCdtb3RoZXJmdWNraW5nJzotNSwnbW90aXZhdGUnOjEsJ21vdGl2YXRlZCc6MiwnbW90aXZhdGluZyc6MiwnbW90aXZhdGlvbic6MSwnbW91cm4nOi0yLCdtb3VybmVkJzotMiwnbW91cm5mdWwnOi0yLCdtb3VybmluZyc6LTIsJ21vdXJucyc6LTIsJ211bXBpc2gnOi0yLCdtdXJkZXInOi0yLCdtdXJkZXJlcic6LTIsJ211cmRlcmluZyc6LTMsJ211cmRlcm91cyc6LTMsJ211cmRlcnMnOi0yLCdteXRoJzotMSwnbjAwYic6LTIsJ25haXZlJzotMiwnbmFzdHknOi0zLCduYXR1cmFsJzoxLCduYcOvdmUnOi0yLCAnbmVlZCc6IC0xLCAnbmVlZHknOi0yLCduZWdhdGl2ZSc6LTIsJ25lZ2F0aXZpdHknOi0yLCduZWdsZWN0JzotMiwnbmVnbGVjdGVkJzotMiwnbmVnbGVjdGluZyc6LTIsJ25lZ2xlY3RzJzotMiwnbmVydmVzJzotMSwnbmVydm91cyc6LTIsJ25lcnZvdXNseSc6LTIsJ25pY2UnOjMsJ25pZnR5JzoyLCduaWdnYXMnOi01LCduaWdnZXInOi01LCdubyc6LTEsJ25vIGZ1bic6LTMsJ25vYmxlJzoyLCdub2lzeSc6LTEsJ25vbnNlbnNlJzotMiwnbm9vYic6LTIsJ25vc2V5JzotMiwnbm90IGdvb2QnOi0yLCdub3Qgd29ya2luZyc6LTMsJ25vdG9yaW91cyc6LTIsJ25vdmVsJzoyLCAnbm93JzogLTIsICdudW1iJzotMSwnbnV0cyc6LTMsJ29ibGl0ZXJhdGUnOi0yLCdvYmxpdGVyYXRlZCc6LTIsJ29ibm94aW91cyc6LTMsJ29ic2NlbmUnOi0yLCdvYnNlc3NlZCc6Miwnb2Jzb2xldGUnOi0yLCdvYnN0YWNsZSc6LTIsJ29ic3RhY2xlcyc6LTIsJ29ic3RpbmF0ZSc6LTIsJ29kZCc6LTIsJ29mZmVuZCc6LTIsJ29mZmVuZGVkJzotMiwnb2ZmZW5kZXInOi0yLCdvZmZlbmRpbmcnOi0yLCdvZmZlbmRzJzotMiwnb2ZmbGluZSc6LTEsJ29rcyc6Miwnb21pbm91cyc6Mywnb25jZS1pbi1hLWxpZmV0aW1lJzozLCdvcHBvcnR1bml0aWVzJzoyLCdvcHBvcnR1bml0eSc6Miwnb3BwcmVzc2VkJzotMiwnb3BwcmVzc2l2ZSc6LTIsJ29wdGltaXNtJzoyLCdvcHRpbWlzdGljJzoyLCdvcHRpb25sZXNzJzotMiwnb3V0Y3J5JzotMiwnb3V0bWFuZXV2ZXJlZCc6LTIsJ291dHJhZ2UnOi0zLCdvdXRyYWdlZCc6LTMsJ291dHJlYWNoJzoyLCdvdXRzdGFuZGluZyc6NSwnb3ZlcmpveWVkJzo0LCdvdmVybG9hZCc6LTEsJ292ZXJsb29rZWQnOi0xLCdvdmVycmVhY3QnOi0yLCdvdmVycmVhY3RlZCc6LTIsJ292ZXJyZWFjdGlvbic6LTIsJ292ZXJyZWFjdHMnOi0yLCdvdmVyc2VsbCc6LTIsJ292ZXJzZWxsaW5nJzotMiwnb3ZlcnNlbGxzJzotMiwnb3ZlcnNpbXBsaWZpY2F0aW9uJzotMiwnb3ZlcnNpbXBsaWZpZWQnOi0yLCdvdmVyc2ltcGxpZmllcyc6LTIsJ292ZXJzaW1wbGlmeSc6LTIsJ292ZXJzdGF0ZW1lbnQnOi0yLCdvdmVyc3RhdGVtZW50cyc6LTIsJ292ZXJ3ZWlnaHQnOi0xLCdveHltb3Jvbic6LTEsJ3BhaW4nOi0yLCdwYWluZWQnOi0yLCdwYW5pYyc6LTMsJ3Bhbmlja2VkJzotMywncGFuaWNzJzotMywncGFyYWRpc2UnOjMsJ3BhcmFkb3gnOi0xLCdwYXJkb24nOjIsJ3BhcmRvbmVkJzoyLCdwYXJkb25pbmcnOjIsJ3BhcmRvbnMnOjIsJ3BhcmxleSc6LTEsJ3Bhc3Npb25hdGUnOjIsJ3Bhc3NpdmUnOi0xLCdwYXNzaXZlbHknOi0xLCdwYXRoZXRpYyc6LTIsJ3BheSc6LTEsJ3BlYWNlJzoyLCdwZWFjZWZ1bCc6MiwncGVhY2VmdWxseSc6MiwncGVuYWx0eSc6LTIsJ3BlbnNpdmUnOi0xLCdwZXJmZWN0JzozLCdwZXJmZWN0ZWQnOjIsJ3BlcmZlY3RseSc6MywncGVyZmVjdHMnOjIsJ3BlcmlsJzotMiwncGVyanVyeSc6LTMsJ3BlcnBldHJhdG9yJzotMiwncGVycGV0cmF0b3JzJzotMiwncGVycGxleGVkJzotMiwncGVyc2VjdXRlJzotMiwncGVyc2VjdXRlZCc6LTIsJ3BlcnNlY3V0ZXMnOi0yLCdwZXJzZWN1dGluZyc6LTIsJ3BlcnR1cmJlZCc6LTIsJ3Blc2t5JzotMiwncGVzc2ltaXNtJzotMiwncGVzc2ltaXN0aWMnOi0yLCdwZXRyaWZpZWQnOi0yLCdwaG9iaWMnOi0yLCdwaWN0dXJlc3F1ZSc6MiwncGlsZXVwJzotMSwncGlxdWUnOi0yLCdwaXF1ZWQnOi0yLCdwaXNzJzotNCwncGlzc2VkJzotNCwncGlzc2luZyc6LTMsJ3BpdGVvdXMnOi0yLCdwaXRpZWQnOi0xLCdwaXR5JzotMiwncGxheWZ1bCc6MiwncGxlYXNhbnQnOjMsJ3BsZWFzZSc6MSwncGxlYXNlZCc6MywncGxlYXN1cmUnOjMsJ3BvaXNlZCc6LTIsJ3BvaXNvbic6LTIsJ3BvaXNvbmVkJzotMiwncG9pc29ucyc6LTIsJ3BvbGx1dGUnOi0yLCdwb2xsdXRlZCc6LTIsJ3BvbGx1dGVyJzotMiwncG9sbHV0ZXJzJzotMiwncG9sbHV0ZXMnOi0yLCdwb29yJzotMiwncG9vcmVyJzotMiwncG9vcmVzdCc6LTIsJ3BvcHVsYXInOjMsJ3Bvc2l0aXZlJzoyLCdwb3NpdGl2ZWx5JzoyLCdwb3NzZXNzaXZlJzotMiwncG9zdHBvbmUnOi0xLCdwb3N0cG9uZWQnOi0xLCdwb3N0cG9uZXMnOi0xLCdwb3N0cG9uaW5nJzotMSwncG92ZXJ0eSc6LTEsJ3Bvd2VyZnVsJzoyLCdwb3dlcmxlc3MnOi0yLCdwcmFpc2UnOjMsJ3ByYWlzZWQnOjMsJ3ByYWlzZXMnOjMsJ3ByYWlzaW5nJzozLCdwcmF5JzoxLCdwcmF5aW5nJzoxLCdwcmF5cyc6MSwncHJibG0nOi0yLCdwcmJsbXMnOi0yLCdwcmVwYXJlZCc6MSwncHJlc3N1cmUnOi0xLCdwcmVzc3VyZWQnOi0yLCdwcmV0ZW5kJzotMSwncHJldGVuZGluZyc6LTEsJ3ByZXRlbmRzJzotMSwncHJldHR5JzoxLCdwcmV2ZW50JzotMSwncHJldmVudGVkJzotMSwncHJldmVudGluZyc6LTEsJ3ByZXZlbnRzJzotMSwncHJpY2snOi01LCdwcmlzb24nOi0yLCdwcmlzb25lcic6LTIsJ3ByaXNvbmVycyc6LTIsJ3ByaXZpbGVnZWQnOjIsJ3Byb2FjdGl2ZSc6MiwncHJvYmxlbSc6LTIsJ3Byb2JsZW1zJzotMiwncHJvZml0ZWVyJzotMiwncHJvZ3Jlc3MnOjIsJ3Byb21pbmVudCc6MiwncHJvbWlzZSc6MSwncHJvbWlzZWQnOjEsJ3Byb21pc2VzJzoxLCdwcm9tb3RlJzoxLCdwcm9tb3RlZCc6MSwncHJvbW90ZXMnOjEsJ3Byb21vdGluZyc6MSwncHJvcGFnYW5kYSc6LTIsJ3Byb3NlY3V0ZSc6LTEsJ3Byb3NlY3V0ZWQnOi0yLCdwcm9zZWN1dGVzJzotMSwncHJvc2VjdXRpb24nOi0xLCdwcm9zcGVjdCc6MSwncHJvc3BlY3RzJzoxLCdwcm9zcGVyb3VzJzozLCdwcm90ZWN0JzoxLCdwcm90ZWN0ZWQnOjEsJ3Byb3RlY3RzJzoxLCdwcm90ZXN0JzotMiwncHJvdGVzdGVycyc6LTIsJ3Byb3Rlc3RpbmcnOi0yLCdwcm90ZXN0cyc6LTIsJ3Byb3VkJzoyLCdwcm91ZGx5JzoyLCdwcm92b2tlJzotMSwncHJvdm9rZWQnOi0xLCdwcm92b2tlcyc6LTEsJ3Byb3Zva2luZyc6LTEsJ3BzZXVkb3NjaWVuY2UnOi0zLCdwdW5pc2gnOi0yLCdwdW5pc2hlZCc6LTIsJ3B1bmlzaGVzJzotMiwncHVuaXRpdmUnOi0yLCdwdXNoeSc6LTEsJ3B1enpsZWQnOi0yLCdxdWFraW5nJzotMiwncXVlc3Rpb25hYmxlJzotMiwncXVlc3Rpb25lZCc6LTEsJ3F1ZXN0aW9uaW5nJzotMSwncmFjaXNtJzotMywncmFjaXN0JzotMywncmFjaXN0cyc6LTMsJ3JhZ2UnOi0yLCdyYWdlZnVsJzotMiwncmFpbnknOi0xLCdyYW50JzotMywncmFudGVyJzotMywncmFudGVycyc6LTMsJ3JhbnRzJzotMywncmFwZSc6LTQsJ3JhcGlzdCc6LTQsJ3JhcHR1cmUnOjIsJ3JhcHR1cmVkJzoyLCdyYXB0dXJlcyc6MiwncmFwdHVyb3VzJzo0LCdyYXNoJzotMiwncmF0aWZpZWQnOjIsJ3JlYWNoJzoxLCdyZWFjaGVkJzoxLCdyZWFjaGVzJzoxLCdyZWFjaGluZyc6MSwncmVhc3N1cmUnOjEsJ3JlYXNzdXJlZCc6MSwncmVhc3N1cmVzJzoxLCdyZWFzc3VyaW5nJzoyLCdyZWJlbGxpb24nOi0yLCdyZWNlc3Npb24nOi0yLCdyZWNrbGVzcyc6LTIsJ3JlY29tbWVuZCc6MiwncmVjb21tZW5kZWQnOjIsJ3JlY29tbWVuZHMnOjIsJ3JlZGVlbWVkJzoyLCdyZWZ1c2UnOi0yLCdyZWZ1c2VkJzotMiwncmVmdXNpbmcnOi0yLCdyZWdyZXQnOi0yLCdyZWdyZXRmdWwnOi0yLCdyZWdyZXRzJzotMiwncmVncmV0dGVkJzotMiwncmVncmV0dGluZyc6LTIsJ3JlamVjdCc6LTEsJ3JlamVjdGVkJzotMSwncmVqZWN0aW5nJzotMSwncmVqZWN0cyc6LTEsJ3Jlam9pY2UnOjQsJ3Jlam9pY2VkJzo0LCdyZWpvaWNlcyc6NCwncmVqb2ljaW5nJzo0LCdyZWxheGVkJzoyLCdyZWxlbnRsZXNzJzotMSwncmVsaWFudCc6MiwncmVsaWV2ZSc6MSwncmVsaWV2ZWQnOjIsJ3JlbGlldmVzJzoxLCdyZWxpZXZpbmcnOjIsJ3JlbGlzaGluZyc6MiwncmVtYXJrYWJsZSc6MiwncmVtb3JzZSc6LTIsJ3JlcHVsc2UnOi0xLCdyZXB1bHNlZCc6LTIsJ3Jlc2N1ZSc6MiwncmVzY3VlZCc6MiwncmVzY3Vlcyc6MiwncmVzZW50ZnVsJzotMiwncmVzaWduJzotMSwncmVzaWduZWQnOi0xLCdyZXNpZ25pbmcnOi0xLCdyZXNpZ25zJzotMSwncmVzb2x1dGUnOjIsJ3Jlc29sdmUnOjIsJ3Jlc29sdmVkJzoyLCdyZXNvbHZlcyc6MiwncmVzb2x2aW5nJzoyLCdyZXNwZWN0ZWQnOjIsJ3Jlc3BvbnNpYmxlJzoyLCdyZXNwb25zaXZlJzoyLCdyZXN0ZnVsJzoyLCdyZXN0bGVzcyc6LTIsJ3Jlc3RvcmUnOjEsJ3Jlc3RvcmVkJzoxLCdyZXN0b3Jlcyc6MSwncmVzdG9yaW5nJzoxLCdyZXN0cmljdCc6LTIsJ3Jlc3RyaWN0ZWQnOi0yLCdyZXN0cmljdGluZyc6LTIsJ3Jlc3RyaWN0aW9uJzotMiwncmVzdHJpY3RzJzotMiwncmV0YWluZWQnOi0xLCdyZXRhcmQnOi0yLCdyZXRhcmRlZCc6LTIsJ3JldHJlYXQnOi0xLCdyZXZlbmdlJzotMiwncmV2ZW5nZWZ1bCc6LTIsJ3JldmVyZWQnOjIsJ3Jldml2ZSc6MiwncmV2aXZlcyc6MiwncmV3YXJkJzoyLCdyZXdhcmRlZCc6MiwncmV3YXJkaW5nJzoyLCdyZXdhcmRzJzoyLCdyaWNoJzoyLCdyaWRpY3Vsb3VzJzotMywncmlnJzotMSwncmlnZ2VkJzotMSwncmlnaHQgZGlyZWN0aW9uJzozLCdyaWdvcm91cyc6Mywncmlnb3JvdXNseSc6MywncmlvdCc6LTIsJ3Jpb3RzJzotMiwncmlzayc6LTIsJ3Jpc2tzJzotMiwncm9iJzotMiwncm9iYmVyJzotMiwncm9iZWQnOi0yLCdyb2JpbmcnOi0yLCdyb2JzJzotMiwncm9idXN0JzoyLCdyb2ZsJzo0LCdyb2ZsY29wdGVyJzo0LCdyb2ZsbWFvJzo0LCdyb21hbmNlJzoyLCdyb3RmbCc6NCwncm90ZmxtZmFvJzo0LCdyb3RmbG9sJzo0LCdydWluJzotMiwncnVpbmVkJzotMiwncnVpbmluZyc6LTIsJ3J1aW5zJzotMiwnc2Fib3RhZ2UnOi0yLCdzYWQnOi0yLCdzYWRkZW4nOi0yLCdzYWRkZW5lZCc6LTIsJ3NhZGx5JzotMiwnc2FmZSc6MSwnc2FmZWx5JzoxLCdzYWZldHknOjEsJ3NhbGllbnQnOjEsJ3NhcHB5JzotMSwnc2FyY2FzdGljJzotMiwnc2F0aXNmaWVkJzoyLCdzYXZlJzoyLCdzYXZlZCc6Miwnc2NhbSc6LTIsJ3NjYW1zJzotMiwnc2NhbmRhbCc6LTMsJ3NjYW5kYWxvdXMnOi0zLCdzY2FuZGFscyc6LTMsJ3NjYXBlZ29hdCc6LTIsJ3NjYXBlZ29hdHMnOi0yLCdzY2FyZSc6LTIsJ3NjYXJlZCc6LTIsJ3NjYXJ5JzotMiwnc2NlcHRpY2FsJzotMiwnc2NvbGQnOi0yLCdzY29vcCc6Mywnc2Nvcm4nOi0yLCdzY29ybmZ1bCc6LTIsJ3NjcmVhbSc6LTIsJ3NjcmVhbWVkJzotMiwnc2NyZWFtaW5nJzotMiwnc2NyZWFtcyc6LTIsJ3NjcmV3ZWQnOi0yLCdzY3Jld2VkIHVwJzotMywnc2N1bWJhZyc6LTQsJ3NlY3VyZSc6Miwnc2VjdXJlZCc6Miwnc2VjdXJlcyc6Miwnc2VkaXRpb24nOi0yLCdzZWRpdGlvdXMnOi0yLCdzZWR1Y2VkJzotMSwnc2VsZi1jb25maWRlbnQnOjIsJ3NlbGYtZGVsdWRlZCc6LTIsJ3NlbGZpc2gnOi0zLCdzZWxmaXNobmVzcyc6LTMsJ3NlbnRlbmNlJzotMiwnc2VudGVuY2VkJzotMiwnc2VudGVuY2VzJzotMiwnc2VudGVuY2luZyc6LTIsJ3NlcmVuZSc6Miwnc2V2ZXJlJzotMiwnc2V4eSc6Mywnc2hha3knOi0yLCdzaGFtZSc6LTIsJ3NoYW1lZCc6LTIsJ3NoYW1lZnVsJzotMiwnc2hhcmUnOjEsJ3NoYXJlZCc6MSwnc2hhcmVzJzoxLCdzaGF0dGVyZWQnOi0yLCdzaGl0JzotNywnc2hpdGhlYWQnOi00LCdzaGl0dHknOi0zLCdzaG9jayc6LTIsJ3Nob2NrZWQnOi0yLCdzaG9ja2luZyc6LTIsJ3Nob2Nrcyc6LTIsJ3Nob290JzotMSwnc2hvcnQtc2lnaHRlZCc6LTIsJ3Nob3J0LXNpZ2h0ZWRuZXNzJzotMiwnc2hvcnRhZ2UnOi0yLCdzaG9ydGFnZXMnOi0yLCdzaHJldyc6LTQsJ3NoeSc6LTEsJ3NpY2snOi0yLCdzaWdoJzotMiwnc2lnbmlmaWNhbmNlJzoxLCdzaWduaWZpY2FudCc6MSwnc2lsZW5jaW5nJzotMSwnc2lsbHknOi0xLCdzaW5jZXJlJzoyLCdzaW5jZXJlbHknOjIsJ3NpbmNlcmVzdCc6Miwnc2luY2VyaXR5JzoyLCdzaW5mdWwnOi0zLCdzaW5nbGVtaW5kZWQnOi0yLCdza2VwdGljJzotMiwnc2tlcHRpY2FsJzotMiwnc2tlcHRpY2lzbSc6LTIsJ3NrZXB0aWNzJzotMiwnc2xhbSc6LTIsJ3NsYXNoJzotMiwnc2xhc2hlZCc6LTIsJ3NsYXNoZXMnOi0yLCdzbGFzaGluZyc6LTIsJ3NsYXZlcnknOi0zLCdzbGVlcGxlc3NuZXNzJzotMiwnc2xpY2snOjIsJ3NsaWNrZXInOjIsJ3NsaWNrZXN0JzoyLCdzbHVnZ2lzaCc6LTIsJ3NsdXQnOi01LCdzbWFydCc6MSwnc21hcnRlcic6Miwnc21hcnRlc3QnOjIsJ3NtZWFyJzotMiwnc21pbGUnOjIsJ3NtaWxlZCc6Miwnc21pbGVzJzoyLCdzbWlsaW5nJzoyLCdzbW9nJzotMiwnc25lYWt5JzotMSwnc251Yic6LTIsJ3NudWJiZWQnOi0yLCdzbnViYmluZyc6LTIsJ3NudWJzJzotMiwnc29iZXJpbmcnOjEsJ3NvbGVtbic6LTEsJ3NvbGlkJzoyLCdzb2xpZGFyaXR5JzoyLCdzb2x1dGlvbic6MSwnc29sdXRpb25zJzoxLCdzb2x2ZSc6MSwnc29sdmVkJzoxLCdzb2x2ZXMnOjEsJ3NvbHZpbmcnOjEsJ3NvbWJlcic6LTIsJ3NvbWUga2luZCc6MCwnc29uLW9mLWEtYml0Y2gnOi01LCdzb290aGUnOjMsJ3Nvb3RoZWQnOjMsJ3Nvb3RoaW5nJzozLCdzb3BoaXN0aWNhdGVkJzoyLCdzb3JlJzotMSwnc29ycm93JzotMiwnc29ycm93ZnVsJzotMiwnc29ycnknOi0xLCdzcGFtJzotMiwnc3BhbW1lcic6LTMsJ3NwYW1tZXJzJzotMywnc3BhbW1pbmcnOi0yLCdzcGFyayc6MSwnc3BhcmtsZSc6Mywnc3BhcmtsZXMnOjMsJ3NwYXJrbGluZyc6Mywnc3BlY3VsYXRpdmUnOi0yLCdzcGlyaXQnOjEsJ3NwaXJpdGVkJzoyLCdzcGlyaXRsZXNzJzotMiwnc3BpdGVmdWwnOi0yLCdzcGxlbmRpZCc6Mywnc3ByaWdodGx5JzoyLCdzcXVlbGNoZWQnOi0xLCdzdGFiJzotMiwnc3RhYmJlZCc6LTIsJ3N0YWJsZSc6Miwnc3RhYnMnOi0yLCdzdGFsbCc6LTIsJ3N0YWxsZWQnOi0yLCdzdGFsbGluZyc6LTIsJ3N0YW1pbmEnOjIsJ3N0YW1wZWRlJzotMiwnc3RhcnRsZWQnOi0yLCdzdGFydmUnOi0yLCdzdGFydmVkJzotMiwnc3RhcnZlcyc6LTIsJ3N0YXJ2aW5nJzotMiwnc3RlYWRmYXN0JzoyLCdzdGVhbCc6LTIsJ3N0ZWFscyc6LTIsJ3N0ZXJlb3R5cGUnOi0yLCdzdGVyZW90eXBlZCc6LTIsJ3N0aWZsZWQnOi0xLCdzdGltdWxhdGUnOjEsJ3N0aW11bGF0ZWQnOjEsJ3N0aW11bGF0ZXMnOjEsJ3N0aW11bGF0aW5nJzoyLCdzdGluZ3knOi0yLCdzdG9sZW4nOi0yLCdzdG9wJzotMSwnc3RvcHBlZCc6LTEsJ3N0b3BwaW5nJzotMSwnc3RvcHMnOi0xLCdzdG91dCc6Miwnc3RyYWlnaHQnOjEsJ3N0cmFuZ2UnOi0xLCdzdHJhbmdlbHknOi0xLCdzdHJhbmdsZWQnOi0yLCdzdHJlbmd0aCc6Miwnc3RyZW5ndGhlbic6Miwnc3RyZW5ndGhlbmVkJzoyLCdzdHJlbmd0aGVuaW5nJzoyLCdzdHJlbmd0aGVucyc6Miwnc3RyZXNzZWQnOi0yLCdzdHJlc3Nvcic6LTIsJ3N0cmVzc29ycyc6LTIsJ3N0cmlja2VuJzotMiwnc3RyaWtlJzotMSwnc3RyaWtlcnMnOi0yLCdzdHJpa2VzJzotMSwnc3Ryb25nJzoyLCdzdHJvbmdlcic6Miwnc3Ryb25nZXN0JzoyLCdzdHJ1Y2snOi0xLCdzdHJ1Z2dsZSc6LTIsJ3N0cnVnZ2xlZCc6LTIsJ3N0cnVnZ2xlcyc6LTIsJ3N0cnVnZ2xpbmcnOi0yLCdzdHViYm9ybic6LTIsJ3N0dWNrJzotMiwnc3R1bm5lZCc6LTIsJ3N0dW5uaW5nJzo0LCdzdHVwaWQnOi0yLCdzdHVwaWRseSc6LTIsJ3N1YXZlJzoyLCdzdWJzdGFudGlhbCc6MSwnc3Vic3RhbnRpYWxseSc6MSwnc3VidmVyc2l2ZSc6LTIsJ3N1Y2Nlc3MnOjIsJ3N1Y2Nlc3NmdWwnOjMsJ3N1Y2snOi0zLCdzdWNrcyc6LTMsJ3N1ZmZlcic6LTIsJ3N1ZmZlcmluZyc6LTIsJ3N1ZmZlcnMnOi0yLCdzdWljaWRhbCc6LTIsJ3N1aWNpZGUnOi0yLCdzdWluZyc6LTIsJ3N1bGtpbmcnOi0yLCdzdWxreSc6LTIsJ3N1bGxlbic6LTIsJ3N1bnNoaW5lJzoyLCdzdXBlcic6Mywnc3VwZXJiJzo1LCdzdXBlcmlvcic6Miwnc3VwcG9ydCc6Miwnc3VwcG9ydGVkJzoyLCdzdXBwb3J0ZXInOjEsJ3N1cHBvcnRlcnMnOjEsJ3N1cHBvcnRpbmcnOjEsJ3N1cHBvcnRpdmUnOjIsJ3N1cHBvcnRzJzoyLCdzdXJ2aXZlZCc6Miwnc3Vydml2aW5nJzoyLCdzdXJ2aXZvcic6Miwnc3VzcGVjdCc6LTEsJ3N1c3BlY3RlZCc6LTEsJ3N1c3BlY3RpbmcnOi0xLCdzdXNwZWN0cyc6LTEsJ3N1c3BlbmQnOi0xLCdzdXNwZW5kZWQnOi0xLCdzdXNwaWNpb3VzJzotMiwnc3dlYXInOi0yLCdzd2VhcmluZyc6LTIsJ3N3ZWFycyc6LTIsJ3N3ZWV0JzoyLCdzd2lmdCc6Miwnc3dpZnRseSc6Miwnc3dpbmRsZSc6LTMsJ3N3aW5kbGVzJzotMywnc3dpbmRsaW5nJzotMywnc3ltcGF0aGV0aWMnOjIsJ3N5bXBhdGh5JzoyLCd0YXJkJzotMiwndGVhcnMnOi0yLCd0ZW5kZXInOjIsJ3RlbnNlJzotMiwndGVuc2lvbic6LTEsJ3RlcnJpYmxlJzotMywndGVycmlibHknOi0zLCd0ZXJyaWZpYyc6NCwndGVycmlmaWVkJzotMywndGVycm9yJzotMywndGVycm9yaXplJzotMywndGVycm9yaXplZCc6LTMsJ3RlcnJvcml6ZXMnOi0zLCd0aGFuayc6MiwndGhhbmtmdWwnOjIsJ3RoYW5rcyc6MiwndGhvcm55JzotMiwndGhvdWdodGZ1bCc6MiwndGhvdWdodGxlc3MnOi0yLCd0aHJlYXQnOi0yLCd0aHJlYXRlbic6LTIsJ3RocmVhdGVuZWQnOi0yLCd0aHJlYXRlbmluZyc6LTIsJ3RocmVhdGVucyc6LTIsJ3RocmVhdHMnOi0yLCd0aHJpbGxlZCc6NSwndGh3YXJ0JzotMiwndGh3YXJ0ZWQnOi0yLCd0aHdhcnRpbmcnOi0yLCd0aHdhcnRzJzotMiwndGltaWQnOi0yLCd0aW1vcm91cyc6LTIsJ3RpcmVkJzotMiwndGl0cyc6LTIsJ3RvbGVyYW50JzoyLCd0b290aGxlc3MnOi0yLCd0b3AnOjIsJ3RvcHMnOjIsJ3Rvcm4nOi0yLCd0b3J0dXJlJzotNCwndG9ydHVyZWQnOi00LCd0b3J0dXJlcyc6LTQsJ3RvcnR1cmluZyc6LTQsJ3RvdGFsaXRhcmlhbic6LTIsJ3RvdGFsaXRhcmlhbmlzbSc6LTIsJ3RvdXQnOi0yLCd0b3V0ZWQnOi0yLCd0b3V0aW5nJzotMiwndG91dHMnOi0yLCd0cmFnZWR5JzotMiwndHJhZ2ljJzotMiwndHJhbnF1aWwnOjIsJ3RyYXAnOi0xLCd0cmFwcGVkJzotMiwndHJhdW1hJzotMywndHJhdW1hdGljJzotMywndHJhdmVzdHknOi0yLCd0cmVhc29uJzotMywndHJlYXNvbm91cyc6LTMsJ3RyZWFzdXJlJzoyLCd0cmVhc3VyZXMnOjIsJ3RyZW1ibGluZyc6LTIsJ3RyZW11bG91cyc6LTIsJ3RyaWNrZWQnOi0yLCd0cmlja2VyeSc6LTIsJ3RyaXVtcGgnOjQsJ3RyaXVtcGhhbnQnOjQsJ3Ryb3VibGUnOi0yLCd0cm91YmxlZCc6LTIsJ3Ryb3VibGVzJzotMiwndHJ1ZSc6MiwndHJ1c3QnOjEsJ3RydXN0ZWQnOjIsJ3R1bW9yJzotMiwndHdhdCc6LTUsJ3VnbHknOi0zLCd1bmFjY2VwdGFibGUnOi0yLCd1bmFwcHJlY2lhdGVkJzotMiwndW5hcHByb3ZlZCc6LTIsJ3VuYXdhcmUnOi0yLCd1bmJlbGlldmFibGUnOi0xLCd1bmJlbGlldmluZyc6LTEsJ3VuYmlhc2VkJzoyLCd1bmNlcnRhaW4nOi0xLCd1bmNsZWFyJzotMSwndW5jb21mb3J0YWJsZSc6LTIsJ3VuY29uY2VybmVkJzotMiwndW5jb25maXJtZWQnOi0xLCd1bmNvbnZpbmNlZCc6LTEsJ3VuY3JlZGl0ZWQnOi0xLCd1bmRlY2lkZWQnOi0xLCd1bmRlcmVzdGltYXRlJzotMSwndW5kZXJlc3RpbWF0ZWQnOi0xLCd1bmRlcmVzdGltYXRlcyc6LTEsJ3VuZGVyZXN0aW1hdGluZyc6LTEsJ3VuZGVybWluZSc6LTIsJ3VuZGVybWluZWQnOi0yLCd1bmRlcm1pbmVzJzotMiwndW5kZXJtaW5pbmcnOi0yLCd1bmRlc2VydmluZyc6LTIsJ3VuZGVzaXJhYmxlJzotMiwndW5lYXN5JzotMiwndW5lbXBsb3ltZW50JzotMiwndW5lcXVhbCc6LTEsJ3VuZXF1YWxlZCc6MiwndW5ldGhpY2FsJzotMiwndW5mYWlyJzotMiwndW5mb2N1c2VkJzotMiwndW5mdWxmaWxsZWQnOi0yLCd1bmhhcHB5JzotMiwndW5oZWFsdGh5JzotMiwndW5pZmllZCc6MSwndW5pbXByZXNzZWQnOi0yLCd1bmludGVsbGlnZW50JzotMiwndW5pdGVkJzoxLCd1bmp1c3QnOi0yLCd1bmxvdmFibGUnOi0yLCd1bmxvdmVkJzotMiwndW5tYXRjaGVkJzoxLCd1bm1vdGl2YXRlZCc6LTIsJ3VucHJvZmVzc2lvbmFsJzotMiwndW5yZXNlYXJjaGVkJzotMiwndW5zYXRpc2ZpZWQnOi0yLCd1bnNlY3VyZWQnOi0yLCd1bnNldHRsZWQnOi0xLCd1bnNvcGhpc3RpY2F0ZWQnOi0yLCd1bnN0YWJsZSc6LTIsJ3Vuc3RvcHBhYmxlJzoyLCd1bnN1cHBvcnRlZCc6LTIsJ3Vuc3VyZSc6LTEsJ3VudGFybmlzaGVkJzoyLCd1bndhbnRlZCc6LTIsJ3Vud29ydGh5JzotMiwndXBzZXQnOi0yLCd1cHNldHMnOi0yLCd1cHNldHRpbmcnOi0yLCd1cHRpZ2h0JzotMiwndXJnZW50JzotMSwndXNlZnVsJzoyLCd1c2VmdWxuZXNzJzoyLCd1c2VsZXNzJzotMiwndXNlbGVzc25lc3MnOi0yLCd2YWd1ZSc6LTIsJ3ZhbGlkYXRlJzoxLCd2YWxpZGF0ZWQnOjEsJ3ZhbGlkYXRlcyc6MSwndmFsaWRhdGluZyc6MSwndmVyZGljdCc6LTEsJ3ZlcmRpY3RzJzotMSwndmVzdGVkJzoxLCd2ZXhhdGlvbic6LTIsJ3ZleGluZyc6LTIsJ3ZpYnJhbnQnOjMsJ3ZpY2lvdXMnOi0yLCd2aWN0aW0nOi0zLCd2aWN0aW1pemUnOi0zLCd2aWN0aW1pemVkJzotMywndmljdGltaXplcyc6LTMsJ3ZpY3RpbWl6aW5nJzotMywndmljdGltcyc6LTMsJ3ZpZ2lsYW50JzozLCd2aWxlJzotMywndmluZGljYXRlJzoyLCd2aW5kaWNhdGVkJzoyLCd2aW5kaWNhdGVzJzoyLCd2aW5kaWNhdGluZyc6MiwndmlvbGF0ZSc6LTIsJ3Zpb2xhdGVkJzotMiwndmlvbGF0ZXMnOi0yLCd2aW9sYXRpbmcnOi0yLCd2aW9sZW5jZSc6LTMsJ3Zpb2xlbnQnOi0zLCd2aXJ0dW91cyc6MiwndmlydWxlbnQnOi0yLCd2aXNpb24nOjEsJ3Zpc2lvbmFyeSc6MywndmlzaW9uaW5nJzoxLCd2aXNpb25zJzoxLCd2aXRhbGl0eSc6Mywndml0YW1pbic6MSwndml0cmlvbGljJzotMywndml2YWNpb3VzJzozLCd2b2NpZmVyb3VzJzotMSwndnVsbmVyYWJpbGl0eSc6LTIsJ3Z1bG5lcmFibGUnOi0yLCAnd2FpdCc6IC0yLCAnd2Fsa291dCc6LTIsJ3dhbGtvdXRzJzotMiwnd2Fua2VyJzotMywnd2FudCc6MSwnd2FyJzotMiwnd2FyZmFyZSc6LTIsJ3dhcm0nOjEsJ3dhcm10aCc6Miwnd2Fybic6LTIsJ3dhcm5lZCc6LTIsJ3dhcm5pbmcnOi0zLCd3YXJuaW5ncyc6LTMsJ3dhcm5zJzotMiwnd2FzdGUnOi0xLCd3YXN0ZWQnOi0yLCd3YXN0aW5nJzotMiwnd2F2ZXJpbmcnOi0xLCd3ZWFrJzotMiwnd2Vha25lc3MnOi0yLCd3ZWFsdGgnOjMsJ3dlYWx0aHknOjIsJ3dlYXJ5JzotMiwnd2VlcCc6LTIsJ3dlZXBpbmcnOi0yLCd3ZWlyZCc6LTIsJ3dlbGNvbWUnOjIsJ3dlbGNvbWVkJzoyLCd3ZWxjb21lcyc6Miwnd2hpbXNpY2FsJzoxLCd3aGl0ZXdhc2gnOi0zLCd3aG9yZSc6LTQsJ3dpY2tlZCc6LTIsJ3dpZG93ZWQnOi0xLCd3aWxsaW5nbmVzcyc6Miwnd2luJzo0LCd3aW5uZXInOjQsJ3dpbm5pbmcnOjQsJ3dpbnMnOjQsJ3dpbndpbic6Mywnd2lzaCc6MSwnd2lzaGVzJzoxLCd3aXNoaW5nJzoxLCd3aXRoZHJhd2FsJzotMywnd29lYmVnb25lJzotMiwnd29lZnVsJzotMywnd29uJzozLCd3b25kZXJmdWwnOjQsJ3dvbyc6Mywnd29vaG9vJzozLCd3b29vJzo0LCd3b293Jzo0LCd3b3JuJzotMSwnd29ycmllZCc6LTMsJ3dvcnJ5JzotMywnd29ycnlpbmcnOi0zLCd3b3JzZSc6LTMsJ3dvcnNlbic6LTMsJ3dvcnNlbmVkJzotMywnd29yc2VuaW5nJzotMywnd29yc2Vucyc6LTMsJ3dvcnNoaXBlZCc6Mywnd29yc3QnOi0zLCd3b3J0aCc6Miwnd29ydGhsZXNzJzotMiwnd29ydGh5JzoyLCd3b3cnOjQsJ3dvd293Jzo0LCd3b3d3dyc6NCwnd3JhdGhmdWwnOi0zLCd3cmVjayc6LTIsJ3dyb25nJzotMiwnd3JvbmdlZCc6LTIsJ3d0Zic6LTQsJ3llYWgnOjEsJ3llYXJuaW5nJzoxLCd5ZWVlcyc6MiwneWVzJzoxLCd5b3V0aGZ1bCc6MiwneXVja3knOi0yLCd5dW1teSc6MywnemVhbG90JzotMiwnemVhbG90cyc6LTIsJ3plYWxvdXMnOjIsICc6Uyc6IC0zLCAnOiknOiAyLCAnOignOiAtMiwndGVycm9yaXppbmcnOiAtM307XG5leHBvcnQgY29uc3QgUFJFRklYX01PRElGSUVSUyA9IHsncmVhbGx5JzogMiwgJ2Z1Y2tpbmcnOiAzLCAnZnJpY2tpbmcnOiAyLCAnZGFtbic6IDIsICdibG9vZHknOiAyLCAnbm90JzogLTEsICdjYW5cXCd0JzogLTEsICdzdWNoJzogMiwgJ3Rvbyc6IDIsICdzbyc6IDF9O1xuZXhwb3J0IGNvbnN0IFBPU1RGSVhfTU9ESUZJRVJTID0geychJzogMn07IiwiLy90ZXN0XG5cbmltcG9ydCAqIGFzIGdtYWlsTGlzdGVuZXIgZnJvbSAnLi9hZGRIb29rVG9HbWFpbC5qcyc7XG5pbXBvcnQgKiBhcyBzZW50aW1lbnRBbmFseXNlciBmcm9tICcuL2FuYWx5c2VTZW50aW1lbnQuanMnO1xuaW1wb3J0ICogYXMgYW5hbHlzZURJU0MgZnJvbSAnLi9hbmFseXNlRElTQ1Byb2ZpbGUuanMnO1xuaW1wb3J0ICogYXMgZW1haWxQYXJzZXIgZnJvbSAnLi91dGlscy9lbWFpbFBhcnNlVXRpbC5qcyc7XG5pbXBvcnQgKiBhcyBsaWdodEJveFV0aWwgZnJvbSAnLi91dGlscy9yZXN1bHRzTGlnaHRib3guanMnO1xuaW1wb3J0ICogYXMgcmVhZGFiaWxpdHlBbmFseXNlciBmcm9tICcuL3V0aWxzL2NhbGN1bGF0ZVJlYWRpbmdMZXZlbC5qcyc7XG5cbihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG4gICAgc3RhcnRTbGVlcE9uSXQoKTtcbiAgICBjb25zb2xlLmxvZygnKioqc3RhcnRpbmcgYXBwIHdpdGggZGlzYyBwcm9maWxlIGFuYWx5c2lzJyk7XG5cbiAgICBmdW5jdGlvbiBzdGFydFNsZWVwT25JdCgpIHsgXG4gICAgICAgIGdtYWlsTGlzdGVuZXIuc3RhcnRBcHAoKTtcbiAgICAgICAgZ21haWxMaXN0ZW5lci5zZXRTZW5kQnV0dG9uQ2xpY2tIYW5kbGVyKHNsZWVwT25JdEhhbmRsZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNsZWVwT25JdEhhbmRsZXIgKGV2ZW50KSB7IFxuICAgICAgICB2YXIgZW1haWxCb2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2W2FyaWEtbGFiZWw9XFwnTWVzc2FnZSBCb2R5XFwnXScpLFxuICAgICAgICAgICAgbWVzc2FnZUNvbnRlbnRzID0gZW1haWxQYXJzZXIucmVtb3ZlUXVvdGVkVGV4dEZyb21FbWFpbChlbWFpbEJvZHkudGV4dENvbnRlbnQpLFxuICAgICAgICAgICAgcmVzdWx0cyA9ICcnLFxuICAgICAgICAgICAgc2VudGltZW50ID0gc2VudGltZW50QW5hbHlzZXIuYW5hbHlzZVNlbnRpbWVudChtZXNzYWdlQ29udGVudHMpLFxuICAgICAgICAgICAgcmVhZGFiaWxpdHlTY29yZSA9IHJlYWRhYmlsaXR5QW5hbHlzZXIuZ2V0UXVhbGl0YXRpdmVWb2NhYnVsYXJ5TGV2ZWwobWVzc2FnZUNvbnRlbnRzKSxcbiAgICAgICAgICAgIGd1ZXNzQXRESVNDUHJvZmlsZSA9IGFuYWx5c2VESVNDLmRpc2NQcm9maWxlQW5hbHlzZXIuZ2V0VXNlclJlYWRhYmxlRElTQ1Byb2ZpbGUobWVzc2FnZUNvbnRlbnRzLCByZWFkYWJpbGl0eVNjb3JlKTtcblxuICAgICAgICBjb25zb2xlLmxvZygnKipTT0kgYW5hbHlzaXM6ICcgKyBKU09OLnN0cmluZ2lmeShzZW50aW1lbnQpKTtcbiAgICAgICAgY29uc29sZS5sb2coJyoqZ3Vlc3NBdERJU0NQcm9maWxlJyArIGd1ZXNzQXRESVNDUHJvZmlsZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9ICdTZW50aW1lbnQgc2NvcmU6ICcgKyBzZW50aW1lbnQuc2NvcmUgKyAnPGJyPlZvY2FidWxhcnkgTGV2ZWw6ICcgKyByZWFkYWJpbGl0eVNjb3JlICsgJzxicj5ESVNDIHByb2ZpbGU6ICcgKyBndWVzc0F0RElTQ1Byb2ZpbGUgKyAnPGJyPk5lZ2F0aXZlIHdvcmRzOiAnICsgc2VudGltZW50Lm5lZ2F0aXZlICsgJzxicj5Qb3NpdGl2ZSB3b3JkczogJyArIHNlbnRpbWVudC5wb3NpdGl2ZSArICc8YnI+JztcblxuICAgICAgICBpZiAoc2VudGltZW50LnNjb3JlID4gMCAmJiBzZW50aW1lbnQuc2NvcmUgPCAyKSB7XG4gICAgICAgICAgICBoYW5kbGVCbGFuZEVtYWlsKHJlc3VsdHMsIHNlbnRpbWVudC5zY29yZSwgZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZW50aW1lbnQuc2NvcmUgPCAyKSB7XG4gICAgICAgICAgICBoYW5kbGVBbmdyeUVtYWlsKHJlc3VsdHMsIHNlbnRpbWVudC5uZWdhdGl2ZS5sZW5ndGgsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzZW50aW1lbnQuc2NvcmUgPiAxNSkge1xuICAgICAgICAgICAgaGFuZGxlSGFwcHlFbWFpbChyZXN1bHRzLCBzZW50aW1lbnQucG9zaXRpdmUubGVuZ3RoLCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzaG93UmVzdWx0c0luTGlnaHRib3gocmVzdWx0cyk7XG4gICAgICAgICAgICBzZW5kRW1haWxBbnl3YXkoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUhhcHB5RW1haWwgKHJlc3VsdHMsIG51bWJlck9mSXNzdWVzLCBldmVudCkge1xuICAgICAgICByZXN1bHRzID0gJ1dvdyEgU29tZW9uZVxcJ3MgaW4gYSBnb29kIG1vb2Q6KTxicj5JdCBsb29rcyBsaWtlIHlvdVxcJ3JlIGFib3V0IHRvIGRvIHNvbWV0aGluZyB5b3Ugd29uXFwndCByZWdyZXQgYXQgYWxsLjxicj5TbGVlcCBPbiBJdCBoYXMgZGV0ZWN0ZWQgJyArIGdldENvcnJlY3RQbHVyYWwobnVtYmVyT2ZJc3N1ZXMsICdoYXBweSB3b3JkJykgKyAnIGluIHlvdXIgJyArXG4gICAgICAgICAgICAgICAgJ2VtYWlsOjxicj4nICsgcmVzdWx0cztcbiAgICAgICAgXG4gICAgICAgIHNob3dSZXN1bHRzSW5MaWdodGJveChyZXN1bHRzKTtcblxuICAgICAgICBzZW5kRW1haWxBbnl3YXkoKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsgXG4gICAgICAgIHJldHVybiBmYWxzZTsgXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlQmxhbmRFbWFpbCAoZmFpbE1lc3NhZ2UsIHNjb3JlLCBldmVudCkge1xuICAgICAgICBmYWlsTWVzc2FnZSA9ICdIbW0gdGhpcyBlbWFpbCBpcyBwcmV0dHkgYmxhbmQgYW5kIGVtb3Rpb25sZXNzLiBUaGUgc2VudGltZW50IHNjb3JlIGlzIG9ubHkgJyArIHNjb3JlICsgJy5cXG5JZiB5b3UgZG9uXFwndCB3YW50IHRoZSByZWNpcGllbnQgdG8gdGhpbmsgeW91XFwncmUgYSByb2JvdCwgdHJ5IGluamVjdGluZyBzb21lIHBpemF6eiBpbnRvIHlvdXIgZW1haWwgOylcXG5Ob3QgZnVzc2VkPyBDbGljayBPayB0byBzZW5kIHRoZSBlbWFpbCBhbnl3YXkuIENsaWNrIGNhbmNlbCB0byBjYW5jZWwgc2VuZGluZy4nO1xuXG4gICAgICAgIGlmICghd2luZG93LmNvbmZpcm0oZmFpbE1lc3NhZ2UpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyBcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgXG4gICAgICAgIH0gZWxzZSB7ICAgIFxuICAgICAgICAgICAgc2VuZEVtYWlsQW55d2F5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVBbmdyeUVtYWlsIChmYWlsTWVzc2FnZSwgbnVtYmVyT2ZJc3N1ZXMsIGV2ZW50KSB7XG4gICAgICAgIGZhaWxNZXNzYWdlID0gJ0lOVEVSVkVOVElPTiFcXG5JdCBsb29rcyBsaWtlIHlvdVxcJ3JlIGFib3V0IHRvIGRvIHNvbWV0aGluZyB5b3UgbWlnaHQgcmVncmV0LlxcblNsZWVwIE9uIEl0IGhhcyBkZXRlY3RlZCAnICsgZ2V0Q29ycmVjdFBsdXJhbChudW1iZXJPZklzc3VlcywgJ2lzc3VlJykgKyAnIHdpdGggeW91ciAnICtcbiAgICAgICAgICAgICAgICAnZW1haWw6XFxuJyArIGZhaWxNZXNzYWdlLnJlcGxhY2UoLzxicj4vZywgJ1xcbicpICsgJ0NsaWNrIE9rIHRvIHNlbmQgdGhlIGVtYWlsIGFueXdheS4gQ2xpY2sgY2FuY2VsIHRvIGNhbmNlbCBzZW5kaW5nLic7XG5cbiAgICAgICAgaWYgKCF3aW5kb3cuY29uZmlybShmYWlsTWVzc2FnZSkpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyBcbiAgICAgICAgfSBlbHNlIHsgICAgXG4gICAgICAgICAgICBzZW5kRW1haWxBbnl3YXkoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNob3dSZXN1bHRzSW5MaWdodGJveChyZXN1bHRzKSB7XG4gICAgICAgIGxpZ2h0Qm94VXRpbC5kaXNwbGF5Q29udGVudEluTGlnaHRib3goJzxoMj5TbGVlcCBPbiBJdCBTdGF0czwvaDI+PGJyPicgKyByZXN1bHRzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZW5kRW1haWxBbnl3YXkgKCkge1xuICAgICAgICBnbWFpbExpc3RlbmVyLnRyaWdnZXJFbWFpbFNlbmQoKTtcbiAgICAgICAgY29uc29sZS5sb2coJyoqKlNlbmRpbmcgZW1haWwgYW55d2F5Jyk7XG4gICAgfSAgICBcblxuICAgIGZ1bmN0aW9uIGdldENvcnJlY3RQbHVyYWwgKG51bWJlciwgd29yZCkge1xuICAgICAgICBpZiAobnVtYmVyID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gJzEgJyArIHdvcmQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bWJlciArICcgJyArIHdvcmQgKyAncyc7XG4gICAgfVxuXG59KSgpO1xuIiwiLy9hZGFwdGVkIGZyb20gaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvYXV0b21hdGVkLXJlYWRhYmlsaXR5LWluZGV4XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVSZWFkYWJpbGl0eVNjb3JlICh0ZXh0KSB7XG4gIGlmICh0ZXh0Lmxlbmd0aCkge1xuICAgIHJldHVybiBhbmFseXNlVGV4dCh0ZXh0KTtcbiAgfVxuXG4gIHJldHVybiAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UXVhbGl0YXRpdmVWb2NhYnVsYXJ5TGV2ZWwodGV4dCkge1xuICB2YXIgcmVhZGluZ0xldmVsID0gY2FsY3VsYXRlUmVhZGFiaWxpdHlTY29yZSh0ZXh0KTtcbiAgY29uc3QgQURWQU5DRURfVEhSRVNIT0xEID0gOCxcbiAgICAgICAgU1VQRVJfQURWQU5DRURfVEhSRVNIT0xEID0gMTI7XG5cbiAgaWYgKHJlYWRpbmdMZXZlbCA8IEFEVkFOQ0VEX1RIUkVTSE9MRCkge1xuICAgIHJldHVybiAnYmFzaWMnO1xuICB9IGVsc2UgaWYgKHJlYWRpbmdMZXZlbCA+PSBBRFZBTkNFRF9USFJFU0hPTEQgJiYgcmVhZGluZ0xldmVsIDwgU1VQRVJfQURWQU5DRURfVEhSRVNIT0xEKSB7XG4gICAgcmV0dXJuICdhZHZhbmNlZCc7XG4gIH0gZWxzZSBpZiAocmVhZGluZ0xldmVsID49IFNVUEVSX0FEVkFOQ0VEX1RIUkVTSE9MRCkge1xuICAgIHJldHVybiAndmVyeSBhZHZhbmNlZCc7XG4gIH1cbn1cblxuY29uc3QgTk9OX1dPUkRfQ0hBUkFDVEVSUyA9IC9bJ1wiOzosLj/Cv1xcLVxc4oCUIcKhXSsvZztcblxuZnVuY3Rpb24gYW5hbHlzZVRleHQodGV4dCkge1xuICB2YXIgc3RyaXBwZWRUZXh0ID0gdGV4dC5yZXBsYWNlKE5PTl9XT1JEX0NIQVJBQ1RFUlMsICcnKSxcbiAgICAgIHdvcmRzID0gc3RyaXBwZWRUZXh0Lm1hdGNoKC9cXFMrL2cpLFxuICAgICAgbnVtV29yZHMgPSAwLFxuICAgICAgbnVtQ2hhcmFjdGVycyxcbiAgICAgIHJlYWRhYmlsaXR5U2NvcmU7XG5cbiAgaWYgKHdvcmRzKSB7XG4gICAgbnVtV29yZHMgPSB3b3Jkcy5sZW5ndGg7XG4gIH07XG5cbiAgbnVtQ2hhcmFjdGVycyA9IHN0cmlwcGVkVGV4dC5yZXBsYWNlKC9cXHMvZywgJycpLmxlbmd0aDtcbiAgcmVhZGFiaWxpdHlTY29yZSA9IGdldEF1dG9tYXRlZFJlYWRhYmlsaXR5SW5kZXgobnVtV29yZHMsIG51bUNoYXJhY3RlcnMpO1xuXG4gIGNvbnNvbGUubG9nKCdjaGFycycsIG51bUNoYXJhY3RlcnMsICd3b3JkcycsIG51bVdvcmRzLCAnc2NvcmUnLCByZWFkYWJpbGl0eVNjb3JlLCAnc3RyaXBwZWRUZXh0Jywgc3RyaXBwZWRUZXh0KTtcblxuICByZXR1cm4gcmVhZGFiaWxpdHlTY29yZTtcbn1cblxudmFyIGdldEF1dG9tYXRlZFJlYWRhYmlsaXR5SW5kZXggPSBmdW5jdGlvbihudW1Xb3JkcywgbnVtQ2hhcmFjdGVycykge1xuICByZXR1cm4gKG51bUNoYXJhY3RlcnMgLyBudW1Xb3JkcykudG9GaXhlZCgxKTtcbn07XG4iLCJcbmV4cG9ydCB2YXIgYW5hbHlzZUVnb2lzbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKHRleHQubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGFuYWx5c2VUZXh0KHRleHQpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzZWxmaXNoOiAwLCBcbiAgICBjb250cm9sbGluZzogMCwgXG4gICAgY29uZm9ybWluZzogMFxuICB9O1xufTtcblxuY29uc3QgTk9OX1dPUkRfQ0hBUkFDVEVSUyA9IC9bXCI7OiwuP8K/XFwtXFzigJQhwqFdKy9nLFxuICAgICAgU0VMRklTSF9XT1JEUyA9IC8oIGkgfCBteSB8IG1pbmUgfCBpJ20gfCBpJ2xsICkvZyxcbiAgICAgIElNUEVSQVRJVkVfV09SRFMgPSAvKCB5b3UgfCB5b3VyIHwgeW91cnMgfCB5b3UncmUgfCB5b3UnbGwgKS9nLFxuICAgICAgU0VMRkxFU1NfV09SRFMgPSAvKCB3ZSB8IG91ciB8IG91cnMgfCBsZXQncyB8IHdlJ3JlIHwgd2UnbGwgfCB5b3UgYWxsIHwgeSdhbGwgfCBhbGwgb2YgeW91IHwgdGVhbSApL2c7XG5cbmZ1bmN0aW9uIGFuYWx5c2VUZXh0KHRleHQpIHtcbiAgdmFyIHRleHRXaXRoTGVhZGluZ0FuZFRyYWlsaW5nU3BhY2UgPSAnICcgKyB0ZXh0ICsgJyAnLFxuICAgICAgd29yZHMgPSB0ZXh0V2l0aExlYWRpbmdBbmRUcmFpbGluZ1NwYWNlLnRvTG93ZXJDYXNlKCkucmVwbGFjZShOT05fV09SRF9DSEFSQUNURVJTLCAnJyksXG4gICAgICBzZWxmaXNoV29yZHMgPSB3b3Jkcy5tYXRjaChTRUxGSVNIX1dPUkRTKSxcbiAgICAgIGNvbnRyb2xsaW5nV29yZHMgPSB3b3Jkcy5tYXRjaChJTVBFUkFUSVZFX1dPUkRTKSxcbiAgICAgIGNvbmZvcm1pbmdXb3JkcyA9IHdvcmRzLm1hdGNoKFNFTEZMRVNTX1dPUkRTKTtcblxuICByZXR1cm4ge1xuICAgIHNlbGZpc2g6IHNlbGZpc2hXb3JkcyA/IHNlbGZpc2hXb3Jkcy5sZW5ndGggOiAwLCBcbiAgICBjb250cm9sbGluZzogY29udHJvbGxpbmdXb3JkcyA/IGNvbnRyb2xsaW5nV29yZHMubGVuZ3RoIDogMCwgXG4gICAgY29uZm9ybWluZzogY29uZm9ybWluZ1dvcmRzID8gY29uZm9ybWluZ1dvcmRzLmxlbmd0aCA6IDBcbiAgfTtcblxufVxuXG4iLCJleHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKipcbiAgICAqIEVtYWlscyBvZnRlbiBjb21lIHdpdGggY29waWVzIG9mIG9sZCBlbWFpbHMgZnJvbSBlYXJsaWVyIGluIHRoZSB0aHJlYWRcbiAgICAqIFdlIGRvbid0IHdhbnQgdG8gcHJvY2VzcyB0aGUgb2xkIGVtYWlscyB3aGVuIHdlJ3JlIGFuYWx5c2luZyBhcyB3ZSdsbCBoYXZlIGEgZmFsc2UgcG9zaXRpdmUgb3RoZXJ3aXNlXG4gICAgKiovICAgICAgICAgICAgIFxuICAgIGZ1bmN0aW9uIHJlbW92ZVF1b3RlZFRleHRGcm9tRW1haWwgKGVtYWlsQ29udGVudHMpIHtcbiAgICAgICAgdmFyIHNlbGVjdG9yRm9yUXVvdGVkUmVwbGllcyA9ICc8ZGl2IGNsYXNzPVwiZ21haWxfcXVvdGVcIj4nLFxuICAgICAgICAgICAgZW5kT2ZOZXdDb250ZW50ID0gZW1haWxDb250ZW50cy5pbmRleE9mKHNlbGVjdG9yRm9yUXVvdGVkUmVwbGllcyk7XG5cbiAgICAgICAgaWYgKGVuZE9mTmV3Q29udGVudCA+IC0xKXtcbiAgICAgICAgICAgIHJldHVybiBlbWFpbENvbnRlbnRzLnN1YnN0cmluZygwLCBlbmRPZk5ld0NvbnRlbnQpO1xuICAgICAgICB9IFxuXG4gICAgICAgIHJldHVybiBlbWFpbENvbnRlbnRzO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlbW92ZVF1b3RlZFRleHRGcm9tRW1haWxcbiAgICB9XG5cbn0pKCk7XG4iLCIvL21vZGlmaWVkIGZyb20gaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvZW1vamktcmVnZXgvXG4vL2FkZGVkIHRleHQgZW1vamlzOiA6KSBhbmQgd3JhcHBlZCBpbiBjYXB0dXJlIGdyb3VwXG5cbmV4cG9ydCB2YXIgRU1PSklfUkVHRVggPSAvKCg/OjBcXHUyMEUzfDFcXHUyMEUzfDJcXHUyMEUzfDNcXHUyMEUzfDRcXHUyMEUzfDVcXHUyMEUzfDZcXHUyMEUzfDdcXHUyMEUzfDhcXHUyMEUzfDlcXHUyMEUzfCNcXHUyMEUzfFxcKlxcdTIwRTN8XFx1RDgzQyg/OlxcdURERTZcXHVEODNDKD86XFx1RERFOHxcXHVEREU5fFxcdURERUF8XFx1RERFQnxcXHVEREVDfFxcdURERUV8XFx1RERGMXxcXHVEREYyfFxcdURERjR8XFx1RERGNnxcXHVEREY3fFxcdURERjh8XFx1RERGOXxcXHVEREZBfFxcdURERkN8XFx1RERGRHxcXHVEREZGKXxcXHVEREU3XFx1RDgzQyg/OlxcdURERTZ8XFx1RERFN3xcXHVEREU5fFxcdURERUF8XFx1RERFQnxcXHVEREVDfFxcdURERUR8XFx1RERFRXxcXHVEREVGfFxcdURERjF8XFx1RERGMnxcXHVEREYzfFxcdURERjR8XFx1RERGNnxcXHVEREY3fFxcdURERjh8XFx1RERGOXxcXHVEREZCfFxcdURERkN8XFx1RERGRXxcXHVEREZGKXxcXHVEREU4XFx1RDgzQyg/OlxcdURERTZ8XFx1RERFOHxcXHVEREU5fFxcdURERUJ8XFx1RERFQ3xcXHVEREVEfFxcdURERUV8XFx1RERGMHxcXHVEREYxfFxcdURERjJ8XFx1RERGM3xcXHVEREY0fFxcdURERjV8XFx1RERGN3xcXHVEREZBfFxcdURERkJ8XFx1RERGQ3xcXHVEREZEfFxcdURERkV8XFx1RERGRil8XFx1RERFOVxcdUQ4M0MoPzpcXHVEREVBfFxcdURERUN8XFx1RERFRnxcXHVEREYwfFxcdURERjJ8XFx1RERGNHxcXHVEREZGKXxcXHVEREVBXFx1RDgzQyg/OlxcdURERTZ8XFx1RERFOHxcXHVEREVBfFxcdURERUN8XFx1RERFRHxcXHVEREY3fFxcdURERjh8XFx1RERGOXxcXHVEREZBKXxcXHVEREVCXFx1RDgzQyg/OlxcdURERUV8XFx1RERFRnxcXHVEREYwfFxcdURERjJ8XFx1RERGNHxcXHVEREY3KXxcXHVEREVDXFx1RDgzQyg/OlxcdURERTZ8XFx1RERFN3xcXHVEREU5fFxcdURERUF8XFx1RERFQnxcXHVEREVDfFxcdURERUR8XFx1RERFRXxcXHVEREYxfFxcdURERjJ8XFx1RERGM3xcXHVEREY1fFxcdURERjZ8XFx1RERGN3xcXHVEREY4fFxcdURERjl8XFx1RERGQXxcXHVEREZDfFxcdURERkUpfFxcdURERURcXHVEODNDKD86XFx1RERGMHxcXHVEREYyfFxcdURERjN8XFx1RERGN3xcXHVEREY5fFxcdURERkEpfFxcdURERUVcXHVEODNDKD86XFx1RERFOHxcXHVEREU5fFxcdURERUF8XFx1RERGMXxcXHVEREYyfFxcdURERjN8XFx1RERGNHxcXHVEREY2fFxcdURERjd8XFx1RERGOHxcXHVEREY5KXxcXHVEREVGXFx1RDgzQyg/OlxcdURERUF8XFx1RERGMnxcXHVEREY0fFxcdURERjUpfFxcdURERjBcXHVEODNDKD86XFx1RERFQXxcXHVEREVDfFxcdURERUR8XFx1RERFRXxcXHVEREYyfFxcdURERjN8XFx1RERGNXxcXHVEREY3fFxcdURERkN8XFx1RERGRXxcXHVEREZGKXxcXHVEREYxXFx1RDgzQyg/OlxcdURERTZ8XFx1RERFN3xcXHVEREU4fFxcdURERUV8XFx1RERGMHxcXHVEREY3fFxcdURERjh8XFx1RERGOXxcXHVEREZBfFxcdURERkJ8XFx1RERGRSl8XFx1RERGMlxcdUQ4M0MoPzpcXHVEREU2fFxcdURERTh8XFx1RERFOXxcXHVEREVBfFxcdURERUJ8XFx1RERFQ3xcXHVEREVEfFxcdURERjB8XFx1RERGMXxcXHVEREYyfFxcdURERjN8XFx1RERGNHxcXHVEREY1fFxcdURERjZ8XFx1RERGN3xcXHVEREY4fFxcdURERjl8XFx1RERGQXxcXHVEREZCfFxcdURERkN8XFx1RERGRHxcXHVEREZFfFxcdURERkYpfFxcdURERjNcXHVEODNDKD86XFx1RERFNnxcXHVEREU4fFxcdURERUF8XFx1RERFQnxcXHVEREVDfFxcdURERUV8XFx1RERGMXxcXHVEREY0fFxcdURERjV8XFx1RERGN3xcXHVEREZBfFxcdURERkYpfFxcdURERjRcXHVEODNDXFx1RERGMnxcXHVEREY1XFx1RDgzQyg/OlxcdURERTZ8XFx1RERFQXxcXHVEREVCfFxcdURERUN8XFx1RERFRHxcXHVEREYwfFxcdURERjF8XFx1RERGMnxcXHVEREYzfFxcdURERjd8XFx1RERGOHxcXHVEREY5fFxcdURERkN8XFx1RERGRSl8XFx1RERGNlxcdUQ4M0NcXHVEREU2fFxcdURERjdcXHVEODNDKD86XFx1RERFQXxcXHVEREY0fFxcdURERjh8XFx1RERGQXxcXHVEREZDKXxcXHVEREY4XFx1RDgzQyg/OlxcdURERTZ8XFx1RERFN3xcXHVEREU4fFxcdURERTl8XFx1RERFQXxcXHVEREVDfFxcdURERUR8XFx1RERFRXxcXHVEREVGfFxcdURERjB8XFx1RERGMXxcXHVEREYyfFxcdURERjN8XFx1RERGNHxcXHVEREY3fFxcdURERjh8XFx1RERGOXxcXHVEREZCfFxcdURERkR8XFx1RERGRXxcXHVEREZGKXxcXHVEREY5XFx1RDgzQyg/OlxcdURERTZ8XFx1RERFOHxcXHVEREU5fFxcdURERUJ8XFx1RERFQ3xcXHVEREVEfFxcdURERUZ8XFx1RERGMHxcXHVEREYxfFxcdURERjJ8XFx1RERGM3xcXHVEREY0fFxcdURERjd8XFx1RERGOXxcXHVEREZCfFxcdURERkN8XFx1RERGRil8XFx1RERGQVxcdUQ4M0MoPzpcXHVEREU2fFxcdURERUN8XFx1RERGMnxcXHVEREY4fFxcdURERkV8XFx1RERGRil8XFx1RERGQlxcdUQ4M0MoPzpcXHVEREU2fFxcdURERTh8XFx1RERFQXxcXHVEREVDfFxcdURERUV8XFx1RERGM3xcXHVEREZBKXxcXHVEREZDXFx1RDgzQyg/OlxcdURERUJ8XFx1RERGOCl8XFx1RERGRFxcdUQ4M0NcXHVEREYwfFxcdURERkVcXHVEODNDKD86XFx1RERFQXxcXHVEREY5KXxcXHVEREZGXFx1RDgzQyg/OlxcdURERTZ8XFx1RERGMnxcXHVEREZDKSkpfFtcXHhBOVxceEFFXFx1MjAzQ1xcdTIwNDlcXHUyMTIyXFx1MjEzOVxcdTIxOTQtXFx1MjE5OVxcdTIxQTlcXHUyMUFBXFx1MjMxQVxcdTIzMUJcXHUyMzI4XFx1MjNDRlxcdTIzRTktXFx1MjNGM1xcdTIzRjgtXFx1MjNGQVxcdTI0QzJcXHUyNUFBXFx1MjVBQlxcdTI1QjZcXHUyNUMwXFx1MjVGQi1cXHUyNUZFXFx1MjYwMC1cXHUyNjA0XFx1MjYwRVxcdTI2MTFcXHUyNjE0XFx1MjYxNVxcdTI2MThcXHUyNjFEXFx1MjYyMFxcdTI2MjJcXHUyNjIzXFx1MjYyNlxcdTI2MkFcXHUyNjJFXFx1MjYyRlxcdTI2MzgtXFx1MjYzQVxcdTI2NDgtXFx1MjY1M1xcdTI2NjBcXHUyNjYzXFx1MjY2NVxcdTI2NjZcXHUyNjY4XFx1MjY3QlxcdTI2N0ZcXHUyNjkyLVxcdTI2OTRcXHUyNjk2XFx1MjY5N1xcdTI2OTlcXHUyNjlCXFx1MjY5Q1xcdTI2QTBcXHUyNkExXFx1MjZBQVxcdTI2QUJcXHUyNkIwXFx1MjZCMVxcdTI2QkRcXHUyNkJFXFx1MjZDNFxcdTI2QzVcXHUyNkM4XFx1MjZDRVxcdTI2Q0ZcXHUyNkQxXFx1MjZEM1xcdTI2RDRcXHUyNkU5XFx1MjZFQVxcdTI2RjAtXFx1MjZGNVxcdTI2RjctXFx1MjZGQVxcdTI2RkRcXHUyNzAyXFx1MjcwNVxcdTI3MDgtXFx1MjcwRFxcdTI3MEZcXHUyNzEyXFx1MjcxNFxcdTI3MTZcXHUyNzFEXFx1MjcyMVxcdTI3MjhcXHUyNzMzXFx1MjczNFxcdTI3NDRcXHUyNzQ3XFx1Mjc0Q1xcdTI3NEVcXHUyNzUzLVxcdTI3NTVcXHUyNzU3XFx1Mjc2M1xcdTI3NjRcXHUyNzk1LVxcdTI3OTdcXHUyN0ExXFx1MjdCMFxcdTI3QkZcXHUyOTM0XFx1MjkzNVxcdTJCMDUtXFx1MkIwN1xcdTJCMUJcXHUyQjFDXFx1MkI1MFxcdTJCNTVcXHUzMDMwXFx1MzAzRFxcdTMyOTdcXHUzMjk5XXxcXHVEODNDW1xcdURDMDRcXHVEQ0NGXFx1REQ3MFxcdURENzFcXHVERDdFXFx1REQ3RlxcdUREOEVcXHVERDkxLVxcdUREOUFcXHVERTAxXFx1REUwMlxcdURFMUFcXHVERTJGXFx1REUzMi1cXHVERTNBXFx1REU1MFxcdURFNTFcXHVERjAwLVxcdURGMjFcXHVERjI0LVxcdURGOTNcXHVERjk2XFx1REY5N1xcdURGOTktXFx1REY5QlxcdURGOUUtXFx1REZGMFxcdURGRjMtXFx1REZGNVxcdURGRjctXFx1REZGRl18XFx1RDgzRFtcXHVEQzAwLVxcdURDRkRcXHVEQ0ZGLVxcdUREM0RcXHVERDQ5LVxcdURENEVcXHVERDUwLVxcdURENjdcXHVERDZGXFx1REQ3MFxcdURENzMtXFx1REQ3OVxcdUREODdcXHVERDhBLVxcdUREOERcXHVERDkwXFx1REQ5NVxcdUREOTZcXHVEREE1XFx1RERBOFxcdUREQjFcXHVEREIyXFx1RERCQ1xcdUREQzItXFx1RERDNFxcdURERDEtXFx1REREM1xcdUREREMtXFx1RERERVxcdURERTFcXHVEREUzXFx1RERFRlxcdURERjNcXHVEREZBLVxcdURFNEZcXHVERTgwLVxcdURFQzVcXHVERUNCLVxcdURFRDBcXHVERUUwLVxcdURFRTVcXHVERUU5XFx1REVFQlxcdURFRUNcXHVERUYwXFx1REVGM118XFx1RDgzRVtcXHVERDEwLVxcdUREMThcXHVERDgwLVxcdUREODRcXHVEREMwXXw6XFwpfDpcXCgpL2c7IiwiZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uICgpIHtcblxuICAgIGZ1bmN0aW9uIGRpc3BsYXlDb250ZW50SW5MaWdodGJveChpbnNlcnRDb250ZW50KXtcblxuICAgICAgICAvLyBhZGQgbGlnaHRib3gvc2hhZG93IDxkaXYvPidzIGlmIG5vdCBwcmV2aW91c2x5IGFkZGVkXG4gICAgICAgIHZhciBsaWdodEJveERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsaWdodGJveCcpO1xuICAgICAgICBpZighbGlnaHRCb3hEaXYpe1xuICAgICAgICAgICAgbGlnaHRCb3hEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94RGl2LmlkID0gJ2xpZ2h0Ym94JztcblxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaWdodEJveERpdik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpbnNlcnQgSFRNTCBjb250ZW50XG4gICAgICAgIGlmKGluc2VydENvbnRlbnQgIT0gbnVsbCl7XG4gICAgICAgICAgICBsaWdodEJveERpdi5pbm5lckhUTUwgPSBpbnNlcnRDb250ZW50ICsgJzxicj48YnI+KEhpZGluZyBpbiA2IHNlY29uZHMpJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1vdmUgdGhlIGxpZ2h0Ym94IHRvIHRoZSBjdXJyZW50IHdpbmRvdyB0b3AgKyAxMDBweFxuICAgICAgICBsaWdodEJveERpdi5zdHlsZS50b3AgPSBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIDEwMCArICdweCc7XG4gICAgICAgIGxpZ2h0Qm94RGl2LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdzaG93aW5nIGxpZ2h0Ym94IHdpdGggJyArIGluc2VydENvbnRlbnQpO1xuXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uIGhpZGVMaWdodGJveCgpIHtcbiAgICAgICAgICAgIGxpZ2h0Qm94RGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH0sIDYwMDApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZExpZ2h0Qm94Q1NTKCkge1xuICAgICAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnXG4gICAgICAgIHN0eWxlLmlubmVySFRNTCA9ICcjbGlnaHRib3ggeyBtYXJnaW46IDcwcHggYXV0bzsgcGFkZGluZzogMjBweDsgYmFja2dyb3VuZDogI0QzRDFFQzsgYm9yZGVyLXJhZGl1czogNXB4OyB3aWR0aDogMjAwcHg7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgdHJhbnNpdGlvbjogYWxsIDVzIGVhc2UtaW4tb3V0OyBmb250LWZhbWlseTogVGFob21hLCBBcmlhbCwgc2Fucy1zZXJpZjsgfSc7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc3R5bGUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGlzcGxheUNvbnRlbnRJbkxpZ2h0Ym94LFxuICAgICAgICBhZGRMaWdodEJveENTU1xuICAgIH1cblxufSkoKTsiLCIvLyAgICAgVW5kZXJzY29yZS5qcyAxLjguM1xuLy8gICAgIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXG4vLyAgICAgKGMpIDIwMDktMjAxNSBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuLy8gICAgIFVuZGVyc2NvcmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5cbihmdW5jdGlvbigpIHtcblxuICAvLyBCYXNlbGluZSBzZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZXhwb3J0c2Agb24gdGhlIHNlcnZlci5cbiAgdmFyIHJvb3QgPSB0aGlzO1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBgX2AgdmFyaWFibGUuXG4gIHZhciBwcmV2aW91c1VuZGVyc2NvcmUgPSByb290Ll87XG5cbiAgLy8gU2F2ZSBieXRlcyBpbiB0aGUgbWluaWZpZWQgKGJ1dCBub3QgZ3ppcHBlZCkgdmVyc2lvbjpcbiAgdmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGUsIE9ialByb3RvID0gT2JqZWN0LnByb3RvdHlwZSwgRnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4gIC8vIENyZWF0ZSBxdWljayByZWZlcmVuY2UgdmFyaWFibGVzIGZvciBzcGVlZCBhY2Nlc3MgdG8gY29yZSBwcm90b3R5cGVzLlxuICB2YXJcbiAgICBwdXNoICAgICAgICAgICAgID0gQXJyYXlQcm90by5wdXNoLFxuICAgIHNsaWNlICAgICAgICAgICAgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgIHRvU3RyaW5nICAgICAgICAgPSBPYmpQcm90by50b1N0cmluZyxcbiAgICBoYXNPd25Qcm9wZXJ0eSAgID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbiAgLy8gQWxsICoqRUNNQVNjcmlwdCA1KiogbmF0aXZlIGZ1bmN0aW9uIGltcGxlbWVudGF0aW9ucyB0aGF0IHdlIGhvcGUgdG8gdXNlXG4gIC8vIGFyZSBkZWNsYXJlZCBoZXJlLlxuICB2YXJcbiAgICBuYXRpdmVJc0FycmF5ICAgICAgPSBBcnJheS5pc0FycmF5LFxuICAgIG5hdGl2ZUtleXMgICAgICAgICA9IE9iamVjdC5rZXlzLFxuICAgIG5hdGl2ZUJpbmQgICAgICAgICA9IEZ1bmNQcm90by5iaW5kLFxuICAgIG5hdGl2ZUNyZWF0ZSAgICAgICA9IE9iamVjdC5jcmVhdGU7XG5cbiAgLy8gTmFrZWQgZnVuY3Rpb24gcmVmZXJlbmNlIGZvciBzdXJyb2dhdGUtcHJvdG90eXBlLXN3YXBwaW5nLlxuICB2YXIgQ3RvciA9IGZ1bmN0aW9uKCl7fTtcblxuICAvLyBDcmVhdGUgYSBzYWZlIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yIHVzZSBiZWxvdy5cbiAgdmFyIF8gPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgXykgcmV0dXJuIG9iajtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgXykpIHJldHVybiBuZXcgXyhvYmopO1xuICAgIHRoaXMuX3dyYXBwZWQgPSBvYmo7XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgKipOb2RlLmpzKiosIHdpdGhcbiAgLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZSBvbGQgYHJlcXVpcmUoKWAgQVBJLiBJZiB3ZSdyZSBpblxuICAvLyB0aGUgYnJvd3NlciwgYWRkIGBfYCBhcyBhIGdsb2JhbCBvYmplY3QuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IF87XG4gICAgfVxuICAgIGV4cG9ydHMuXyA9IF87XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5fID0gXztcbiAgfVxuXG4gIC8vIEN1cnJlbnQgdmVyc2lvbi5cbiAgXy5WRVJTSU9OID0gJzEuOC4zJztcblxuICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZWZmaWNpZW50IChmb3IgY3VycmVudCBlbmdpbmVzKSB2ZXJzaW9uXG4gIC8vIG9mIHRoZSBwYXNzZWQtaW4gY2FsbGJhY2ssIHRvIGJlIHJlcGVhdGVkbHkgYXBwbGllZCBpbiBvdGhlciBVbmRlcnNjb3JlXG4gIC8vIGZ1bmN0aW9ucy5cbiAgdmFyIG9wdGltaXplQ2IgPSBmdW5jdGlvbihmdW5jLCBjb250ZXh0LCBhcmdDb3VudCkge1xuICAgIGlmIChjb250ZXh0ID09PSB2b2lkIDApIHJldHVybiBmdW5jO1xuICAgIHN3aXRjaCAoYXJnQ291bnQgPT0gbnVsbCA/IDMgOiBhcmdDb3VudCkge1xuICAgICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSk7XG4gICAgICB9O1xuICAgICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG90aGVyKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUsIG90aGVyKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCBhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBBIG1vc3RseS1pbnRlcm5hbCBmdW5jdGlvbiB0byBnZW5lcmF0ZSBjYWxsYmFja3MgdGhhdCBjYW4gYmUgYXBwbGllZFxuICAvLyB0byBlYWNoIGVsZW1lbnQgaW4gYSBjb2xsZWN0aW9uLCByZXR1cm5pbmcgdGhlIGRlc2lyZWQgcmVzdWx0IOKAlCBlaXRoZXJcbiAgLy8gaWRlbnRpdHksIGFuIGFyYml0cmFyeSBjYWxsYmFjaywgYSBwcm9wZXJ0eSBtYXRjaGVyLCBvciBhIHByb3BlcnR5IGFjY2Vzc29yLlxuICB2YXIgY2IgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIF8uaWRlbnRpdHk7XG4gICAgaWYgKF8uaXNGdW5jdGlvbih2YWx1ZSkpIHJldHVybiBvcHRpbWl6ZUNiKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCk7XG4gICAgaWYgKF8uaXNPYmplY3QodmFsdWUpKSByZXR1cm4gXy5tYXRjaGVyKHZhbHVlKTtcbiAgICByZXR1cm4gXy5wcm9wZXJ0eSh2YWx1ZSk7XG4gIH07XG4gIF8uaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBjYih2YWx1ZSwgY29udGV4dCwgSW5maW5pdHkpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhc3NpZ25lciBmdW5jdGlvbnMuXG4gIHZhciBjcmVhdGVBc3NpZ25lciA9IGZ1bmN0aW9uKGtleXNGdW5jLCB1bmRlZmluZWRPbmx5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICBpZiAobGVuZ3RoIDwgMiB8fCBvYmogPT0gbnVsbCkgcmV0dXJuIG9iajtcbiAgICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF0sXG4gICAgICAgICAgICBrZXlzID0ga2V5c0Z1bmMoc291cmNlKSxcbiAgICAgICAgICAgIGwgPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoIXVuZGVmaW5lZE9ubHkgfHwgb2JqW2tleV0gPT09IHZvaWQgMCkgb2JqW2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhIG5ldyBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIGFub3RoZXIuXG4gIHZhciBiYXNlQ3JlYXRlID0gZnVuY3Rpb24ocHJvdG90eXBlKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KHByb3RvdHlwZSkpIHJldHVybiB7fTtcbiAgICBpZiAobmF0aXZlQ3JlYXRlKSByZXR1cm4gbmF0aXZlQ3JlYXRlKHByb3RvdHlwZSk7XG4gICAgQ3Rvci5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBDdG9yO1xuICAgIEN0b3IucHJvdG90eXBlID0gbnVsbDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIHZhciBwcm9wZXJ0eSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogPT0gbnVsbCA/IHZvaWQgMCA6IG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gSGVscGVyIGZvciBjb2xsZWN0aW9uIG1ldGhvZHMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBjb2xsZWN0aW9uXG4gIC8vIHNob3VsZCBiZSBpdGVyYXRlZCBhcyBhbiBhcnJheSBvciBhcyBhbiBvYmplY3RcbiAgLy8gUmVsYXRlZDogaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtdG9sZW5ndGhcbiAgLy8gQXZvaWRzIGEgdmVyeSBuYXN0eSBpT1MgOCBKSVQgYnVnIG9uIEFSTS02NC4gIzIwOTRcbiAgdmFyIE1BWF9BUlJBWV9JTkRFWCA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gIHZhciBnZXRMZW5ndGggPSBwcm9wZXJ0eSgnbGVuZ3RoJyk7XG4gIHZhciBpc0FycmF5TGlrZSA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24pIHtcbiAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGNvbGxlY3Rpb24pO1xuICAgIHJldHVybiB0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInICYmIGxlbmd0aCA+PSAwICYmIGxlbmd0aCA8PSBNQVhfQVJSQVlfSU5ERVg7XG4gIH07XG5cbiAgLy8gQ29sbGVjdGlvbiBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBUaGUgY29ybmVyc3RvbmUsIGFuIGBlYWNoYCBpbXBsZW1lbnRhdGlvbiwgYWthIGBmb3JFYWNoYC5cbiAgLy8gSGFuZGxlcyByYXcgb2JqZWN0cyBpbiBhZGRpdGlvbiB0byBhcnJheS1saWtlcy4gVHJlYXRzIGFsbFxuICAvLyBzcGFyc2UgYXJyYXktbGlrZXMgYXMgaWYgdGhleSB3ZXJlIGRlbnNlLlxuICBfLmVhY2ggPSBfLmZvckVhY2ggPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIgaSwgbGVuZ3RoO1xuICAgIGlmIChpc0FycmF5TGlrZShvYmopKSB7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2ldLCBpLCBvYmopO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRlZShvYmpba2V5c1tpXV0sIGtleXNbaV0sIG9iaik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQuXG4gIF8ubWFwID0gXy5jb2xsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICByZXN1bHRzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgcmVzdWx0c1tpbmRleF0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIHJlZHVjaW5nIGZ1bmN0aW9uIGl0ZXJhdGluZyBsZWZ0IG9yIHJpZ2h0LlxuICBmdW5jdGlvbiBjcmVhdGVSZWR1Y2UoZGlyKSB7XG4gICAgLy8gT3B0aW1pemVkIGl0ZXJhdG9yIGZ1bmN0aW9uIGFzIHVzaW5nIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAvLyBpbiB0aGUgbWFpbiBmdW5jdGlvbiB3aWxsIGRlb3B0aW1pemUgdGhlLCBzZWUgIzE5OTEuXG4gICAgZnVuY3Rpb24gaXRlcmF0b3Iob2JqLCBpdGVyYXRlZSwgbWVtbywga2V5cywgaW5kZXgsIGxlbmd0aCkge1xuICAgICAgZm9yICg7IGluZGV4ID49IDAgJiYgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IGRpcikge1xuICAgICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgICBtZW1vID0gaXRlcmF0ZWUobWVtbywgb2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGNvbnRleHQpIHtcbiAgICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwgY29udGV4dCwgNCk7XG4gICAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICAgIGluZGV4ID0gZGlyID4gMCA/IDAgOiBsZW5ndGggLSAxO1xuICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBpbml0aWFsIHZhbHVlIGlmIG5vbmUgaXMgcHJvdmlkZWQuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgbWVtbyA9IG9ialtrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleF07XG4gICAgICAgIGluZGV4ICs9IGRpcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpdGVyYXRvcihvYmosIGl0ZXJhdGVlLCBtZW1vLCBrZXlzLCBpbmRleCwgbGVuZ3RoKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gKipSZWR1Y2UqKiBidWlsZHMgdXAgYSBzaW5nbGUgcmVzdWx0IGZyb20gYSBsaXN0IG9mIHZhbHVlcywgYWthIGBpbmplY3RgLFxuICAvLyBvciBgZm9sZGxgLlxuICBfLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGNyZWF0ZVJlZHVjZSgxKTtcblxuICAvLyBUaGUgcmlnaHQtYXNzb2NpYXRpdmUgdmVyc2lvbiBvZiByZWR1Y2UsIGFsc28ga25vd24gYXMgYGZvbGRyYC5cbiAgXy5yZWR1Y2VSaWdodCA9IF8uZm9sZHIgPSBjcmVhdGVSZWR1Y2UoLTEpO1xuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgdmFsdWUgd2hpY2ggcGFzc2VzIGEgdHJ1dGggdGVzdC4gQWxpYXNlZCBhcyBgZGV0ZWN0YC5cbiAgXy5maW5kID0gXy5kZXRlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBrZXk7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHtcbiAgICAgIGtleSA9IF8uZmluZEluZGV4KG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAga2V5ID0gXy5maW5kS2V5KG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB9XG4gICAgaWYgKGtleSAhPT0gdm9pZCAwICYmIGtleSAhPT0gLTEpIHJldHVybiBvYmpba2V5XTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyB0aGF0IHBhc3MgYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBzZWxlY3RgLlxuICBfLmZpbHRlciA9IF8uc2VsZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgZm9yIHdoaWNoIGEgdHJ1dGggdGVzdCBmYWlscy5cbiAgXy5yZWplY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIF8ubmVnYXRlKGNiKHByZWRpY2F0ZSkpLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgd2hldGhlciBhbGwgb2YgdGhlIGVsZW1lbnRzIG1hdGNoIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgYWxsYC5cbiAgXy5ldmVyeSA9IF8uYWxsID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBpZiAoIXByZWRpY2F0ZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGF0IGxlYXN0IG9uZSBlbGVtZW50IGluIHRoZSBvYmplY3QgbWF0Y2hlcyBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYGFueWAuXG4gIF8uc29tZSA9IF8uYW55ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBpZiAocHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGFycmF5IG9yIG9iamVjdCBjb250YWlucyBhIGdpdmVuIGl0ZW0gKHVzaW5nIGA9PT1gKS5cbiAgLy8gQWxpYXNlZCBhcyBgaW5jbHVkZXNgIGFuZCBgaW5jbHVkZWAuXG4gIF8uY29udGFpbnMgPSBfLmluY2x1ZGVzID0gXy5pbmNsdWRlID0gZnVuY3Rpb24ob2JqLCBpdGVtLCBmcm9tSW5kZXgsIGd1YXJkKSB7XG4gICAgaWYgKCFpc0FycmF5TGlrZShvYmopKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgIGlmICh0eXBlb2YgZnJvbUluZGV4ICE9ICdudW1iZXInIHx8IGd1YXJkKSBmcm9tSW5kZXggPSAwO1xuICAgIHJldHVybiBfLmluZGV4T2Yob2JqLCBpdGVtLCBmcm9tSW5kZXgpID49IDA7XG4gIH07XG5cbiAgLy8gSW52b2tlIGEgbWV0aG9kICh3aXRoIGFyZ3VtZW50cykgb24gZXZlcnkgaXRlbSBpbiBhIGNvbGxlY3Rpb24uXG4gIF8uaW52b2tlID0gZnVuY3Rpb24ob2JqLCBtZXRob2QpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgaXNGdW5jID0gXy5pc0Z1bmN0aW9uKG1ldGhvZCk7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhciBmdW5jID0gaXNGdW5jID8gbWV0aG9kIDogdmFsdWVbbWV0aG9kXTtcbiAgICAgIHJldHVybiBmdW5jID09IG51bGwgPyBmdW5jIDogZnVuYy5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgbWFwYDogZmV0Y2hpbmcgYSBwcm9wZXJ0eS5cbiAgXy5wbHVjayA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgXy5wcm9wZXJ0eShrZXkpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaWx0ZXJgOiBzZWxlY3Rpbmcgb25seSBvYmplY3RzXG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ud2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5tYXRjaGVyKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmluZGA6IGdldHRpbmcgdGhlIGZpcnN0IG9iamVjdFxuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmZpbmRXaGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maW5kKG9iaiwgXy5tYXRjaGVyKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtYXhpbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gLUluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSAtSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgb2JqID0gaXNBcnJheUxpa2Uob2JqKSA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgPiByZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICAgIGlmIChjb21wdXRlZCA+IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gLUluZmluaXR5ICYmIHJlc3VsdCA9PT0gLUluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IEluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSBJbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBpc0FycmF5TGlrZShvYmopID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGlmICh2YWx1ZSA8IHJlc3VsdCkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkIDwgbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSBJbmZpbml0eSAmJiByZXN1bHQgPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFNodWZmbGUgYSBjb2xsZWN0aW9uLCB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlXG4gIC8vIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXLigJNZYXRlc19zaHVmZmxlKS5cbiAgXy5zaHVmZmxlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHNldCA9IGlzQXJyYXlMaWtlKG9iaikgPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBzZXQubGVuZ3RoO1xuICAgIHZhciBzaHVmZmxlZCA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwLCByYW5kOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgcmFuZCA9IF8ucmFuZG9tKDAsIGluZGV4KTtcbiAgICAgIGlmIChyYW5kICE9PSBpbmRleCkgc2h1ZmZsZWRbaW5kZXhdID0gc2h1ZmZsZWRbcmFuZF07XG4gICAgICBzaHVmZmxlZFtyYW5kXSA9IHNldFtpbmRleF07XG4gICAgfVxuICAgIHJldHVybiBzaHVmZmxlZDtcbiAgfTtcblxuICAvLyBTYW1wbGUgKipuKiogcmFuZG9tIHZhbHVlcyBmcm9tIGEgY29sbGVjdGlvbi5cbiAgLy8gSWYgKipuKiogaXMgbm90IHNwZWNpZmllZCwgcmV0dXJucyBhIHNpbmdsZSByYW5kb20gZWxlbWVudC5cbiAgLy8gVGhlIGludGVybmFsIGBndWFyZGAgYXJndW1lbnQgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgbWFwYC5cbiAgXy5zYW1wbGUgPSBmdW5jdGlvbihvYmosIG4sIGd1YXJkKSB7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkge1xuICAgICAgaWYgKCFpc0FycmF5TGlrZShvYmopKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgICAgcmV0dXJuIG9ialtfLnJhbmRvbShvYmoubGVuZ3RoIC0gMSldO1xuICAgIH1cbiAgICByZXR1cm4gXy5zaHVmZmxlKG9iaikuc2xpY2UoMCwgTWF0aC5tYXgoMCwgbikpO1xuICB9O1xuXG4gIC8vIFNvcnQgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiBwcm9kdWNlZCBieSBhbiBpdGVyYXRlZS5cbiAgXy5zb3J0QnkgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgcmV0dXJuIF8ucGx1Y2soXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICBjcml0ZXJpYTogaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KVxuICAgICAgfTtcbiAgICB9KS5zb3J0KGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWE7XG4gICAgICB2YXIgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgaWYgKGEgPiBiIHx8IGEgPT09IHZvaWQgMCkgcmV0dXJuIDE7XG4gICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsZWZ0LmluZGV4IC0gcmlnaHQuaW5kZXg7XG4gICAgfSksICd2YWx1ZScpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cbiAgdmFyIGdyb3VwID0gZnVuY3Rpb24oYmVoYXZpb3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGtleSA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgb2JqKTtcbiAgICAgICAgYmVoYXZpb3IocmVzdWx0LCB2YWx1ZSwga2V5KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEdyb3VwcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLiBQYXNzIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGVcbiAgLy8gdG8gZ3JvdXAgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBjcml0ZXJpb24uXG4gIF8uZ3JvdXBCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChfLmhhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldLnB1c2godmFsdWUpOyBlbHNlIHJlc3VsdFtrZXldID0gW3ZhbHVlXTtcbiAgfSk7XG5cbiAgLy8gSW5kZXhlcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLCBzaW1pbGFyIHRvIGBncm91cEJ5YCwgYnV0IGZvclxuICAvLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUuXG4gIF8uaW5kZXhCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIENvdW50cyBpbnN0YW5jZXMgb2YgYW4gb2JqZWN0IHRoYXQgZ3JvdXAgYnkgYSBjZXJ0YWluIGNyaXRlcmlvbi4gUGFzc1xuICAvLyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlIHRvIGNvdW50IGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgLy8gY3JpdGVyaW9uLlxuICBfLmNvdW50QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICBpZiAoXy5oYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XSsrOyBlbHNlIHJlc3VsdFtrZXldID0gMTtcbiAgfSk7XG5cbiAgLy8gU2FmZWx5IGNyZWF0ZSBhIHJlYWwsIGxpdmUgYXJyYXkgZnJvbSBhbnl0aGluZyBpdGVyYWJsZS5cbiAgXy50b0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiBbXTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHJldHVybiBzbGljZS5jYWxsKG9iaik7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHJldHVybiBfLm1hcChvYmosIF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBfLnZhbHVlcyhvYmopO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIGFuIG9iamVjdC5cbiAgXy5zaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gMDtcbiAgICByZXR1cm4gaXNBcnJheUxpa2Uob2JqKSA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gU3BsaXQgYSBjb2xsZWN0aW9uIGludG8gdHdvIGFycmF5czogb25lIHdob3NlIGVsZW1lbnRzIGFsbCBzYXRpc2Z5IHRoZSBnaXZlblxuICAvLyBwcmVkaWNhdGUsIGFuZCBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIGRvIG5vdCBzYXRpc2Z5IHRoZSBwcmVkaWNhdGUuXG4gIF8ucGFydGl0aW9uID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBwYXNzID0gW10sIGZhaWwgPSBbXTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBvYmopIHtcbiAgICAgIChwcmVkaWNhdGUodmFsdWUsIGtleSwgb2JqKSA/IHBhc3MgOiBmYWlsKS5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW3Bhc3MsIGZhaWxdO1xuICB9O1xuXG4gIC8vIEFycmF5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBHZXQgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGZpcnN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgaGVhZGAgYW5kIGB0YWtlYC4gVGhlICoqZ3VhcmQqKiBjaGVja1xuICAvLyBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8uZmlyc3QgPSBfLmhlYWQgPSBfLnRha2UgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbMF07XG4gICAgcmV0dXJuIF8uaW5pdGlhbChhcnJheSwgYXJyYXkubGVuZ3RoIC0gbik7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4gIC8vIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIGFsbCB0aGUgdmFsdWVzIGluXG4gIC8vIHRoZSBhcnJheSwgZXhjbHVkaW5nIHRoZSBsYXN0IE4uXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBNYXRoLm1heCgwLCBhcnJheS5sZW5ndGggLSAobiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICBfLmxhc3QgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIF8ucmVzdChhcnJheSwgTWF0aC5tYXgoMCwgYXJyYXkubGVuZ3RoIC0gbikpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgdGFpbGAgYW5kIGBkcm9wYC5cbiAgLy8gRXNwZWNpYWxseSB1c2VmdWwgb24gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgYW4gKipuKiogd2lsbCByZXR1cm5cbiAgLy8gdGhlIHJlc3QgTiB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICBfLnJlc3QgPSBfLnRhaWwgPSBfLmRyb3AgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgbiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pO1xuICB9O1xuXG4gIC8vIFRyaW0gb3V0IGFsbCBmYWxzeSB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAgXy5jb21wYWN0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIF8uaWRlbnRpdHkpO1xuICB9O1xuXG4gIC8vIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGEgcmVjdXJzaXZlIGBmbGF0dGVuYCBmdW5jdGlvbi5cbiAgdmFyIGZsYXR0ZW4gPSBmdW5jdGlvbihpbnB1dCwgc2hhbGxvdywgc3RyaWN0LCBzdGFydEluZGV4KSB7XG4gICAgdmFyIG91dHB1dCA9IFtdLCBpZHggPSAwO1xuICAgIGZvciAodmFyIGkgPSBzdGFydEluZGV4IHx8IDAsIGxlbmd0aCA9IGdldExlbmd0aChpbnB1dCk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gaW5wdXRbaV07XG4gICAgICBpZiAoaXNBcnJheUxpa2UodmFsdWUpICYmIChfLmlzQXJyYXkodmFsdWUpIHx8IF8uaXNBcmd1bWVudHModmFsdWUpKSkge1xuICAgICAgICAvL2ZsYXR0ZW4gY3VycmVudCBsZXZlbCBvZiBhcnJheSBvciBhcmd1bWVudHMgb2JqZWN0XG4gICAgICAgIGlmICghc2hhbGxvdykgdmFsdWUgPSBmbGF0dGVuKHZhbHVlLCBzaGFsbG93LCBzdHJpY3QpO1xuICAgICAgICB2YXIgaiA9IDAsIGxlbiA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgb3V0cHV0Lmxlbmd0aCArPSBsZW47XG4gICAgICAgIHdoaWxlIChqIDwgbGVuKSB7XG4gICAgICAgICAgb3V0cHV0W2lkeCsrXSA9IHZhbHVlW2orK107XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIXN0cmljdCkge1xuICAgICAgICBvdXRwdXRbaWR4KytdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG5cbiAgLy8gRmxhdHRlbiBvdXQgYW4gYXJyYXksIGVpdGhlciByZWN1cnNpdmVseSAoYnkgZGVmYXVsdCksIG9yIGp1c3Qgb25lIGxldmVsLlxuICBfLmZsYXR0ZW4gPSBmdW5jdGlvbihhcnJheSwgc2hhbGxvdykge1xuICAgIHJldHVybiBmbGF0dGVuKGFycmF5LCBzaGFsbG93LCBmYWxzZSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGUgYXJyYXkgdGhhdCBkb2VzIG5vdCBjb250YWluIHRoZSBzcGVjaWZpZWQgdmFsdWUocykuXG4gIF8ud2l0aG91dCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZGlmZmVyZW5jZShhcnJheSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGEgZHVwbGljYXRlLWZyZWUgdmVyc2lvbiBvZiB0aGUgYXJyYXkuIElmIHRoZSBhcnJheSBoYXMgYWxyZWFkeVxuICAvLyBiZWVuIHNvcnRlZCwgeW91IGhhdmUgdGhlIG9wdGlvbiBvZiB1c2luZyBhIGZhc3RlciBhbGdvcml0aG0uXG4gIC8vIEFsaWFzZWQgYXMgYHVuaXF1ZWAuXG4gIF8udW5pcSA9IF8udW5pcXVlID0gZnVuY3Rpb24oYXJyYXksIGlzU29ydGVkLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmICghXy5pc0Jvb2xlYW4oaXNTb3J0ZWQpKSB7XG4gICAgICBjb250ZXh0ID0gaXRlcmF0ZWU7XG4gICAgICBpdGVyYXRlZSA9IGlzU29ydGVkO1xuICAgICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGl0ZXJhdGVlICE9IG51bGwpIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2ldLFxuICAgICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUgPyBpdGVyYXRlZSh2YWx1ZSwgaSwgYXJyYXkpIDogdmFsdWU7XG4gICAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgICAgaWYgKCFpIHx8IHNlZW4gIT09IGNvbXB1dGVkKSByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIHNlZW4gPSBjb21wdXRlZDtcbiAgICAgIH0gZWxzZSBpZiAoaXRlcmF0ZWUpIHtcbiAgICAgICAgaWYgKCFfLmNvbnRhaW5zKHNlZW4sIGNvbXB1dGVkKSkge1xuICAgICAgICAgIHNlZW4ucHVzaChjb21wdXRlZCk7XG4gICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFfLmNvbnRhaW5zKHJlc3VsdCwgdmFsdWUpKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIHVuaW9uOiBlYWNoIGRpc3RpbmN0IGVsZW1lbnQgZnJvbSBhbGwgb2ZcbiAgLy8gdGhlIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8udW5pb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy51bmlxKGZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCB0cnVlKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIGV2ZXJ5IGl0ZW0gc2hhcmVkIGJldHdlZW4gYWxsIHRoZVxuICAvLyBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLmludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBhcmdzTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IGFycmF5W2ldO1xuICAgICAgaWYgKF8uY29udGFpbnMocmVzdWx0LCBpdGVtKSkgY29udGludWU7XG4gICAgICBmb3IgKHZhciBqID0gMTsgaiA8IGFyZ3NMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAoIV8uY29udGFpbnMoYXJndW1lbnRzW2pdLCBpdGVtKSkgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoaiA9PT0gYXJnc0xlbmd0aCkgcmVzdWx0LnB1c2goaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gVGFrZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIG9uZSBhcnJheSBhbmQgYSBudW1iZXIgb2Ygb3RoZXIgYXJyYXlzLlxuICAvLyBPbmx5IHRoZSBlbGVtZW50cyBwcmVzZW50IGluIGp1c3QgdGhlIGZpcnN0IGFycmF5IHdpbGwgcmVtYWluLlxuICBfLmRpZmZlcmVuY2UgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gZmxhdHRlbihhcmd1bWVudHMsIHRydWUsIHRydWUsIDEpO1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgcmV0dXJuICFfLmNvbnRhaW5zKHJlc3QsIHZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBaaXAgdG9nZXRoZXIgbXVsdGlwbGUgbGlzdHMgaW50byBhIHNpbmdsZSBhcnJheSAtLSBlbGVtZW50cyB0aGF0IHNoYXJlXG4gIC8vIGFuIGluZGV4IGdvIHRvZ2V0aGVyLlxuICBfLnppcCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnVuemlwKGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLy8gQ29tcGxlbWVudCBvZiBfLnppcC4gVW56aXAgYWNjZXB0cyBhbiBhcnJheSBvZiBhcnJheXMgYW5kIGdyb3Vwc1xuICAvLyBlYWNoIGFycmF5J3MgZWxlbWVudHMgb24gc2hhcmVkIGluZGljZXNcbiAgXy51bnppcCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIGxlbmd0aCA9IGFycmF5ICYmIF8ubWF4KGFycmF5LCBnZXRMZW5ndGgpLmxlbmd0aCB8fCAwO1xuICAgIHZhciByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgcmVzdWx0W2luZGV4XSA9IF8ucGx1Y2soYXJyYXksIGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgobGlzdCk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICByZXN1bHRbbGlzdFtpXV0gPSB2YWx1ZXNbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRbbGlzdFtpXVswXV0gPSBsaXN0W2ldWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIEdlbmVyYXRvciBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIGZpbmRJbmRleCBhbmQgZmluZExhc3RJbmRleCBmdW5jdGlvbnNcbiAgZnVuY3Rpb24gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoZGlyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFycmF5LCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICAgIHZhciBpbmRleCA9IGRpciA+IDAgPyAwIDogbGVuZ3RoIC0gMTtcbiAgICAgIGZvciAoOyBpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSBkaXIpIHtcbiAgICAgICAgaWYgKHByZWRpY2F0ZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHJldHVybiBpbmRleDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgaW5kZXggb24gYW4gYXJyYXktbGlrZSB0aGF0IHBhc3NlcyBhIHByZWRpY2F0ZSB0ZXN0XG4gIF8uZmluZEluZGV4ID0gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoMSk7XG4gIF8uZmluZExhc3RJbmRleCA9IGNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyKC0xKTtcblxuICAvLyBVc2UgYSBjb21wYXJhdG9yIGZ1bmN0aW9uIHRvIGZpZ3VyZSBvdXQgdGhlIHNtYWxsZXN0IGluZGV4IGF0IHdoaWNoXG4gIC8vIGFuIG9iamVjdCBzaG91bGQgYmUgaW5zZXJ0ZWQgc28gYXMgdG8gbWFpbnRhaW4gb3JkZXIuIFVzZXMgYmluYXJ5IHNlYXJjaC5cbiAgXy5zb3J0ZWRJbmRleCA9IGZ1bmN0aW9uKGFycmF5LCBvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCwgMSk7XG4gICAgdmFyIHZhbHVlID0gaXRlcmF0ZWUob2JqKTtcbiAgICB2YXIgbG93ID0gMCwgaGlnaCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgIHZhciBtaWQgPSBNYXRoLmZsb29yKChsb3cgKyBoaWdoKSAvIDIpO1xuICAgICAgaWYgKGl0ZXJhdGVlKGFycmF5W21pZF0pIDwgdmFsdWUpIGxvdyA9IG1pZCArIDE7IGVsc2UgaGlnaCA9IG1pZDtcbiAgICB9XG4gICAgcmV0dXJuIGxvdztcbiAgfTtcblxuICAvLyBHZW5lcmF0b3IgZnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBpbmRleE9mIGFuZCBsYXN0SW5kZXhPZiBmdW5jdGlvbnNcbiAgZnVuY3Rpb24gY3JlYXRlSW5kZXhGaW5kZXIoZGlyLCBwcmVkaWNhdGVGaW5kLCBzb3J0ZWRJbmRleCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhcnJheSwgaXRlbSwgaWR4KSB7XG4gICAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgICBpZiAodHlwZW9mIGlkeCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoZGlyID4gMCkge1xuICAgICAgICAgICAgaSA9IGlkeCA+PSAwID8gaWR4IDogTWF0aC5tYXgoaWR4ICsgbGVuZ3RoLCBpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlbmd0aCA9IGlkeCA+PSAwID8gTWF0aC5taW4oaWR4ICsgMSwgbGVuZ3RoKSA6IGlkeCArIGxlbmd0aCArIDE7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc29ydGVkSW5kZXggJiYgaWR4ICYmIGxlbmd0aCkge1xuICAgICAgICBpZHggPSBzb3J0ZWRJbmRleChhcnJheSwgaXRlbSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpZHhdID09PSBpdGVtID8gaWR4IDogLTE7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbSAhPT0gaXRlbSkge1xuICAgICAgICBpZHggPSBwcmVkaWNhdGVGaW5kKHNsaWNlLmNhbGwoYXJyYXksIGksIGxlbmd0aCksIF8uaXNOYU4pO1xuICAgICAgICByZXR1cm4gaWR4ID49IDAgPyBpZHggKyBpIDogLTE7XG4gICAgICB9XG4gICAgICBmb3IgKGlkeCA9IGRpciA+IDAgPyBpIDogbGVuZ3RoIC0gMTsgaWR4ID49IDAgJiYgaWR4IDwgbGVuZ3RoOyBpZHggKz0gZGlyKSB7XG4gICAgICAgIGlmIChhcnJheVtpZHhdID09PSBpdGVtKSByZXR1cm4gaWR4O1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuIGl0ZW0gaW4gYW4gYXJyYXksXG4gIC8vIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigxLCBfLmZpbmRJbmRleCwgXy5zb3J0ZWRJbmRleCk7XG4gIF8ubGFzdEluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigtMSwgXy5maW5kTGFzdEluZGV4KTtcblxuICAvLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXG4gIC8vIHRoZSBuYXRpdmUgUHl0aG9uIGByYW5nZSgpYCBmdW5jdGlvbi4gU2VlXG4gIC8vIFt0aGUgUHl0aG9uIGRvY3VtZW50YXRpb25dKGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS9mdW5jdGlvbnMuaHRtbCNyYW5nZSkuXG4gIF8ucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIGlmIChzdG9wID09IG51bGwpIHtcbiAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBzdGVwID0gc3RlcCB8fCAxO1xuXG4gICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgICB2YXIgcmFuZ2UgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgbGVuZ3RoOyBpZHgrKywgc3RhcnQgKz0gc3RlcCkge1xuICAgICAgcmFuZ2VbaWR4XSA9IHN0YXJ0O1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiAoYWhlbSkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIERldGVybWluZXMgd2hldGhlciB0byBleGVjdXRlIGEgZnVuY3Rpb24gYXMgYSBjb25zdHJ1Y3RvclxuICAvLyBvciBhIG5vcm1hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm92aWRlZCBhcmd1bWVudHNcbiAgdmFyIGV4ZWN1dGVCb3VuZCA9IGZ1bmN0aW9uKHNvdXJjZUZ1bmMsIGJvdW5kRnVuYywgY29udGV4dCwgY2FsbGluZ0NvbnRleHQsIGFyZ3MpIHtcbiAgICBpZiAoIShjYWxsaW5nQ29udGV4dCBpbnN0YW5jZW9mIGJvdW5kRnVuYykpIHJldHVybiBzb3VyY2VGdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIHZhciBzZWxmID0gYmFzZUNyZWF0ZShzb3VyY2VGdW5jLnByb3RvdHlwZSk7XG4gICAgdmFyIHJlc3VsdCA9IHNvdXJjZUZ1bmMuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgaWYgKF8uaXNPYmplY3QocmVzdWx0KSkgcmV0dXJuIHJlc3VsdDtcbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBib3VuZCB0byBhIGdpdmVuIG9iamVjdCAoYXNzaWduaW5nIGB0aGlzYCwgYW5kIGFyZ3VtZW50cyxcbiAgLy8gb3B0aW9uYWxseSkuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBGdW5jdGlvbi5iaW5kYCBpZlxuICAvLyBhdmFpbGFibGUuXG4gIF8uYmluZCA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQpIHtcbiAgICBpZiAobmF0aXZlQmluZCAmJiBmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQpIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZnVuYykpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JpbmQgbXVzdCBiZSBjYWxsZWQgb24gYSBmdW5jdGlvbicpO1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBib3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4ZWN1dGVCb3VuZChmdW5jLCBib3VuZCwgY29udGV4dCwgdGhpcywgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgfTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH07XG5cbiAgLy8gUGFydGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gYnkgY3JlYXRpbmcgYSB2ZXJzaW9uIHRoYXQgaGFzIGhhZCBzb21lIG9mIGl0c1xuICAvLyBhcmd1bWVudHMgcHJlLWZpbGxlZCwgd2l0aG91dCBjaGFuZ2luZyBpdHMgZHluYW1pYyBgdGhpc2AgY29udGV4dC4gXyBhY3RzXG4gIC8vIGFzIGEgcGxhY2Vob2xkZXIsIGFsbG93aW5nIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMgdG8gYmUgcHJlLWZpbGxlZC5cbiAgXy5wYXJ0aWFsID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciBib3VuZEFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAwLCBsZW5ndGggPSBib3VuZEFyZ3MubGVuZ3RoO1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheShsZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBhcmdzW2ldID0gYm91bmRBcmdzW2ldID09PSBfID8gYXJndW1lbnRzW3Bvc2l0aW9uKytdIDogYm91bmRBcmdzW2ldO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgYXJndW1lbnRzLmxlbmd0aCkgYXJncy5wdXNoKGFyZ3VtZW50c1twb3NpdGlvbisrXSk7XG4gICAgICByZXR1cm4gZXhlY3V0ZUJvdW5kKGZ1bmMsIGJvdW5kLCB0aGlzLCB0aGlzLCBhcmdzKTtcbiAgICB9O1xuICAgIHJldHVybiBib3VuZDtcbiAgfTtcblxuICAvLyBCaW5kIGEgbnVtYmVyIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFJlbWFpbmluZyBhcmd1bWVudHNcbiAgLy8gYXJlIHRoZSBtZXRob2QgbmFtZXMgdG8gYmUgYm91bmQuIFVzZWZ1bCBmb3IgZW5zdXJpbmcgdGhhdCBhbGwgY2FsbGJhY2tzXG4gIC8vIGRlZmluZWQgb24gYW4gb2JqZWN0IGJlbG9uZyB0byBpdC5cbiAgXy5iaW5kQWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGksIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsIGtleTtcbiAgICBpZiAobGVuZ3RoIDw9IDEpIHRocm93IG5ldyBFcnJvcignYmluZEFsbCBtdXN0IGJlIHBhc3NlZCBmdW5jdGlvbiBuYW1lcycpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0gYXJndW1lbnRzW2ldO1xuICAgICAgb2JqW2tleV0gPSBfLmJpbmQob2JqW2tleV0sIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gTWVtb2l6ZSBhbiBleHBlbnNpdmUgZnVuY3Rpb24gYnkgc3RvcmluZyBpdHMgcmVzdWx0cy5cbiAgXy5tZW1vaXplID0gZnVuY3Rpb24oZnVuYywgaGFzaGVyKSB7XG4gICAgdmFyIG1lbW9pemUgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBjYWNoZSA9IG1lbW9pemUuY2FjaGU7XG4gICAgICB2YXIgYWRkcmVzcyA9ICcnICsgKGhhc2hlciA/IGhhc2hlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDoga2V5KTtcbiAgICAgIGlmICghXy5oYXMoY2FjaGUsIGFkZHJlc3MpKSBjYWNoZVthZGRyZXNzXSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBjYWNoZVthZGRyZXNzXTtcbiAgICB9O1xuICAgIG1lbW9pemUuY2FjaGUgPSB7fTtcbiAgICByZXR1cm4gbWVtb2l6ZTtcbiAgfTtcblxuICAvLyBEZWxheXMgYSBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIGFuZCB0aGVuIGNhbGxzXG4gIC8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbiAgXy5kZWxheSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfSwgd2FpdCk7XG4gIH07XG5cbiAgLy8gRGVmZXJzIGEgZnVuY3Rpb24sIHNjaGVkdWxpbmcgaXQgdG8gcnVuIGFmdGVyIHRoZSBjdXJyZW50IGNhbGwgc3RhY2sgaGFzXG4gIC8vIGNsZWFyZWQuXG4gIF8uZGVmZXIgPSBfLnBhcnRpYWwoXy5kZWxheSwgXywgMSk7XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWQgYXQgbW9zdCBvbmNlXG4gIC8vIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLiBOb3JtYWxseSwgdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsIHJ1blxuICAvLyBhcyBtdWNoIGFzIGl0IGNhbiwgd2l0aG91dCBldmVyIGdvaW5nIG1vcmUgdGhhbiBvbmNlIHBlciBgd2FpdGAgZHVyYXRpb247XG4gIC8vIGJ1dCBpZiB5b3UnZCBsaWtlIHRvIGRpc2FibGUgdGhlIGV4ZWN1dGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlLCBwYXNzXG4gIC8vIGB7bGVhZGluZzogZmFsc2V9YC4gVG8gZGlzYWJsZSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2UsIGRpdHRvLlxuICBfLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgIHZhciBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XG4gICAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBwcmV2aW91cyA9IG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UgPyAwIDogXy5ub3coKTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5vdyA9IF8ubm93KCk7XG4gICAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHByZXZpb3VzID0gbm93O1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQpIHtcbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIGFzIGxvbmcgYXMgaXQgY29udGludWVzIHRvIGJlIGludm9rZWQsIHdpbGwgbm90XG4gIC8vIGJlIHRyaWdnZXJlZC4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGFmdGVyIGl0IHN0b3BzIGJlaW5nIGNhbGxlZCBmb3JcbiAgLy8gTiBtaWxsaXNlY29uZHMuIElmIGBpbW1lZGlhdGVgIGlzIHBhc3NlZCwgdHJpZ2dlciB0aGUgZnVuY3Rpb24gb24gdGhlXG4gIC8vIGxlYWRpbmcgZWRnZSwgaW5zdGVhZCBvZiB0aGUgdHJhaWxpbmcuXG4gIF8uZGVib3VuY2UgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dCwgYXJncywgY29udGV4dCwgdGltZXN0YW1wLCByZXN1bHQ7XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsYXN0ID0gXy5ub3coKSAtIHRpbWVzdGFtcDtcblxuICAgICAgaWYgKGxhc3QgPCB3YWl0ICYmIGxhc3QgPj0gMCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB0aW1lc3RhbXAgPSBfLm5vdygpO1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBpZiAoIXRpbWVvdXQpIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgIGlmIChjYWxsTm93KSB7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgc2Vjb25kLFxuICAvLyBhbGxvd2luZyB5b3UgdG8gYWRqdXN0IGFyZ3VtZW50cywgcnVuIGNvZGUgYmVmb3JlIGFuZCBhZnRlciwgYW5kXG4gIC8vIGNvbmRpdGlvbmFsbHkgZXhlY3V0ZSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24uXG4gIF8ud3JhcCA9IGZ1bmN0aW9uKGZ1bmMsIHdyYXBwZXIpIHtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKHdyYXBwZXIsIGZ1bmMpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBuZWdhdGVkIHZlcnNpb24gb2YgdGhlIHBhc3NlZC1pbiBwcmVkaWNhdGUuXG4gIF8ubmVnYXRlID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICFwcmVkaWNhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGlzIHRoZSBjb21wb3NpdGlvbiBvZiBhIGxpc3Qgb2YgZnVuY3Rpb25zLCBlYWNoXG4gIC8vIGNvbnN1bWluZyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0IGZvbGxvd3MuXG4gIF8uY29tcG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgIHZhciBzdGFydCA9IGFyZ3MubGVuZ3RoIC0gMTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSA9IHN0YXJ0O1xuICAgICAgdmFyIHJlc3VsdCA9IGFyZ3Nbc3RhcnRdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB3aGlsZSAoaS0tKSByZXN1bHQgPSBhcmdzW2ldLmNhbGwodGhpcywgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgb24gYW5kIGFmdGVyIHRoZSBOdGggY2FsbC5cbiAgXy5hZnRlciA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgdXAgdG8gKGJ1dCBub3QgaW5jbHVkaW5nKSB0aGUgTnRoIGNhbGwuXG4gIF8uYmVmb3JlID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICB2YXIgbWVtbztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA+IDApIHtcbiAgICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aW1lcyA8PSAxKSBmdW5jID0gbnVsbDtcbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCBtb3N0IG9uZSB0aW1lLCBubyBtYXR0ZXIgaG93XG4gIC8vIG9mdGVuIHlvdSBjYWxsIGl0LiBVc2VmdWwgZm9yIGxhenkgaW5pdGlhbGl6YXRpb24uXG4gIF8ub25jZSA9IF8ucGFydGlhbChfLmJlZm9yZSwgMik7XG5cbiAgLy8gT2JqZWN0IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gS2V5cyBpbiBJRSA8IDkgdGhhdCB3b24ndCBiZSBpdGVyYXRlZCBieSBgZm9yIGtleSBpbiAuLi5gIGFuZCB0aHVzIG1pc3NlZC5cbiAgdmFyIGhhc0VudW1CdWcgPSAhe3RvU3RyaW5nOiBudWxsfS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKTtcbiAgdmFyIG5vbkVudW1lcmFibGVQcm9wcyA9IFsndmFsdWVPZicsICdpc1Byb3RvdHlwZU9mJywgJ3RvU3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAncHJvcGVydHlJc0VudW1lcmFibGUnLCAnaGFzT3duUHJvcGVydHknLCAndG9Mb2NhbGVTdHJpbmcnXTtcblxuICBmdW5jdGlvbiBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cykge1xuICAgIHZhciBub25FbnVtSWR4ID0gbm9uRW51bWVyYWJsZVByb3BzLmxlbmd0aDtcbiAgICB2YXIgY29uc3RydWN0b3IgPSBvYmouY29uc3RydWN0b3I7XG4gICAgdmFyIHByb3RvID0gKF8uaXNGdW5jdGlvbihjb25zdHJ1Y3RvcikgJiYgY29uc3RydWN0b3IucHJvdG90eXBlKSB8fCBPYmpQcm90bztcblxuICAgIC8vIENvbnN0cnVjdG9yIGlzIGEgc3BlY2lhbCBjYXNlLlxuICAgIHZhciBwcm9wID0gJ2NvbnN0cnVjdG9yJztcbiAgICBpZiAoXy5oYXMob2JqLCBwcm9wKSAmJiAhXy5jb250YWlucyhrZXlzLCBwcm9wKSkga2V5cy5wdXNoKHByb3ApO1xuXG4gICAgd2hpbGUgKG5vbkVudW1JZHgtLSkge1xuICAgICAgcHJvcCA9IG5vbkVudW1lcmFibGVQcm9wc1tub25FbnVtSWR4XTtcbiAgICAgIGlmIChwcm9wIGluIG9iaiAmJiBvYmpbcHJvcF0gIT09IHByb3RvW3Byb3BdICYmICFfLmNvbnRhaW5zKGtleXMsIHByb3ApKSB7XG4gICAgICAgIGtleXMucHVzaChwcm9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSZXRyaWV2ZSB0aGUgbmFtZXMgb2YgYW4gb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBPYmplY3Qua2V5c2BcbiAgXy5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBbXTtcbiAgICBpZiAobmF0aXZlS2V5cykgcmV0dXJuIG5hdGl2ZUtleXMob2JqKTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICAgIC8vIEFoZW0sIElFIDwgOS5cbiAgICBpZiAoaGFzRW51bUJ1ZykgY29sbGVjdE5vbkVudW1Qcm9wcyhvYmosIGtleXMpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIGFsbCB0aGUgcHJvcGVydHkgbmFtZXMgb2YgYW4gb2JqZWN0LlxuICBfLmFsbEtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gICAgLy8gQWhlbSwgSUUgPCA5LlxuICAgIGlmIChoYXNFbnVtQnVnKSBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cyk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlc1tpXSA9IG9ialtrZXlzW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQgb2YgdGhlIG9iamVjdFxuICAvLyBJbiBjb250cmFzdCB0byBfLm1hcCBpdCByZXR1cm5zIGFuIG9iamVjdFxuICBfLm1hcE9iamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICBfLmtleXMob2JqKSxcbiAgICAgICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aCxcbiAgICAgICAgICByZXN1bHRzID0ge30sXG4gICAgICAgICAgY3VycmVudEtleTtcbiAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY3VycmVudEtleSA9IGtleXNbaW5kZXhdO1xuICAgICAgICByZXN1bHRzW2N1cnJlbnRLZXldID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ29udmVydCBhbiBvYmplY3QgaW50byBhIGxpc3Qgb2YgYFtrZXksIHZhbHVlXWAgcGFpcnMuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhaXJzW2ldID0gW2tleXNbaV0sIG9ialtrZXlzW2ldXV07XG4gICAgfVxuICAgIHJldHVybiBwYWlycztcbiAgfTtcblxuICAvLyBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gIF8uaW52ZXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtvYmpba2V5c1tpXV1dID0ga2V5c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBzb3J0ZWQgbGlzdCBvZiB0aGUgZnVuY3Rpb24gbmFtZXMgYXZhaWxhYmxlIG9uIHRoZSBvYmplY3QuXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgXG4gIF8uZnVuY3Rpb25zID0gXy5tZXRob2RzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIG5hbWVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihvYmpba2V5XSkpIG5hbWVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzLnNvcnQoKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIHByb3BlcnRpZXMgaW4gcGFzc2VkLWluIG9iamVjdChzKS5cbiAgXy5leHRlbmQgPSBjcmVhdGVBc3NpZ25lcihfLmFsbEtleXMpO1xuXG4gIC8vIEFzc2lnbnMgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIG93biBwcm9wZXJ0aWVzIGluIHRoZSBwYXNzZWQtaW4gb2JqZWN0KHMpXG4gIC8vIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvYXNzaWduKVxuICBfLmV4dGVuZE93biA9IF8uYXNzaWduID0gY3JlYXRlQXNzaWduZXIoXy5rZXlzKTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBrZXkgb24gYW4gb2JqZWN0IHRoYXQgcGFzc2VzIGEgcHJlZGljYXRlIHRlc3RcbiAgXy5maW5kS2V5ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaiksIGtleTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2tleV0sIGtleSwgb2JqKSkgcmV0dXJuIGtleTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5waWNrID0gZnVuY3Rpb24ob2JqZWN0LCBvaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0ge30sIG9iaiA9IG9iamVjdCwgaXRlcmF0ZWUsIGtleXM7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChfLmlzRnVuY3Rpb24ob2l0ZXJhdGVlKSkge1xuICAgICAga2V5cyA9IF8uYWxsS2V5cyhvYmopO1xuICAgICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKG9pdGVyYXRlZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtleXMgPSBmbGF0dGVuKGFyZ3VtZW50cywgZmFsc2UsIGZhbHNlLCAxKTtcbiAgICAgIGl0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqKSB7IHJldHVybiBrZXkgaW4gb2JqOyB9O1xuICAgICAgb2JqID0gT2JqZWN0KG9iaik7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgIHZhciB2YWx1ZSA9IG9ialtrZXldO1xuICAgICAgaWYgKGl0ZXJhdGVlKHZhbHVlLCBrZXksIG9iaikpIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCB3aXRob3V0IHRoZSBibGFja2xpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLm9taXQgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpdGVyYXRlZSkpIHtcbiAgICAgIGl0ZXJhdGVlID0gXy5uZWdhdGUoaXRlcmF0ZWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ubWFwKGZsYXR0ZW4oYXJndW1lbnRzLCBmYWxzZSwgZmFsc2UsIDEpLCBTdHJpbmcpO1xuICAgICAgaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIHJldHVybiAhXy5jb250YWlucyhrZXlzLCBrZXkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIF8ucGljayhvYmosIGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gY3JlYXRlQXNzaWduZXIoXy5hbGxLZXlzLCB0cnVlKTtcblxuICAvLyBDcmVhdGVzIGFuIG9iamVjdCB0aGF0IGluaGVyaXRzIGZyb20gdGhlIGdpdmVuIHByb3RvdHlwZSBvYmplY3QuXG4gIC8vIElmIGFkZGl0aW9uYWwgcHJvcGVydGllcyBhcmUgcHJvdmlkZWQgdGhlbiB0aGV5IHdpbGwgYmUgYWRkZWQgdG8gdGhlXG4gIC8vIGNyZWF0ZWQgb2JqZWN0LlxuICBfLmNyZWF0ZSA9IGZ1bmN0aW9uKHByb3RvdHlwZSwgcHJvcHMpIHtcbiAgICB2YXIgcmVzdWx0ID0gYmFzZUNyZWF0ZShwcm90b3R5cGUpO1xuICAgIGlmIChwcm9wcykgXy5leHRlbmRPd24ocmVzdWx0LCBwcm9wcyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSAoc2hhbGxvdy1jbG9uZWQpIGR1cGxpY2F0ZSBvZiBhbiBvYmplY3QuXG4gIF8uY2xvbmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gXy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IF8uZXh0ZW5kKHt9LCBvYmopO1xuICB9O1xuXG4gIC8vIEludm9rZXMgaW50ZXJjZXB0b3Igd2l0aCB0aGUgb2JqLCBhbmQgdGhlbiByZXR1cm5zIG9iai5cbiAgLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIG1ldGhvZCBpcyB0byBcInRhcCBpbnRvXCIgYSBtZXRob2QgY2hhaW4sIGluXG4gIC8vIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW4gdGhlIGNoYWluLlxuICBfLnRhcCA9IGZ1bmN0aW9uKG9iaiwgaW50ZXJjZXB0b3IpIHtcbiAgICBpbnRlcmNlcHRvcihvYmopO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJucyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2YgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uaXNNYXRjaCA9IGZ1bmN0aW9uKG9iamVjdCwgYXR0cnMpIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhhdHRycyksIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuICFsZW5ndGg7XG4gICAgdmFyIG9iaiA9IE9iamVjdChvYmplY3QpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgaWYgKGF0dHJzW2tleV0gIT09IG9ialtrZXldIHx8ICEoa2V5IGluIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICB2YXIgZXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIElkZW50aWNhbCBvYmplY3RzIGFyZSBlcXVhbC4gYDAgPT09IC0wYCwgYnV0IHRoZXkgYXJlbid0IGlkZW50aWNhbC5cbiAgICAvLyBTZWUgdGhlIFtIYXJtb255IGBlZ2FsYCBwcm9wb3NhbF0oaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTplZ2FsKS5cbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIGEgIT09IDAgfHwgMSAvIGEgPT09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPT0gdG9TdHJpbmcuY2FsbChiKSkgcmV0dXJuIGZhbHNlO1xuICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCByZWd1bGFyIGV4cHJlc3Npb25zLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICAvLyBSZWdFeHBzIGFyZSBjb2VyY2VkIHRvIHN0cmluZ3MgZm9yIGNvbXBhcmlzb24gKE5vdGU6ICcnICsgL2EvaSA9PT0gJy9hL2knKVxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gJycgKyBhID09PSAnJyArIGI7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLlxuICAgICAgICAvLyBPYmplY3QoTmFOKSBpcyBlcXVpdmFsZW50IHRvIE5hTlxuICAgICAgICBpZiAoK2EgIT09ICthKSByZXR1cm4gK2IgIT09ICtiO1xuICAgICAgICAvLyBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gK2EgPT09IDAgPyAxIC8gK2EgPT09IDEgLyBiIDogK2EgPT09ICtiO1xuICAgICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcbiAgICAgICAgLy8gQ29lcmNlIGRhdGVzIGFuZCBib29sZWFucyB0byBudW1lcmljIHByaW1pdGl2ZSB2YWx1ZXMuIERhdGVzIGFyZSBjb21wYXJlZCBieSB0aGVpclxuICAgICAgICAvLyBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnMuIE5vdGUgdGhhdCBpbnZhbGlkIGRhdGVzIHdpdGggbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zXG4gICAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cbiAgICAgICAgcmV0dXJuICthID09PSArYjtcbiAgICB9XG5cbiAgICB2YXIgYXJlQXJyYXlzID0gY2xhc3NOYW1lID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIGlmICghYXJlQXJyYXlzKSB7XG4gICAgICBpZiAodHlwZW9mIGEgIT0gJ29iamVjdCcgfHwgdHlwZW9mIGIgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcblxuICAgICAgLy8gT2JqZWN0cyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVpdmFsZW50LCBidXQgYE9iamVjdGBzIG9yIGBBcnJheWBzXG4gICAgICAvLyBmcm9tIGRpZmZlcmVudCBmcmFtZXMgYXJlLlxuICAgICAgdmFyIGFDdG9yID0gYS5jb25zdHJ1Y3RvciwgYkN0b3IgPSBiLmNvbnN0cnVjdG9yO1xuICAgICAgaWYgKGFDdG9yICE9PSBiQ3RvciAmJiAhKF8uaXNGdW5jdGlvbihhQ3RvcikgJiYgYUN0b3IgaW5zdGFuY2VvZiBhQ3RvciAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaXNGdW5jdGlvbihiQ3RvcikgJiYgYkN0b3IgaW5zdGFuY2VvZiBiQ3RvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCdjb25zdHJ1Y3RvcicgaW4gYSAmJiAnY29uc3RydWN0b3InIGluIGIpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuXG4gICAgLy8gSW5pdGlhbGl6aW5nIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIC8vIEl0J3MgZG9uZSBoZXJlIHNpbmNlIHdlIG9ubHkgbmVlZCB0aGVtIGZvciBvYmplY3RzIGFuZCBhcnJheXMgY29tcGFyaXNvbi5cbiAgICBhU3RhY2sgPSBhU3RhY2sgfHwgW107XG4gICAgYlN0YWNrID0gYlN0YWNrIHx8IFtdO1xuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT09IGEpIHJldHVybiBiU3RhY2tbbGVuZ3RoXSA9PT0gYjtcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnB1c2goYSk7XG4gICAgYlN0YWNrLnB1c2goYik7XG5cbiAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICBpZiAoYXJlQXJyYXlzKSB7XG4gICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICAgIGxlbmd0aCA9IGEubGVuZ3RoO1xuICAgICAgaWYgKGxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgaWYgKCFlcShhW2xlbmd0aF0sIGJbbGVuZ3RoXSwgYVN0YWNrLCBiU3RhY2spKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERlZXAgY29tcGFyZSBvYmplY3RzLlxuICAgICAgdmFyIGtleXMgPSBfLmtleXMoYSksIGtleTtcbiAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgICAgLy8gRW5zdXJlIHRoYXQgYm90aCBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXMgYmVmb3JlIGNvbXBhcmluZyBkZWVwIGVxdWFsaXR5LlxuICAgICAgaWYgKF8ua2V5cyhiKS5sZW5ndGggIT09IGxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIC8vIERlZXAgY29tcGFyZSBlYWNoIG1lbWJlclxuICAgICAgICBrZXkgPSBrZXlzW2xlbmd0aF07XG4gICAgICAgIGlmICghKF8uaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbiAgLy8gQW4gXCJlbXB0eVwiIG9iamVjdCBoYXMgbm8gZW51bWVyYWJsZSBvd24tcHJvcGVydGllcy5cbiAgXy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSAmJiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc1N0cmluZyhvYmopIHx8IF8uaXNBcmd1bWVudHMob2JqKSkpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIHJldHVybiBfLmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIERPTSBlbGVtZW50P1xuICBfLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhIShvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGFuIGFycmF5P1xuICAvLyBEZWxlZ2F0ZXMgdG8gRUNNQTUncyBuYXRpdmUgQXJyYXkuaXNBcnJheVxuICBfLmlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSBhbiBvYmplY3Q/XG4gIF8uaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAsIGlzRXJyb3IuXG4gIF8uZWFjaChbJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJywgJ0Vycm9yJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBfWydpcycgKyBuYW1lXSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgZmFsbGJhY2sgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIGluIGJyb3dzZXJzIChhaGVtLCBJRSA8IDkpLCB3aGVyZVxuICAvLyB0aGVyZSBpc24ndCBhbnkgaW5zcGVjdGFibGUgXCJBcmd1bWVudHNcIiB0eXBlLlxuICBpZiAoIV8uaXNBcmd1bWVudHMoYXJndW1lbnRzKSkge1xuICAgIF8uaXNBcmd1bWVudHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBfLmhhcyhvYmosICdjYWxsZWUnKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gT3B0aW1pemUgYGlzRnVuY3Rpb25gIGlmIGFwcHJvcHJpYXRlLiBXb3JrIGFyb3VuZCBzb21lIHR5cGVvZiBidWdzIGluIG9sZCB2OCxcbiAgLy8gSUUgMTEgKCMxNjIxKSwgYW5kIGluIFNhZmFyaSA4ICgjMTkyOSkuXG4gIGlmICh0eXBlb2YgLy4vICE9ICdmdW5jdGlvbicgJiYgdHlwZW9mIEludDhBcnJheSAhPSAnb2JqZWN0Jykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT0gJ2Z1bmN0aW9uJyB8fCBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgLy8gSXMgYSBnaXZlbiBvYmplY3QgYSBmaW5pdGUgbnVtYmVyP1xuICBfLmlzRmluaXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gPyAoTmFOIGlzIHRoZSBvbmx5IG51bWJlciB3aGljaCBkb2VzIG5vdCBlcXVhbCBpdHNlbGYpLlxuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBvYmogIT09ICtvYmo7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgZXF1YWwgdG8gbnVsbD9cbiAgXy5pc051bGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgdW5kZWZpbmVkP1xuICBfLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9O1xuXG4gIC8vIFNob3J0Y3V0IGZ1bmN0aW9uIGZvciBjaGVja2luZyBpZiBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gcHJvcGVydHkgZGlyZWN0bHlcbiAgLy8gb24gaXRzZWxmIChpbiBvdGhlciB3b3Jkcywgbm90IG9uIGEgcHJvdG90eXBlKS5cbiAgXy5oYXMgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBvYmogIT0gbnVsbCAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbiAgfTtcblxuICAvLyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJ1biBVbmRlcnNjb3JlLmpzIGluICpub0NvbmZsaWN0KiBtb2RlLCByZXR1cm5pbmcgdGhlIGBfYCB2YXJpYWJsZSB0byBpdHNcbiAgLy8gcHJldmlvdXMgb3duZXIuIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICByb290Ll8gPSBwcmV2aW91c1VuZGVyc2NvcmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gS2VlcCB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gYXJvdW5kIGZvciBkZWZhdWx0IGl0ZXJhdGVlcy5cbiAgXy5pZGVudGl0eSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8vIFByZWRpY2F0ZS1nZW5lcmF0aW5nIGZ1bmN0aW9ucy4gT2Z0ZW4gdXNlZnVsIG91dHNpZGUgb2YgVW5kZXJzY29yZS5cbiAgXy5jb25zdGFudCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gIH07XG5cbiAgXy5ub29wID0gZnVuY3Rpb24oKXt9O1xuXG4gIF8ucHJvcGVydHkgPSBwcm9wZXJ0eTtcblxuICAvLyBHZW5lcmF0ZXMgYSBmdW5jdGlvbiBmb3IgYSBnaXZlbiBvYmplY3QgdGhhdCByZXR1cm5zIGEgZ2l2ZW4gcHJvcGVydHkuXG4gIF8ucHJvcGVydHlPZiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT0gbnVsbCA/IGZ1bmN0aW9uKCl7fSA6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIHByZWRpY2F0ZSBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mXG4gIC8vIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLm1hdGNoZXIgPSBfLm1hdGNoZXMgPSBmdW5jdGlvbihhdHRycykge1xuICAgIGF0dHJzID0gXy5leHRlbmRPd24oe30sIGF0dHJzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gXy5pc01hdGNoKG9iaiwgYXR0cnMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGNvbnRleHQsIDEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdGVlKGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBBIChwb3NzaWJseSBmYXN0ZXIpIHdheSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wIGFzIGFuIGludGVnZXIuXG4gIF8ubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9O1xuXG4gICAvLyBMaXN0IG9mIEhUTUwgZW50aXRpZXMgZm9yIGVzY2FwaW5nLlxuICB2YXIgZXNjYXBlTWFwID0ge1xuICAgICcmJzogJyZhbXA7JyxcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7JyxcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjeDI3OycsXG4gICAgJ2AnOiAnJiN4NjA7J1xuICB9O1xuICB2YXIgdW5lc2NhcGVNYXAgPSBfLmludmVydChlc2NhcGVNYXApO1xuXG4gIC8vIEZ1bmN0aW9ucyBmb3IgZXNjYXBpbmcgYW5kIHVuZXNjYXBpbmcgc3RyaW5ncyB0by9mcm9tIEhUTUwgaW50ZXJwb2xhdGlvbi5cbiAgdmFyIGNyZWF0ZUVzY2FwZXIgPSBmdW5jdGlvbihtYXApIHtcbiAgICB2YXIgZXNjYXBlciA9IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICByZXR1cm4gbWFwW21hdGNoXTtcbiAgICB9O1xuICAgIC8vIFJlZ2V4ZXMgZm9yIGlkZW50aWZ5aW5nIGEga2V5IHRoYXQgbmVlZHMgdG8gYmUgZXNjYXBlZFxuICAgIHZhciBzb3VyY2UgPSAnKD86JyArIF8ua2V5cyhtYXApLmpvaW4oJ3wnKSArICcpJztcbiAgICB2YXIgdGVzdFJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UpO1xuICAgIHZhciByZXBsYWNlUmVnZXhwID0gUmVnRXhwKHNvdXJjZSwgJ2cnKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcgPT0gbnVsbCA/ICcnIDogJycgKyBzdHJpbmc7XG4gICAgICByZXR1cm4gdGVzdFJlZ2V4cC50ZXN0KHN0cmluZykgPyBzdHJpbmcucmVwbGFjZShyZXBsYWNlUmVnZXhwLCBlc2NhcGVyKSA6IHN0cmluZztcbiAgICB9O1xuICB9O1xuICBfLmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIoZXNjYXBlTWFwKTtcbiAgXy51bmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIodW5lc2NhcGVNYXApO1xuXG4gIC8vIElmIHRoZSB2YWx1ZSBvZiB0aGUgbmFtZWQgYHByb3BlcnR5YCBpcyBhIGZ1bmN0aW9uIHRoZW4gaW52b2tlIGl0IHdpdGggdGhlXG4gIC8vIGBvYmplY3RgIGFzIGNvbnRleHQ7IG90aGVyd2lzZSwgcmV0dXJuIGl0LlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHksIGZhbGxiYWNrKSB7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0ID09IG51bGwgPyB2b2lkIDAgOiBvYmplY3RbcHJvcGVydHldO1xuICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgICB2YWx1ZSA9IGZhbGxiYWNrO1xuICAgIH1cbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKHZhbHVlKSA/IHZhbHVlLmNhbGwob2JqZWN0KSA6IHZhbHVlO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGEgdW5pcXVlIGludGVnZXIgaWQgKHVuaXF1ZSB3aXRoaW4gdGhlIGVudGlyZSBjbGllbnQgc2Vzc2lvbikuXG4gIC8vIFVzZWZ1bCBmb3IgdGVtcG9yYXJ5IERPTSBpZHMuXG4gIHZhciBpZENvdW50ZXIgPSAwO1xuICBfLnVuaXF1ZUlkID0gZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgdmFyIGlkID0gKytpZENvdW50ZXIgKyAnJztcbiAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgaWQgOiBpZDtcbiAgfTtcblxuICAvLyBCeSBkZWZhdWx0LCBVbmRlcnNjb3JlIHVzZXMgRVJCLXN0eWxlIHRlbXBsYXRlIGRlbGltaXRlcnMsIGNoYW5nZSB0aGVcbiAgLy8gZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gICAgZXZhbHVhdGUgICAgOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICAgIGludGVycG9sYXRlIDogLzwlPShbXFxzXFxTXSs/KSU+L2csXG4gICAgZXNjYXBlICAgICAgOiAvPCUtKFtcXHNcXFNdKz8pJT4vZ1xuICB9O1xuXG4gIC8vIFdoZW4gY3VzdG9taXppbmcgYHRlbXBsYXRlU2V0dGluZ3NgLCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBkZWZpbmUgYW5cbiAgLy8gaW50ZXJwb2xhdGlvbiwgZXZhbHVhdGlvbiBvciBlc2NhcGluZyByZWdleCwgd2UgbmVlZCBvbmUgdGhhdCBpc1xuICAvLyBndWFyYW50ZWVkIG5vdCB0byBtYXRjaC5cbiAgdmFyIG5vTWF0Y2ggPSAvKC4pXi87XG5cbiAgLy8gQ2VydGFpbiBjaGFyYWN0ZXJzIG5lZWQgdG8gYmUgZXNjYXBlZCBzbyB0aGF0IHRoZXkgY2FuIGJlIHB1dCBpbnRvIGFcbiAgLy8gc3RyaW5nIGxpdGVyYWwuXG4gIHZhciBlc2NhcGVzID0ge1xuICAgIFwiJ1wiOiAgICAgIFwiJ1wiLFxuICAgICdcXFxcJzogICAgICdcXFxcJyxcbiAgICAnXFxyJzogICAgICdyJyxcbiAgICAnXFxuJzogICAgICduJyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgdmFyIGVzY2FwZXIgPSAvXFxcXHwnfFxccnxcXG58XFx1MjAyOHxcXHUyMDI5L2c7XG5cbiAgdmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihtYXRjaCkge1xuICAgIHJldHVybiAnXFxcXCcgKyBlc2NhcGVzW21hdGNoXTtcbiAgfTtcblxuICAvLyBKYXZhU2NyaXB0IG1pY3JvLXRlbXBsYXRpbmcsIHNpbWlsYXIgdG8gSm9obiBSZXNpZydzIGltcGxlbWVudGF0aW9uLlxuICAvLyBVbmRlcnNjb3JlIHRlbXBsYXRpbmcgaGFuZGxlcyBhcmJpdHJhcnkgZGVsaW1pdGVycywgcHJlc2VydmVzIHdoaXRlc3BhY2UsXG4gIC8vIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICAvLyBOQjogYG9sZFNldHRpbmdzYCBvbmx5IGV4aXN0cyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG4gIF8udGVtcGxhdGUgPSBmdW5jdGlvbih0ZXh0LCBzZXR0aW5ncywgb2xkU2V0dGluZ3MpIHtcbiAgICBpZiAoIXNldHRpbmdzICYmIG9sZFNldHRpbmdzKSBzZXR0aW5ncyA9IG9sZFNldHRpbmdzO1xuICAgIHNldHRpbmdzID0gXy5kZWZhdWx0cyh7fSwgc2V0dGluZ3MsIF8udGVtcGxhdGVTZXR0aW5ncyk7XG5cbiAgICAvLyBDb21iaW5lIGRlbGltaXRlcnMgaW50byBvbmUgcmVndWxhciBleHByZXNzaW9uIHZpYSBhbHRlcm5hdGlvbi5cbiAgICB2YXIgbWF0Y2hlciA9IFJlZ0V4cChbXG4gICAgICAoc2V0dGluZ3MuZXNjYXBlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5pbnRlcnBvbGF0ZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuZXZhbHVhdGUgfHwgbm9NYXRjaCkuc291cmNlXG4gICAgXS5qb2luKCd8JykgKyAnfCQnLCAnZycpO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgdGVtcGxhdGUgc291cmNlLCBlc2NhcGluZyBzdHJpbmcgbGl0ZXJhbHMgYXBwcm9wcmlhdGVseS5cbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzb3VyY2UgPSBcIl9fcCs9J1wiO1xuICAgIHRleHQucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlLCBpbnRlcnBvbGF0ZSwgZXZhbHVhdGUsIG9mZnNldCkge1xuICAgICAgc291cmNlICs9IHRleHQuc2xpY2UoaW5kZXgsIG9mZnNldCkucmVwbGFjZShlc2NhcGVyLCBlc2NhcGVDaGFyKTtcbiAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgICBpZiAoZXNjYXBlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgZXNjYXBlICsgXCIpKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcXG4nXCI7XG4gICAgICB9IGVsc2UgaWYgKGludGVycG9sYXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgaW50ZXJwb2xhdGUgKyBcIikpPT1udWxsPycnOl9fdCkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChldmFsdWF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGUgKyBcIlxcbl9fcCs9J1wiO1xuICAgICAgfVxuXG4gICAgICAvLyBBZG9iZSBWTXMgbmVlZCB0aGUgbWF0Y2ggcmV0dXJuZWQgdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBvZmZlc3QuXG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG4gICAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAgIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXG4gICAgaWYgKCFzZXR0aW5ncy52YXJpYWJsZSkgc291cmNlID0gJ3dpdGgob2JqfHx7fSl7XFxuJyArIHNvdXJjZSArICd9XFxuJztcblxuICAgIHNvdXJjZSA9IFwidmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLFwiICtcbiAgICAgIFwicHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcXG5cIiArXG4gICAgICBzb3VyY2UgKyAncmV0dXJuIF9fcDtcXG4nO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciByZW5kZXIgPSBuZXcgRnVuY3Rpb24oc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicsICdfJywgc291cmNlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIHJlbmRlci5jYWxsKHRoaXMsIGRhdGEsIF8pO1xuICAgIH07XG5cbiAgICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBzb3VyY2UgYXMgYSBjb252ZW5pZW5jZSBmb3IgcHJlY29tcGlsYXRpb24uXG4gICAgdmFyIGFyZ3VtZW50ID0gc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaic7XG4gICAgdGVtcGxhdGUuc291cmNlID0gJ2Z1bmN0aW9uKCcgKyBhcmd1bWVudCArICcpe1xcbicgKyBzb3VyY2UgKyAnfSc7XG5cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH07XG5cbiAgLy8gQWRkIGEgXCJjaGFpblwiIGZ1bmN0aW9uLiBTdGFydCBjaGFpbmluZyBhIHdyYXBwZWQgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8uY2hhaW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBfKG9iaik7XG4gICAgaW5zdGFuY2UuX2NoYWluID0gdHJ1ZTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH07XG5cbiAgLy8gT09QXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAvLyBJZiBVbmRlcnNjb3JlIGlzIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLCBpdCByZXR1cm5zIGEgd3JhcHBlZCBvYmplY3QgdGhhdFxuICAvLyBjYW4gYmUgdXNlZCBPTy1zdHlsZS4gVGhpcyB3cmFwcGVyIGhvbGRzIGFsdGVyZWQgdmVyc2lvbnMgb2YgYWxsIHRoZVxuICAvLyB1bmRlcnNjb3JlIGZ1bmN0aW9ucy4gV3JhcHBlZCBvYmplY3RzIG1heSBiZSBjaGFpbmVkLlxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiB0byBjb250aW51ZSBjaGFpbmluZyBpbnRlcm1lZGlhdGUgcmVzdWx0cy5cbiAgdmFyIHJlc3VsdCA9IGZ1bmN0aW9uKGluc3RhbmNlLCBvYmopIHtcbiAgICByZXR1cm4gaW5zdGFuY2UuX2NoYWluID8gXyhvYmopLmNoYWluKCkgOiBvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHlvdXIgb3duIGN1c3RvbSBmdW5jdGlvbnMgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm1peGluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgXy5lYWNoKF8uZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gX1tuYW1lXSA9IG9ialtuYW1lXTtcbiAgICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gW3RoaXMuX3dyYXBwZWRdO1xuICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiByZXN1bHQodGhpcywgZnVuYy5hcHBseShfLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgXy5taXhpbihfKTtcblxuICAvLyBBZGQgYWxsIG11dGF0b3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBfLmVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT09ICdzaGlmdCcgfHwgbmFtZSA9PT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gcmVzdWx0KHRoaXMsIG9iaik7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gQWRkIGFsbCBhY2Nlc3NvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIF8uZWFjaChbJ2NvbmNhdCcsICdqb2luJywgJ3NsaWNlJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdCh0aGlzLCBtZXRob2QuYXBwbHkodGhpcy5fd3JhcHBlZCwgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRXh0cmFjdHMgdGhlIHJlc3VsdCBmcm9tIGEgd3JhcHBlZCBhbmQgY2hhaW5lZCBvYmplY3QuXG4gIF8ucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dyYXBwZWQ7XG4gIH07XG5cbiAgLy8gUHJvdmlkZSB1bndyYXBwaW5nIHByb3h5IGZvciBzb21lIG1ldGhvZHMgdXNlZCBpbiBlbmdpbmUgb3BlcmF0aW9uc1xuICAvLyBzdWNoIGFzIGFyaXRobWV0aWMgYW5kIEpTT04gc3RyaW5naWZpY2F0aW9uLlxuICBfLnByb3RvdHlwZS52YWx1ZU9mID0gXy5wcm90b3R5cGUudG9KU09OID0gXy5wcm90b3R5cGUudmFsdWU7XG5cbiAgXy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJycgKyB0aGlzLl93cmFwcGVkO1xuICB9O1xuXG4gIC8vIEFNRCByZWdpc3RyYXRpb24gaGFwcGVucyBhdCB0aGUgZW5kIGZvciBjb21wYXRpYmlsaXR5IHdpdGggQU1EIGxvYWRlcnNcbiAgLy8gdGhhdCBtYXkgbm90IGVuZm9yY2UgbmV4dC10dXJuIHNlbWFudGljcyBvbiBtb2R1bGVzLiBFdmVuIHRob3VnaCBnZW5lcmFsXG4gIC8vIHByYWN0aWNlIGZvciBBTUQgcmVnaXN0cmF0aW9uIGlzIHRvIGJlIGFub255bW91cywgdW5kZXJzY29yZSByZWdpc3RlcnNcbiAgLy8gYXMgYSBuYW1lZCBtb2R1bGUgYmVjYXVzZSwgbGlrZSBqUXVlcnksIGl0IGlzIGEgYmFzZSBsaWJyYXJ5IHRoYXQgaXNcbiAgLy8gcG9wdWxhciBlbm91Z2ggdG8gYmUgYnVuZGxlZCBpbiBhIHRoaXJkIHBhcnR5IGxpYiwgYnV0IG5vdCBiZSBwYXJ0IG9mXG4gIC8vIGFuIEFNRCBsb2FkIHJlcXVlc3QuIFRob3NlIGNhc2VzIGNvdWxkIGdlbmVyYXRlIGFuIGVycm9yIHdoZW4gYW5cbiAgLy8gYW5vbnltb3VzIGRlZmluZSgpIGlzIGNhbGxlZCBvdXRzaWRlIG9mIGEgbG9hZGVyIHJlcXVlc3QuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxufS5jYWxsKHRoaXMpKTtcbiJdfQ==

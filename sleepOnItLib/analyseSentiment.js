import _ from '../node_modules/underscore/underscore.js';
import * as sentimentWordList from './sentimentWordList.js';
import * as regexList from './utils/regexList.js';

export var analyseSentiment = (function () {
    'use strict';

    var sentimentScores,
        prefixModifiers,
        postfixModifiers,
        currentPrefixModifierScore,
        currentPostfixModifierScore,
        lastNormalTokenSentimentScore;

    /**
     * From https://github.com/thisandagain/sentiment/blob/master/lib/index.js
     * Performs sentiment analysis on the provided input "phrase".
     *
     * @param {String} Input phrase
     * @param {Object} Optional sentiment additions to sentimentScores (hash k/v pairs)
     *
     * @return {Object}
     */
    function analyseSentiment (phrase = '', inject = null, callback = null) {
        setupWordList(inject);

        // Storage objects
        let tokens      = tokenize(phrase),
            score       = 0,
            words       = [],
            positive    = [],
            negative    = [];

        currentPrefixModifierScore = 1;
        currentPostfixModifierScore = 1;
        lastNormalTokenSentimentScore = 0;

        tokens.forEach(function(word, index) {
            let wordSentimentScore = analyseSentimentForWord(word);

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
            score:          score,
            comparative:    score / tokens.length,
            tokens:         tokens,
            words:          words,
            positive:       positive,
            negative:       negative
        };

        if (callback === null) {
            return result;
        }

        _.defer(function () {
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
            sentimentScores = _.clone(sentimentWordList.SENTIMENT_SCORES);
        }

        if (!prefixModifiers) {
            prefixModifiers = _.clone(sentimentWordList.PREFIX_MODIFIERS);
        }

        if (!postfixModifiers) {
            postfixModifiers = _.clone(sentimentWordList.POSTFIX_MODIFIERS);
        }

        // Merge
        if (inject !== null) {
            sentimentScores = _.extend(sentimentScores, inject);
        }
    }

    /**
     * Tokenizes an input string.
     *
     * @param {String} Input
     *
     * @return {Array}
     */
    function tokenize (input) {

        if (!input) {
            return input;
        }

        const BR_Tags = 'divbr',
              EXCLAMATION_MARKS = /(\!)/g,
              QUESTION_MARKS = /\?/g,
              EXTRA_SPACES = '/ {2,}/';

        return input
            .replace(regexList.EMOJI_REGEX, ' $1 ')
            .replace(BR_Tags, '')
            .replace(EXCLAMATION_MARKS, ' $1 ')
            .replace(QUESTION_MARKS, ' ? ')
            .replace(EXTRA_SPACES,' ')
            .split(' ');
    }

    return analyseSentiment;
})();

function WorldConstructor() {
    this.sentimentAnalyser = require('../../../js/analyseSentiment.js');
    this.discProfileAnalyser = require('../../../js/analyseDISCProfile.js').discProfileAnalyser;
    this.readabilityAnalyser = require('../../../js/utils/calculateReadingLevel.js');
    this.egoismAnalyser = require('../../../js/utils/egoismAnalyser.js');
}

module.exports.World = WorldConstructor;
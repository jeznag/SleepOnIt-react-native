import * as discProfileAnalyser from '../../../js/analyseDISCProfile.js';

module.exports = function () {

  'use strict';

  var emailData,
      actualDISCProfileResults = [],
      assert = require('cucumber-assert'),
      World = require("../support/world.js").World,
      thisWorld = new World();

  this.Given('that $name has written the following emails:', function (name, emailTestData, done) {
      emailData = emailTestData.raw();

      done();
  });

  this.When('$name tries to send the emails', function (name, done) {
    actualDISCProfileResults = [];

    emailData.forEach(function (individualEmail) {
      let readabilityScore = thisWorld.readabilityAnalyser.calculateReadabilityScore(individualEmail[0]),
          discProfile = thisWorld.discProfileAnalyser.analyseEmail(individualEmail[0], readabilityScore);

      actualDISCProfileResults.push(discProfile)
    });

    done();
  });

  this.Then('SleepOnIt should give the following DISC results:', function (expectedProfiles, done) {
    let allTestsPass = true;

    expectedProfiles.raw().forEach(function (expectedProfileString, index) {
      let actualProfile = actualDISCProfileResults[index],
          expectedProfileObject = JSON.parse(expectedProfileString);

      if (actualProfile.D !== expectedProfileObject.D ||
          actualProfile.I !== expectedProfileObject.I ||
          actualProfile.S !== expectedProfileObject.S ||
          actualProfile.C !== expectedProfileObject.C) {
        console.log('Expected ' + JSON.stringify(expectedProfileObject) + ' but got ' + JSON.stringify(actualProfile));
        allTestsPass = false;
      }

    });

    assert.equal(allTestsPass, true, done);

    done();
  });

};
export default (function() {

    'use strict';

    /**
    * Emails often come with copies of old emails from earlier in the thread
    * We don't want to process the old emails when we're analysing as we'll have a false positive otherwise
    **/             
    function removeQuotedTextFromEmail (emailContents) {
        var selectorForQuotedReplies = '<div class="gmail_quote">',
            endOfNewContent = emailContents.indexOf(selectorForQuotedReplies);

        if (endOfNewContent > -1){
            return emailContents.substring(0, endOfNewContent);
        } 

        return emailContents;
    }

    return {
        removeQuotedTextFromEmail
    }

})();

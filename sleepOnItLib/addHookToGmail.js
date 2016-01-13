import * as lightBoxUtil from './utils/resultsLightbox.js';

export default (function () {

    'use strict';

    var sendButtons, wrapperDiv,
        zGbl_PageChangedByAJAX_Timer = '',
        _sendButtonClickHandler;

    function startApp() {
        console.log('***Sleep On It Starting');
        window.addEventListener ('load', localMain, false);
    }

    function localMain() {
        if (typeof zGbl_PageChangedByAJAX_Timer === 'number') {
            clearTimeout (zGbl_PageChangedByAJAX_Timer);
            zGbl_PageChangedByAJAX_Timer  = '';
        }

        document.body.addEventListener ('DOMNodeInserted', pageBitHasLoaded, false);
    }

    function pageBitHasLoaded() {
        if (typeof zGbl_PageChangedByAJAX_Timer === 'number') {
            clearTimeout (zGbl_PageChangedByAJAX_Timer);
            zGbl_PageChangedByAJAX_Timer = '';
        }

        zGbl_PageChangedByAJAX_Timer = setTimeout (function() {
            handlePageChange (); 
        }, 666);
    }

    function handlePageChange() {
        removeEventListener ('DOMNodeInserted', pageBitHasLoaded, false);
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
        
        evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0,
                    false, false, false, false, 0, null);

        sendButtons[0].dispatchEvent(evt);
    }

    return {
        startApp,
        setSendButtonClickHandler,
        triggerEmailSend
    };

})();
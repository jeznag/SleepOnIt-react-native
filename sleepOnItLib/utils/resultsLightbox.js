export default (function () {

    function displayContentInLightbox(insertContent){

        // add lightbox/shadow <div/>'s if not previously added
        var lightBoxDiv = document.querySelector('#lightbox');
        if(!lightBoxDiv){
            lightBoxDiv = document.createElement('div');
            lightBoxDiv.id = 'lightbox';

            document.body.appendChild(lightBoxDiv);
        }

        // insert HTML content
        if(insertContent != null){
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
        var style = document.createElement('style')
        style.type = 'text/css'
        style.innerHTML = '#lightbox { margin: 70px auto; padding: 20px; background: #D3D1EC; border-radius: 5px; width: 200px; position: absolute; transition: all 5s ease-in-out; font-family: Tahoma, Arial, sans-serif; }';
        document.getElementsByTagName('head')[0].appendChild(style)
    }

    return {
        displayContentInLightbox,
        addLightBoxCSS
    }

})();
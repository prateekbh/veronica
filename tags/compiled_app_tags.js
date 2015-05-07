riot.tag('hp-card', '<h1 style="color:red">{opts.title}</h1><div id="content"></div>', function(opts) {

});
riot.tag('hp-cardlist', '<hp-instacard each="{card, index in cards}" class="card-{index}" riot-style="-webkit-animation-delay:{(index+1)*50}ms" title="How u doin???" model="{card}"></hp-instacard>', function(opts) {

    var myData=fevicol.getCurrentComponentData();

    this.isLoading = true;

    if(myData.cards==undefined){
        fevicol.get("response.json").then(function(status, response) {
            var res = JSON.parse(response);
            this.cards = res.response;
            myData.cards=res.response;
            riot.update();
        })
    }
    else{
        this.cards = myData.cards;
    }
    
});

riot.tag('hp-header', '<div class="container-icon"><img class="icon" width="24" height="24" src="http://google.github.io/material-design-icons/action/svg/ic_turned_in_not_24px.svg"></img></div><div class="container-text"><div class="heading">HashPlay</div><div class="sub-heading">follow your likes from around the web</div></div><a href="/settings"><svg class="icon-settings" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M0 0h24v24h-24z" fill="none"></path><path fill="#fff" d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65c-.03-.24-.24-.42-.49-.42h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-7.43 2.52c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path></svg></a>', function(opts) {
        var thisTag=(this.root);
        function updateHeaderSize(){
            if(window.scrollY>100){
                thisTag.classList.add("stickyHeader")
            }
            else{
                if(thisTag.classList.contains("stickyHeader")){
                    thisTag.classList.remove("stickyHeader")
                }
            }

            requestAnimationFrame(updateHeaderSize);
        }

        requestAnimationFrame(updateHeaderSize);
    
});
riot.tag('hp-instacard', '<div class="img"><img riot-src="{opts.model.status.img}" class="img-insta"></div></div><div class="desc"> {opts.model.status.text} </div>', function(opts) {
    
});
riot.tag('hp-settings', '<section class="hp-card"><div class="header"> Change your hashtag </div><div class="body"><div class="text"> Set your new hashtag </div><div class="input"><input class="hashtag"></input></div></div><div class="action-panel"><button class="submit" onclick="{saveHashtag}">Save</button></div></section>', function(opts) {
    this.saveHashtag = function() {
        var hashValue = this.root.querySelector(".hashtag").value || '';
        localStorage.setItem("hashTag", hashValue);
    }
    
});

riot.tag('inner-html', '', function(opts) {
	var p = this.parent.root
	while (p.firstChild) this.root.appendChild(p.firstChild)

});
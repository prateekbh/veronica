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

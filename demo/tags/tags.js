riot.tag('demo-intro', '<h1>Build List/<a href="/list">View List</a></h1><form><input id="item" type="text"><input type="submit" onclick="{addItem}"></form>', function(opts) {
    var itemAction = veronica.flux.Actions.getAction("ItemsActions");
    this.addItem = function(e) {
        e.preventDefault();
        if(e.target.form.item.value){
            itemAction.addItem(e.target.form.item.value);
            e.target.form.item.value="";    
        }
        
    }
});

riot.tag('demo-list', '<h1>Your List</h1><div each="{l in list}">{l}</div>', function(opts) {
    this.list = [];
    var _self = this;
    this.on("mount", function() {
        _self.update({
            list: veronica.flux.Stores.getStore("ListStore").getItems()
        });
    });
});

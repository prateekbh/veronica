(function(veronica) {
    function ProductStore() {
        var _self = this;
        this.getProducts=function(){
            var products=[
                {
                    productid:123,
                    heading:"Nestle Coffee",
                    subheading:"Drinks"
                },
                {
                    productid:1234,
                    heading:"Nestle Tea",
                    subheading:"Drinks"
                },
                {
                    productid:1235,
                    heading:"White eggs",
                    subheading:"Eggs and breakfast"
                },
                {
                    productid:1236,
                    heading:"Brown eggs",
                    subheading:"Eggs and breakfast"
                }
            ];

            return products;
        }
    }
    veronica.flux.Stores.createStore("ProductStore", ProductStore);
})(veronica);

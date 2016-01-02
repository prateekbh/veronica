(function(veronica) {
    function CartStore() {
        var _self = this;
        var cartProducts=[];

        _self.Dispatcher.register("cart:addproduct", function(data){
            console.log(data);
        });

        _self.Dispatcher.register("cart:removeproduct", function(data){
            console.log(data);
        });

        this.getProductsInCart=function(){
            return cartProducts;
        }
    }
    veronica.flux.Stores.createStore("CartStore", CartStore);
})(veronica);

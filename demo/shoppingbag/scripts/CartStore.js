(function(veronica) {
    function CartStore() {
        var _self = this;
        var cartProducts={};

        _self.Dispatcher.register("cart:addproduct", function(data){
            var p=data.product;
            cartProducts[p.productid]=p;
            _self.emit("cart:change");
        });

        _self.Dispatcher.register("cart:removeproduct", function(data){
            var p=data.product;
            if(cartProducts[p.productid]){
                delete cartProducts[p.productid];
            }
            _self.emit("cart:change");
        });

        this.getProductsInCart=function(){
            return cartProducts;
        }


        this.getCartProductCount=function(){
            var count=0;
            for(var i in cartProducts){
                count=count+1;
            }
            return count;
        }

        this.emptyCart=function(){
            cartProducts={};
        }
    }
    veronica.flux.Stores.createStore("CartStore", CartStore);
})(veronica);

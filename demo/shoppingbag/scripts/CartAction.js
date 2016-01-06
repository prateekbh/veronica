(function(veronica) {
    function CartAction() {
        var _self = this;
        this.addProductToCart = function(p) {
            this.Dispatcher.trigger("cart:addproduct", {
                product: p
            });
        };
        this.removeProductFromCart = function(p) {
            this.Dispatcher.trigger("cart:removeproduct", {
                product: p
            });
        };
    }
    veronica.flux.Actions.createAction("CartAction", CartAction);
})(veronica);

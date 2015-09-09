/*============================
Author : Prateek Bhatnagar
Data : 6th-Sept-2015
Description : This is the base class for stores
=============================*/
;
(function(veronica, http, Dispatcher, promise) {
    var stores = {};
    gems.flux.Stores = {};

    function Store() {
        this.Dispatcher = {
            register: Dispatcher.on,
            unregister: Dispatcher.off,
            once: Dispatcher.once
        };
        this.Storage = gems.Storage;
    }

    gems.flux.Stores.createStore = function(childClass) {
        try {
            var klass = gems.extender(Store, childClass);
            stores[childClass.name] = new klass();
            return true;
        } catch (e) {
            return false;
        }
    }

    gems.flux.Stores.getStores = function(name) {
        return stores[name];
    }

})(veronica, gems.http, gems.Dispatcher);

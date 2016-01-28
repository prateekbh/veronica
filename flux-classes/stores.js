/*============================
Author : Prateek Bhatnagar
Data : 6th-Sept-2015
Description : This is the base class for stores
=============================*/
;
(function(veronica, Dispatcher, PubSub, promise) {
    var stores = {};
    gems.flux.Stores = {};

    function Store() {
        var PB = new PubSub();
        this.Dispatcher = {
            register: Dispatcher.on,
            unregister: Dispatcher.off,
            once: Dispatcher.once
        };
        //no more including this wrapper
        //this.Storage = gems.Storage;
        this.subscribe = PB.on;
        this.unsubscribe = PB.off;
        this.Promise = promise.Promise;
        this.emit = function(eventName) {
            PB.trigger(eventName, {});
        }
    }

    gems.flux.Stores.createStore = function(storeName, childClass) {
        try {
            var klass = gems.extender(Store, childClass);
            stores[storeName] = new klass();
            return true;
        } catch (e) {
            return false;
        }
    }

    gems.flux.Stores.getStore = function(name) {
        return stores[name];
    }

})(veronica, gems.Dispatcher, gems.PB, gems.promise);
/*============================
Author : Prateek Bhatnagar
Data : 6th-Sept-2015
Description : This is the base class for stores
=============================*/
;
(function(veronica, Dispatcher,PubSub) {
    var stores = {};
    gems.flux.Stores = {};

    function Store() {
        var PB=new PubSub();
        this.Dispatcher = {
            register: Dispatcher.on,
            unregister: Dispatcher.off,
            once: Dispatcher.once
        };
        this.Storage = gems.Storage;
        this.subscribe=PB.on;
        this.unsubscribe=PB.off;
        this.emit=function(eventName){PB.trigger(eventName,{});}
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

    gems.flux.Stores.getStore = function(name) {
        return stores[name];
    }

})(veronica, gems.Dispatcher,gems.PB);

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
            var PB=new PubSub();
            var obj=new klass(PB);
            obj.on=PB.on;
            obj.off=PB.off;
            obj.once=PB.once;

            stores[childClass.name] = obj;
            
            return true;
        } catch (e) {
            return false;
        }
    }

    gems.flux.Stores.getStore = function(name) {
        return stores[name];
    }

})(veronica, gems.Dispatcher,gems.PB);

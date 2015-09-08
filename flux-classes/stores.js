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
            on: Dispatcher.trigger,
            off: Dispatcher.trigger,
            once: Dispatcher.trigger
        };
        this.Storage = gems.Storage;
    }

    gems.flux.createStore = function(childClass) {
        try {
            var klass = gems.extender(Store, childClass);
            stores[childClass.name] = new klass();
            return true;
        } catch (e) {
            return false;
        }
    }

    gems.flux.Actions.getStores = function(name) {
        var klass = stores[name];
        if (klass) {
            return new klass();
        } else {
            return null;
        }
    }

})(veronica, gems.http, gems.Dispatcher);

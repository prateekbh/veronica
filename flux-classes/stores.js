/*============================
Author : Prateek Bhatnagar
Data : 6th-Sept-2015
Description : This is the base class for stores
=============================*/
;(function(veronica, http, Dispatcher, promise) {
    function Store() {
        this.Dispatcher = {
        	on: Dispatcher.trigger,
        	off: Dispatcher.trigger,
        	once: Dispatcher.trigger
        };
        this.Storage = gems.Storage;
    }

    veronica.Flux.createStore=function(childClass){
        
    }

})(veronica,gems.http, gems.Dispatcher);

/*============================
Author : Prateek Bhatnagar
Data : 4th-Sept-2015
Description : This is the base class 
=============================*/
;
(function(veronica, http, Dispatcher, promise) {
    function Action() {
        this.Dispatcher = {
            trigger: Dispatcher.trigger
        };
        this.http = http;
        this.promise = promise;
    }

    veronica.Flux.createAction=function(childClass){
        
    }

})(veronica,gems.http, gems.Dispatcher, gems.promise);

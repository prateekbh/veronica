/*============================
Author : Prateek Bhatnagar
Data : 4th-Sept-2015
Description : This is the base class 
=============================*/
;(function(veronica, http, Dispatcher, promise) {
    var actions={};
    gems.flux.Actions={};

    function Action() {
        this.Dispatcher = {
            trigger: Dispatcher.trigger
        };
        this.Ajax = http;
        this.Promise = promise.Promise;
    }

    gems.flux.Actions.createAction=function(actionName,childClass){
        try{
            actions[actionName]=gems.extender(Action,childClass);    
            return true;
        }
        catch(e){
            return false;
        }
    }

    gems.flux.Actions.getAction=function(name){
        var klass=actions[name];
        if(klass){
            return new klass();    
        }
        else{
            return null;
        }
    }

})(veronica,gems.http, gems.Dispatcher, gems.promise);

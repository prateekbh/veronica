/*============================
Author : Prateek Bhatnagar
Data : 6th-Sept-2015
Description : This is the lib for extending base store/action to user provided actions and stores
=============================*/
;(function(gems){
    var extend = function ( base, child ) {
        child.prototype=new base();
        return child;
    };

    gems.extender=extend;
})(gems);

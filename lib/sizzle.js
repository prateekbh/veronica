/*============================
Author : Prateek Bhatnagar
Data : 7th-Sept-2015
Description : This facilitates a mock sizzle selector
=============================*/
;(function(window) {
    window.$ = function(tag, root) {
        return document.querySelectorAll(tag, root);
    };
})(window);
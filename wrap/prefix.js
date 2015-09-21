(function(window, riot) {
    "use strict";

    var veronica = {
        version: "v0.6.2",
        settings: {
            viewTag: ".app-body",
            maxPageTransitionTime: 200,
            enablePageTransitions:false
        }
    };

    var gems={
        flux:{}
    };

    var semiQualifiedBrowsers = [
        "UCBrowser",
        "Opera Mini"
    ];

    var globals = {
        BROWSER_SUPPORT : "A" //A for full support, B for semi support
    };
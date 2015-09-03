(function(window, riot) {
    "use strict";

    var veronica = {
        version: "v0.0.5",
        settings: {
            viewTag: ".app-body",
            maxPageTransitionTime: 500
        }
    };

    var semiQualifiedBrowsers = [
        "UCBrowser",
        "Opera Mini"
    ];

    var globals = {
        BROWSER_SUPPORT : "A", //A for full support, B for semi support
        applicationStatus:{}
    };
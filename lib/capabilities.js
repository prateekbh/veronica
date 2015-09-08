/*============================
Author : Prateek Bhatnagar
Data : 7th-Sept-2015
Description : This facilitates the capability detection and suppliment for the framework
=============================*/

;
(function(gems) {
    function testAnimationCapability() {
        var animation = false,
            animationstring = "animation",
            keyframeprefix = "",
            domPrefixes = "Webkit Moz O ms Khtml".split(" "),
            pfx = "",
            elm = $("body")[0];

        if (elm.style.animationName !== undefined) {
            animation = true;
        }

        if (animation === false) {
            for (var i = 0; i < domPrefixes.length; i++) {
                if (elm.style[domPrefixes[i] + "AnimationName"] !== undefined) {
                    pfx = domPrefixes[i];
                    animationstring = pfx + "Animation";
                    keyframeprefix = "-" + pfx.toLowerCase() + "-";
                    animation = true;
                    break;
                }
            }
        }

        return animation;
    }

    function isBrowserSemiSupported() {
        for (var uaIndex = 0; uaIndex < semiQualifiedBrowsers; uaIndex++) {
            var currUA = semiQualifiedBrowsers[uaIndex];
            if (navigator.userAgent.indexOf(currUA) !== -1) {
                return true;
            }
        }
        return false;
    }

    function handleClick(e) {
        var node = e.target;
        var parentCount = 0;
        while (node && parentCount < 4) {
            if (node.tagName === "A") {
                e.preventDefault();
                var pageEnterEffect = "mounting";
                var pageLeaveEffect = "unmount";
                if (!!node.getAttribute("data-pageentereffect")) {
                    pageEnterEffect = node.getAttribute("data-pageentereffect").trim();
                }
                if (!!node.getAttribute("data-pageleaveeffect")) {
                    pageLeaveEffect = node.getAttribute("data-pageleaveeffect").trim();
                }
                veronica.loc(node.getAttribute("href"), pageEnterEffect, pageLeaveEffect);
                break;
            } else {
                node = node.parentNode;
                parentCount = parentCount + 1;
            }

        }
    }

    function createEvent(e) {
        var ev = document.createEvent("CustomEvent");
        ev.initEvent(e);
        return ev;
    };

    gems.capabilities = {
        testAnimationCapability: testAnimationCapability,
        isBrowserSemiSupported: isBrowserSemiSupported,
        handleClick: handleClick,
        createEvent:createEvent
    };
})(gems)

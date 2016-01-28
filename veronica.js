(function(window, riot) {
    "use strict";

    var veronica = {
        version: "v1.0-beta",
        settings: {
            viewTag: ".app-body",
            maxPageTransitionTime: 200,
            enablePageTransitions:false,
            listenPopState:true
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
(function(gems) {

    var PB = function() {
        var _self = this,
            _events = {};

        _self.on = function(event, fn, once) {
            if (arguments.length < 2 ||
                typeof event !== "string" ||
                typeof fn !== "function") return;

            var fnString = fn.toString();

            // if the named event object already exists in the dictionary...
            if (typeof _events[event] !== "undefined") {
                if (typeof once === "boolean") {
                    // the function already exists, so update it's 'once' value.
                    _events[event].callbacks[fnString].once = once;
                } else {
                    _events[event].callbacks[fnString] = {
                        cb: fn,
                        once: !!once
                    };
                }
            } else {
                // create a new event object in the dictionary with the specified name and callback.
                _events[event] = {
                    callbacks: {}
                };

                _events[event].callbacks[fnString] = {
                    cb: fn,
                    once: !!once
                };
            }
        };

        _self.once = function(event, fn) {
            _self.on(event, fn, true);
        };

        _self.off = function(event, fn) {
            if (typeof event !== "string" ||
                typeof _events[event] === "undefined") return;

            // remove just the function, if passed as a parameter and in the dictionary.
            if (typeof fn === "function") {
                var fnString = fn.toString(),
                    fnToRemove = _events[event].callbacks[fnString];

                if (typeof fnToRemove !== "undefined") {
                    // delete the callback object from the dictionary.
                    delete _events[event].callbacks[fnString];
                }
            } else {
                // delete all functions in the dictionary that are
                // registered to this event by deleting the named event object.
                delete _events[event];
            }
        };

        _self.trigger = function(event, data) {
            if (typeof event !== "string" ||
                typeof _events[event] === "undefined") return;

            for (var fnString in _events[event].callbacks) {
                var callbackObject = _events[event].callbacks[fnString];

                if (typeof callbackObject.cb === "function") callbackObject.cb(data);
                if (typeof callbackObject.once === "boolean" && callbackObject.once === true) _self.off(event, callbackObject.cb);
            }
        };

    };

    gems.PB=PB;
    gems.Dispatcher = new PB();

})(gems);

/* Promises ===============*/
(function(gems) {
    function Promise() {
        this._successCallbacks = [];
        this._errorCallbacks = [];
    }

    function resolvePromise(func, context, queue, promise) {
        queue.push(function() {
            var res = func.apply(context, arguments);
            if (res && typeof res.then === "function")
                res.then(promise.done, promise);
        });
    }

    Promise.prototype.then = function(func, context) {
        var p;
        if (this._isdone) {
            p = func.apply(context, this.result);
        } else {
            p = new Promise();
            resolvePromise(func, context, this._successCallbacks, p);
        }
        return this;
    };

    Promise.prototype.catch = function(func, context) {
        var p;
        if (this._isdone && this._isfailure) {
            p = func.apply(context, this.result);
        } else {
            p = new Promise();
            resolvePromise(func, context, this._errorCallbacks, p);
        }
        return this;
    };

    Promise.prototype.resolve = function() {
        this.result = arguments;
        this._isdone = true;
        this._issuccess = true;
        for (var i = 0; i < this._successCallbacks.length; i++) {
            this._successCallbacks[i].apply(null, arguments);
        }
        this._successCallbacks = [];
    };

    Promise.prototype.reject = function() {
        this.result = arguments;
        this._isdone = true;
        this._isfailure = true;
        for (var i = 0; i < this._errorCallbacks.length; i++) {
            this._errorCallbacks[i].apply(null, arguments);
        }
        this._errorCallbacks = [];
    };

    var promise = {
        Promise: Promise
    };

    gems.promise = promise;
})(gems);
/* Ajax ===============*/
;(function(gems) {
    var globalHeaders={};
    var globalData={};

    function _encode(data) {
        var result = "";
        if (typeof data === "string") {
            result = data;
        } else {
            var e = encodeURIComponent;
            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    result += "&" + e(k) + "=" + e(data[k]);
                }
            }
        }
        return result;
    }

    function new_xhr() {
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }
        return xhr;
    }


    function ajax(method, url, data, headers) {
        var p = new gems.promise.Promise();
        var xhr, payload;
        data = data || {};
        headers = headers || {};

        for(var tempHeader in globalHeaders){
            headers[tempHeader]=globalHeaders[tempHeader];
        }

        for(var tempData in globalData){
            data[tempData]=globalData[tempData];
        }

        try {
            xhr = new_xhr();
        } catch (e) {
            p.reject(veronicaAjax.ENOXHR,"AJAX:ABSENT");
            return p;
        }

        payload = _encode(data);
        if (method === "GET" && payload) {
            url += "?" + payload;
            payload = null;
        }

        xhr.open(method, url);
        if (method === "POST") {
            xhr.setRequestHeader("Content-type", "application/json");
        } else {
            xhr.setRequestHeader("Content-type", "*/*");
        }
        for (var h in headers) {
            if (headers.hasOwnProperty(h)) {
                xhr.setRequestHeader(h, headers[h]);
            }
        }

        function onTimeout() {
            p.reject(veronicaAjax.ETIMEOUT, "AJAX:TIMEOUT", xhr);
            xhr.abort();
        }

        var timeout = veronicaAjax.ajaxTimeout;
        if (timeout) {
            var tid = setTimeout(onTimeout, timeout);
        }

        xhr.onreadystatechange = function() {
            if (timeout) {
                clearTimeout(tid);
            }
            if (xhr.readyState === 4) {
                var err = (!xhr.status ||
                    (xhr.status < 200 || xhr.status >= 300) &&
                    xhr.status !== 304);
                if (err) {
                    p.reject(xhr.responseText, xhr);
                } else {
                    p.resolve(xhr.responseText, xhr);
                }

            }
        };

        xhr.send(payload);
        return p;
    }

    function _ajaxer(method) {
        return function(url, data, headers) {
            return ajax(method, url, data, headers);
        };
    }

    function setGlobalHeaders(headers){
        globalHeaders=headers;
    }

    function getGlobalHeaders(){
        return globalHeaders;
    }

    function setGlobalData(data){
        globalData=data;
    }

    function getGlobalData(){
        return globalData;
    }

    function setAjaxTimeout(timeout){
        if(typeof timeout==="number"){
            veronicaAjax.ajaxTimeout=timeout;
        }
    }

    var veronicaAjax = {
        ajax: ajax,
        get: _ajaxer("GET"),
        post: _ajaxer("POST"),
        put: _ajaxer("PUT"),
        del: _ajaxer("DELETE"),
        /* Error codes */
        ENOXHR: 1,
        ETIMEOUT: 2,

        /**
         * Configuration parameter: time in milliseconds after which a
         * pending AJAX request is considered unresponsive and is
         * aborted. Useful to deal with bad connectivity (e.g. on a
         * mobile network). A 0 value disables AJAX timeouts.
         *
         * Aborted requests resolve the promise with a ETIMEOUT error
         * code.
         */
        ajaxTimeout: 15000
    };

    gems.http={};

    gems.http.ajax = veronicaAjax.ajax;
    gems.http.get = veronicaAjax.get;
    gems.http.post = veronicaAjax.post;
    gems.http.put = veronicaAjax.put;
    gems.http.delete = veronicaAjax.del;

    //global ajax funtions
    gems.httpGlobal={};
    gems.httpGlobal.setAjaxTimeout=setAjaxTimeout;
    gems.httpGlobal.getGlobalHeaders=getGlobalHeaders;
    gems.httpGlobal.setGlobalHeaders=setGlobalHeaders;
    gems.httpGlobal.getGlobalData=getGlobalData;
    gems.httpGlobal.setGlobalData=setGlobalData;

})(gems);
/*============================
Author : Prateek Bhatnagar
Data : 6th-Sept-2015
Description : This is the lib for extending base store/action to user provided actions and stores
=============================*/
;
(function(gems) {
    var extend = function(base, child) {
        child.prototype = new base();
        return child;
    };

    gems.extender = extend;
})(gems);

/*============================
Author : Prateek Bhatnagar
Data : 7th-Sept-2015
Description : This facilitates the router of the framework
=============================*/
;
(function(gems, veronica) {
    var appStatus = {
        shownEventFired: false,
        mountingComponent: null
    }

    appStatus.viewTag = $(veronica.settings.viewTag)[0];
    if (appStatus.viewTag) {
        appStatus.viewTag.innerHTML = "<div class='page'></div>";
        appStatus.pageTag = appStatus.viewTag.querySelector(".page");
    } else {
        appStatus.pageTag = null;
    }

    appStatus.routes = [];

    appStatus.currentState = {
        name: "",
        state: {}
    };

    appStatus.currentComponent = null;

    function createRoute(stateName, urlRegex, componentToMount) {
        return {
            url: urlRegex,
            state: stateName,
            component: componentToMount
        };
    }

    function getCurrentState() {
        return appStatus.currentState.state;
    }

    function getCurrentPath() {
        var route = location.pathname.split("#")[0];
        if (typeof route === "string") {
            return route;
        } else if (route.length > 0) {
            return route[0];
        } else {
            throw new Error("Unable to process route");
        }
    }

    function addRoute(route) {
        if (route && route.url && route.component) {
            var tokenRegExp = /:([A-Za-z0-9]*)$|:(([A-Za-z0-9]*)\/)/g;
            var params = route.url.match(tokenRegExp);
            var urlregex = route.url;
            if (params) {
                for (var paramIndex = 0; paramIndex < params.length; paramIndex++) {
                    params[paramIndex] = params[paramIndex].replace("/", "");
                    urlregex = urlregex.replace(params[paramIndex], "(.*)");
                }
            }
            route.regex = new RegExp("^" + urlregex + "$", "i");
            route.paramDictionary = params;

            appStatus.routes.push(route);
        } else {
            throw new Error("Route object should contain a URL regex and a component name");
        }
    }

    function extractRouteData(regex, paramDictionary, url) {
        if (!paramDictionary || paramDictionary.length === 0) {
            return {};
        }

        var data = url.match(regex);
        var routeData = {};
        data.shift();

        for (var pdIndex = 0; pdIndex < paramDictionary.length; pdIndex++) {
            routeData[paramDictionary[pdIndex]] = data[pdIndex];
        }

        return routeData;
    }

    function loc() {
        if (arguments.length === 0) {
            return appStatus.currentState;
        } else if (arguments.length > 0 && typeof(arguments[0]) == "string") {
            var newRoute = arguments[0];
            var currRoute = getCurrentPath();
            if (history && history.pushState) {
                var urlFound = false;
                for (var r in appStatus.routes) {
                    var route = appStatus.routes[r];
                    var currRouteRegex = route.regex;
                    //check if route matches and is not the current route
                    if (currRouteRegex.test(newRoute) && (appStatus.currentState.name !== route.state)) {
                        route.data = extractRouteData(currRouteRegex, route.paramDictionary, newRoute);
                        var routeData = {};
                        routeData.component = route.component;
                        routeData.data = route.data;
                        routeData.url = route.url;
                        routeData.state = route.state;

                        if (appStatus.currentState.name === "") {
                            history.replaceState(routeData, "", newRoute);
                        } else {
                            route.prevPage = currRoute;
                            if (arguments[1] && typeof(arguments[1]) == "boolean" && arguments[1] === true) {
                                history.replaceState(routeData, "", newRoute);
                            } else {
                                history.pushState(routeData, "", newRoute);
                            }
                        }
                        urlFound = true;
                        gems.Dispatcher.trigger("veronica:stateChange", route);
                        var pageEnterEffect = "mounting";
                        var pageLeaveEffect = "unmount";
                        if (arguments[1] && typeof(arguments[1]) == "string") {
                            pageEnterEffect = arguments[1];
                        }
                        if (arguments[2] && typeof(arguments[2]) == "string") {
                            pageLeaveEffect = arguments[2];
                        }
                        evalRoute(route, pageEnterEffect, pageLeaveEffect);
                        break;
                    }
                }
                //current web app does not have this route so send this request to Server
                if (!urlFound) {
                    location.href = newRoute;
                }
            } else {
                if (newRoute !== currRoute) {
                    location.href = newRoute;
                }
            }
        }
    }

    function replaceLoc(url) {
        loc(url, true);
    }

    window.addEventListener("popstate", function(e) {
        if (veronica.settings.listenPopState && e && e.state) {
            if (appStatus.currentState.state.state !== e.state.state) {
                gems.Dispatcher.trigger("veronica:stateChange", e.state);
            }
            evalRoute(e.state, "mounting-pop", "unmount-pop");
        }
    });

    function evalRoute(stateObj, pageEnterEffect, pageLeaveEffect) {
        // declare components and states
        if (stateObj === null) {
            return;
        }

        var componentName = stateObj.component;
        var prevState = appStatus.currentState;


        //initialize current state and component
        appStatus.currentState.name = stateObj.state;
        appStatus.currentState.state = stateObj;
        appStatus.currentComponent = document.createElement(componentName);


        mountNewPage(pageEnterEffect, pageLeaveEffect);

        var tag = riot.mount(componentName, {});

    }

    function mountNewPage(pageEnterEffect, pageLeaveEffect) {
        pageEnterEffect = pageEnterEffect || "mounting";
        pageLeaveEffect = pageLeaveEffect || "unmount";

        if (appStatus.viewTag) {
            //if there is already something in current page
            if (appStatus.pageTag.children.length > 0) {
                var elem = document.createElement("div");
                appStatus.shownEventFired = false;
                elem.className = "page " + appStatus.currentComponent.tagName.toLowerCase();
                elem.appendChild(appStatus.currentComponent);

                appStatus.mountingComponent = elem;

                if (veronica.settings.enablePageTransitions) {
                    appStatus.pageTag.addEventListener("webkitTransitionEnd", transEnd);
                    appStatus.pageTag.addEventListener("oTransitionEnd", transEnd);
                    appStatus.pageTag.addEventListener("transitionend", transEnd);
                }

                setTimeout(function() {
                    if (!appStatus.shownEventFired) {
                        animEndCallback(appStatus.pageTag, elem)
                        appStatus.currentComponent.dispatchEvent(gems.capabilities.createEvent("shown"));
                    }
                }, veronica.settings.maxPageTransitionTime);

                if (globals.BROWSER_SUPPORT === "A" && veronica.settings.enablePageTransitions) {
                    elem.classList.add(pageEnterEffect);
                    appStatus.pageTag.classList.add(pageLeaveEffect);
                    appStatus.viewTag.appendChild(elem);

                } else {
                    var page = appStatus.viewTag.children && appStatus.viewTag.children[0];
                    var tag = page && page.children && page.children[0];
                    if (tag._tag && tag._tag.isMounted) {
                        tag._tag.unmount()
                    }

                    var newComponent = appStatus.currentComponent.tagName.toLowerCase();
                    var newTag = "<div class='page " + newComponent + "'>" + "<" + newComponent + "></" + newComponent + ">" + "</div>";

                    appStatus.viewTag.innerHTML = newTag;
                }
            } else {
                //if this is the first time a page is being mounted
                appStatus.pageTag.classList.add(appStatus.currentComponent.tagName.toLowerCase());
                appStatus.pageTag.appendChild(appStatus.currentComponent);
                gems.Dispatcher.trigger("veronica:stateTransitionComplete", appStatus.currentState.state);
            }
        }
    }

    function transEnd(elem) {
        this.removeEventListener("transitionend", transEnd);
        this.removeEventListener("webkitTransitionEnd", transEnd);
        this.removeEventListener("oTransitionEnd", transEnd);
        animEndCallback(this, appStatus.mountingComponent);
        appStatus.shownEventFired = true;
        appStatus.currentComponent.dispatchEvent(gems.capabilities.createEvent("shown"));
    }

    function animEndCallback(currElem, newPage) {
        currElem.className = "hidden";

        removePrevComponents(newPage);

        newPage.className = "page " + appStatus.currentComponent.tagName.toLowerCase();
        appStatus.pageTag = newPage;
        gems.Dispatcher.trigger("veronica:stateTransitionComplete", appStatus.currentState.state);
    }

    function getPrevPageUrl() {
        if (history.state) {
            return history.state.prevPage || null;
        } else {
            return null;
        }

    }

    function removePrevComponents(currComponent) {
        var viewTags = appStatus.viewTag.childNodes;
        var tegRemovalIndex = 0;
        while (viewTags.length > 1) {
            var currTag = viewTags[tegRemovalIndex];
            var currPage = currTag.childNodes[0];
            if (currTag !== currComponent) {
                if (currTag.remove) {
                    currTag.remove();
                } else if (currTag.parentElement) {
                    currTag.parentElement.removeChild(currTag);
                }
            } else {
                tegRemovalIndex = tegRemovalIndex + 1;
            }
        }
    }

    veronica.createRoute = createRoute;
    veronica.getCurrentPath = getCurrentPath;
    veronica.getCurrentState = getCurrentState;
    veronica.getPrevPageUrl = getPrevPageUrl;
    veronica.addRoute = addRoute;
    veronica.loc = loc;
    gems.totalRouteLength = function() {
        return appStatus.routes.length
    };

})(gems, veronica);

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

/*============================
Author : Prateek Bhatnagar
Data : 6th-Sept-2015
Description : This is the base class for stores
=============================*/
;
(function(veronica, Dispatcher, PubSub, promise) {
    var stores = {};
    gems.flux.Stores = {};

    function Store() {
        var PB = new PubSub();
        this.Dispatcher = {
            register: Dispatcher.on,
            unregister: Dispatcher.off,
            once: Dispatcher.once
        };
        //no more including this wrapper
        //this.Storage = gems.Storage;
        this.subscribe = PB.on;
        this.unsubscribe = PB.off;
        this.Promise = promise.Promise;
        this.emit = function(eventName) {
            PB.trigger(eventName, {});
        }
    }

    gems.flux.Stores.createStore = function(storeName, childClass) {
        try {
            var klass = gems.extender(Store, childClass);
            stores[storeName] = new klass();
            return true;
        } catch (e) {
            return false;
        }
    }

    gems.flux.Stores.getStore = function(name) {
        return stores[name];
    }

})(veronica, gems.Dispatcher, gems.PB, gems.promise);
/*============================
Author : Prateek Bhatnagar
Data : 7th-Sept-2015
Description : This facilitates the initialization of the framework
=============================*/
(function(gems,veronica){
    function init() {

        if (!gems.capabilities.testAnimationCapability()) {
            $("body")[0].classList.add("noanim");
        }

        if (gems.capabilities.isBrowserSemiSupported()) {
            globals.BROWSER_SUPPORT = "B";
            $("body")[0].classList.add("noanim");
        }

        //mount riot
        //only mount pages else some components might get mounted twice
        //riot.mount("*", {});

        //mount initial page
        if(gems.totalRouteLength()>0){
            veronica.loc(location.pathname);
            gems.Dispatcher.trigger("veronica:init");
            window.dispatchEvent(gems.capabilities.createEvent("veronica:init"));
        }

        document.addEventListener("click", gems.capabilities.handleClick);
    }

    document.onreadystatechange = function() {
        if (document.readyState == "interactive") {
            init();
        }
    };
})(gems,veronica);
    veronica.flux = gems.flux;
    veronica.http=gems.httpGlobal;
    window.veronica = veronica;

})(window, riot);
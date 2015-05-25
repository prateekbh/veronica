/* globals riot,$,ActiveXObject */ 

(function(window, riot) {
    "use strict";

    var veronica = {
        version: "v0.0.2",
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
    var framework = {};

    /* Core ===============*/
    (function(window) {
        window.$ = function(tag, root) {
            return document.querySelectorAll(tag, root);
        };
    })(window);

    /* Event Bus ===============*/

    /*Reference: https://github.com/munkychop/bullet*/
    (function(veronica) {

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

        veronica.eventBus = new PB();

    })(veronica);
    /* Promises ===============*/
    (function(veronica) {
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
            return p;
        };

        Promise.prototype.catch = function(func, context) {
            var p;
            if (this._isdone && this._isfailure) {
                p = func.apply(context, this.result);
            } else {
                p = new Promise();
                resolvePromise(func, context, this._errorCallbacks, p);
            }
            return p;
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

        veronica.promise = promise;
    })(veronica);
    /* Ajax ===============*/
    (function(veronica) {
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
            var p = new veronica.promise.Promise();
            var xhr, payload;
            data = data || {};
            headers = headers || {};

            try {
                xhr = new_xhr();
            } catch (e) {
                p.reject(veronicaAjax.ENOXHR);
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
                xhr.abort();
                p.reject(veronicaAjax.ETIMEOUT, "", xhr);
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
                        p.reject(err);
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
            ajaxTimeout: 0
        };

        $.ajax = veronicaAjax.ajax;
        $.get = veronicaAjax.get;
        $.post = veronicaAjax.post;

    })(veronica);
    /* Persistance===============*/
    (function(veronica) {
        var componentDataStore = {};

        veronica.getCurrentComponentData = function() {
            return componentDataStore[globals.applicationStatus.currentComponent.tagName.toLowerCase()];
        };

        framework.setCurrentComponentData = function(Obj) {
            componentDataStore[globals.applicationStatus.currentComponent.tagName.toLowerCase()] = Obj;
        };


        /* Session */
        var sessionData = [];

        function setSessionData(key, obj) {
            if (sessionStorage) {
                sessionStorage[key] = obj;
            } else {
                sessionData[key] = obj;
            }
        }

        function getSessionData(key) {
            return sessionStorage[key] || sessionData[key];
        }

        veronica.Session = {
            set: setSessionData,
            get: getSessionData
        };


        /* DS */
        var DsData = [];

        function setDsData(key, obj) {
            if (localStorage) {
                localStorage[key] = obj;
            } else {
                DsData[key] = obj;
            }
        }

        function getDsData(key) {
            return localStorage[key] || DsData[key];
        }

        function removeData(key) {
            if (localStorage) {
                localStorage.removeItem(key);
            } else {
                delete DsData[key];
            }
        }

        veronica.DS = {
            set: setDsData,
            get: getDsData,
            removeData: removeData
        };

    })(veronica);
    /* Utils===============*/
    (function(fw) {
        fw.utils = {};
        fw.utils.handleAnchorClick = function(e) {
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
        };
    })(framework);
    /* Sensors Provider===============*/
    (function(veronica) {
        var sensorStatus = {
            GPS: "UNKNOWN"
        };

        function getLocation() {
            var locPromise = window.$q();
            var options = {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 900000
            };

            var successLocation = function(data) {
                locPromise.resolve(data);
            };

            var failure = function(error) {
                if (error.code === error.PERMISSION_DENIED) {
                    sensorStatus.GPS = "BLOCKED";
                    locPromise.reject("LOCATION_BLOCKED");
                } else {
                    sensorStatus.GPS = "N/A";
                    locPromise.reject("LOCATION_ERROR");
                }

            };

            if (navigator.geolocation) {
                sensorStatus.GPS = "AVAILABLE";
                navigator.geolocation.getCurrentPosition(successLocation, failure, options);
            } else {
                sensorStatus.GPS = "N/A";
                locPromise.reject("LOCATION_NOT_AVAILABLE");
            }

            return locPromise;
        }

        veronica.sensors = {
            sensorStatus: sensorStatus,
            getLocation: getLocation
        };
    })(veronica);
    /* Router===============*/
    (function(veronica) {
        var isPageFromPush = false;
        var appStatus=globals.applicationStatus;

        appStatus.viewTag = null;
        appStatus.pageTag = null;
        appStatus.routes = [];

        appStatus.currentState = {
            name: "",
            state: {}
        };

        appStatus.currentComponent = null;

        function createRoute(stateName, urlRegex, componentToMount, preserveDateOnUnmount) {
            return {
                url: urlRegex,
                state: stateName,
                component: componentToMount,
                preserveDateOnUnmount: preserveDateOnUnmount || false
            };
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
            var currState = appStatus.currentState;
            if (route && route.url && route.component) {
                //handle special case of home in which case giving / for route is much more intuitive.
                if(route.url==="/"){
                    route.url="\/$";
                }
                appStatus.routes.push(route);
                if (currState.name === "") {
                    loc(getCurrentPath());
                }
            } else {
                throw new Error("Route object should contain a URL regex and a component name");
            }
        }

        function loc() {
            if (arguments.length === 0) {
                return appStatus.currentState;
            } else if (arguments.length > 0 && typeof(arguments[0]) == "string") {
                var newRoute = arguments[0];
                var currRoute = getCurrentPath();
                if (history && history.pushState) {
                    var urlFound=false;
                    for (var r in appStatus.routes) {
                        var route = appStatus.routes[r];

                        //check if route matches and is not the current route
                        if (newRoute.match(route.url) && (appStatus.currentState.name !== route.state)) {
                            if (appStatus.currentState.name === "") {
                                history.replaceState(route, "", newRoute);
                            } else {
                                route.prevPage = currRoute;
                                history.pushState(route, "", newRoute);
                                veronica.isPageFromPush = true;
                            }
                            veronica.eventBus.trigger("veronica:stateChange", route);
                            var pageEnterEffect = "mounting";
                            var pageLeaveEffect = "unmount";
                            if (arguments[1] && typeof(arguments[1]) == "string") {
                                pageEnterEffect = arguments[1];
                            }
                            if (arguments[2] && typeof(arguments[2]) == "string") {
                                pageLeaveEffect = arguments[2];
                            }
                            evalRoute(route, pageEnterEffect, pageLeaveEffect);
                            urlFound=true;
                            break;
                        }
                    }
                    //current web app does not have this route so send this request to Server
                    if(!urlFound){
                        location.href=newRoute;
                    }
                } else {
                    if (newRoute !== currRoute) {
                        location.href=newRoute;
                    }
                }
            }
        }

        window.onpopstate = function(e) {
            // if(e) because veronica shouldn't intrupt the #changes
            if (e && e.state) {
                if (appStatus.currentState.state.state !== e.state.state) {
                    veronica.eventBus.trigger("veronica:stateChange", e.state);
                }
                evalRoute(e.state, "mounting-pop", "unmount-pop");
            }
        };

        function evalRoute(stateObj, pageEnterEffect, pageLeaveEffect) {
            // declare components and states
            if (stateObj === null) {
                return;
            }

            var componentName = stateObj.component;
            var prevState = appStatus.currentState;
            var preserveComponentData = false;

            //check if data of this component is to be preserved
            if (prevState && prevState.state && prevState.state.preserveDateOnUnmount) {
                preserveComponentData = prevState.state.preserveDateOnUnmount;
            }

            //initialize current state and component
            appStatus.currentState.name = stateObj.state;
            appStatus.currentState.state = stateObj;
            appStatus.currentComponent = document.createElement(componentName);

            //set current component data in data store
            framework.setCurrentComponentData(veronica.getCurrentComponentData() || {});

            mountNewPage(pageEnterEffect, pageLeaveEffect);

            riot.mount(componentName, {});
        }

        function mountNewPage(pageEnterEffect, pageLeaveEffect) {
            pageEnterEffect = pageEnterEffect || "mounting";
            pageLeaveEffect = pageLeaveEffect || "unmount";

            if (appStatus.viewTag) {
                //if there is already something in current page
                if (appStatus.pageTag.children.length > 0) {
                    var elem = document.createElement("div");
                    var shownEventFired = false;
                    elem.className = "page " + appStatus.currentComponent.tagName.toLowerCase();
                    elem.appendChild(appStatus.currentComponent);

                    appStatus.pageTag.addEventListener("webkitTransitionEnd", function() {
                        animEndCallback(this, elem);
                        shownEventFired = true;
                        appStatus.currentComponent.dispatchEvent(new Event("shown"));
                    });

                    appStatus.pageTag.addEventListener("oTransitionEnd", function() {
                        animEndCallback(this, elem);
                        shownEventFired = true;
                        appStatus.currentComponent.dispatchEvent(new Event("shown"));
                    });

                    appStatus.pageTag.addEventListener("transitionend", function() {
                        animEndCallback(this, elem);
                        shownEventFired = true;
                        appStatus.currentComponent.dispatchEvent(new Event("shown"));
                    });

                    setTimeout(function() {
                        if (!shownEventFired) {
                            appStatus.currentComponent.dispatchEvent(new Event("shown"));
                        }
                    }, veronica.settings.maxPageTransitionTime);

                    if (globals.BROWSER_SUPPORT === "A") {
                        elem.classList.add(pageEnterEffect);
                        appStatus.pageTag.classList.add(pageLeaveEffect);
                        appStatus.viewTag.appendChild(elem);

                    } else {
                        var newComponent = appStatus.currentComponent.tagName.toLowerCase();
                        var newTag = "<div class='page " + newComponent + "'>" + "<" + newComponent + "></" + newComponent + ">" + "</div>";
                        appStatus.pageTag.innerHTML = newTag;
                    }



                } else {
                    //if this is the first time a page is being mounted
                    appStatus.pageTag.classList.add(appStatus.currentComponent.tagName.toLowerCase());
                    appStatus.pageTag.appendChild(appStatus.currentComponent);
                }
            }
        }

        function animEndCallback(currElem, newPage) {
            currElem.className = "hidden";
            currElem.remove();
            newPage.className = "page " + appStatus.currentComponent.tagName.toLowerCase();
            appStatus.pageTag = newPage;
        }

        function getPrevPageUrl() {
            if (history.state) {
                return history.state.prevPage || null;
            } else {
                return null;
            }

        }

        veronica.isPageFromPush = isPageFromPush;
        veronica.createRoute = createRoute;
        veronica.getCurrentPath = getCurrentPath;
        veronica.getPrevPageUrl=getPrevPageUrl;
        veronica.addRoute = addRoute;
        veronica.loc = loc;

    })(veronica);

    /* Init===============*/
    window.$q = function() {
        return new veronica.promise.Promise();
    };
    window.veronica = veronica;

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


    function init() {

        var $ = window.$;

        globals.applicationStatus.viewTag = $(veronica.settings.viewTag)[0];
        globals.applicationStatus.viewTag.innerHTML = "<div class='page'></div>";

        globals.applicationStatus.pageTag = globals.applicationStatus.viewTag.querySelector(".page");

        if (!testAnimationCapability()) {
            $("body")[0].classList.add("noanim");
        }

        if (isBrowserSemiSupported()) {
            globals.BROWSER_SUPPORT = "B";
            $("body")[0].classList.add("noanim");
        }

        if (globals.applicationStatus.routes.length > 0) {
            veronica.loc(veronica.getCurrentPath());
        } else {
            window.dispatchEvent(new Event("veronica:init"));
            riot.mount("*", {});
        }

        document.addEventListener("click", framework.utils.handleAnchorClick);
    }

    document.onreadystatechange = function() {
        if (document.readyState == "interactive") {
            init();
        }
    };
})(window, riot);

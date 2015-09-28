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
    gems.httpGlobal.getGlobalHeaders=getGlobalHeaders;
    gems.httpGlobal.setGlobalHeaders=setGlobalHeaders;
    gems.httpGlobal.getGlobalData=getGlobalData;
    gems.httpGlobal.setGlobalData=setGlobalData;

})(gems);
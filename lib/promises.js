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

    gems.promise = promise;
})(gems);
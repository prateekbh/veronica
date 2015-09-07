/* Persistance===============*/
(function(gems) {
    var componentDataStore = {};

    gems.Storage={};

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

    gems.Storage.Session = {
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

    gems.Storage.DS = {
        set: setDsData,
        get: getDsData,
        removeData: removeData
    };

})(gems);
/* Utils===============*/
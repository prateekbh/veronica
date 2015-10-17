function check(done, f) {
    try {
        f();
        done();
    } catch (e) {
        done(e);
    }
}

describe('Veronica Test Suite => ', function() {
    describe('Namespace test: ', function() {
        it("Actions are there", function(done) {
            check(done, function() {
                expect(veronica.flux.Actions).to.be.an("Object");
            });
        });
        it("Stores are there", function(done) {
            check(done, function() {
                expect(veronica.flux.Stores).to.be.an("Object");
            });
        });
        it("Actions functions are there", function(done) {
            check(done, function() {
                expect(veronica.flux.Actions.createAction).to.be.a("Function");
                expect(veronica.flux.Actions.getAction).to.be.a("Function");
            });
        });
        it("Store functions are there", function(done) {
            check(done, function() {
                expect(veronica.flux.Stores.createStore).to.be.a("Function");
                expect(veronica.flux.Stores.getStore).to.be.a("Function");
            });
        });
    });

    describe('Store defination test: ', function() {
        var SampleStore = function() {
            this.store = "abc"
        };
        veronica.flux.Stores.createStore("SampleStore", SampleStore);
        
        it("Store should have Dispatcher and its methods", function(done) {
            check(done, function() {
                var sampleStoreObj = veronica.flux.Stores.getStore("SampleStore");
                expect(sampleStoreObj.Dispatcher).to.be.an("Object");
                expect(sampleStoreObj.emit).to.be.an("Function");
                expect(sampleStoreObj.Dispatcher.once).to.be.a("Function");
                expect(sampleStoreObj.Dispatcher.register).to.be.a("Function");
                expect(sampleStoreObj.Dispatcher.unregister).to.be.a("Function");
            });
        });

        it("Store should have Storage and its methods", function(done) {
            check(done, function() {
                var sampleStoreObj = veronica.flux.Stores.getStore("SampleStore");
                expect(sampleStoreObj.Storage).to.be.an("Object");
                expect(sampleStoreObj.Storage.DS).to.be.an("Object");
                expect(sampleStoreObj.Storage.Session).to.be.an("Object");
                expect(sampleStoreObj.Storage.DS.get).to.be.an("Function");
                expect(sampleStoreObj.Storage.DS.set).to.be.an("Function");
                expect(sampleStoreObj.Storage.Session.get).to.be.an("Function");
                expect(sampleStoreObj.Storage.Session.set).to.be.an("Function");
            });
        });
    });

    describe('Action defination test: ', function() {
        var SampleAction = function() {
            this.Action = "abc"
        };
        veronica.flux.Actions.createAction("SampleAction", SampleAction);
        
        it("Action should have Dispatcher and its methods", function(done) {
            check(done, function() {
                var sampleActionObj = veronica.flux.Actions.getAction("SampleAction");
                expect(sampleActionObj.Dispatcher).to.be.an("Object");
                expect(sampleActionObj.Dispatcher.trigger).to.be.a("Function");
            });
        });

        it("Action should have Ajax capabilities", function(done) {
            check(done, function() {
                var sampleActionObj = veronica.flux.Actions.getAction("SampleAction");
                expect(sampleActionObj.Ajax).to.be.an("Object");
                expect(sampleActionObj.Ajax.get).to.be.a("Function");
                expect(sampleActionObj.Ajax.put).to.be.a("Function");
                expect(sampleActionObj.Ajax.post).to.be.a("Function");
                expect(sampleActionObj.Ajax.delete).to.be.a("Function");
            });
        });

        it("Action should have Promises", function(done) {
            check(done, function() {
                var sampleActionObj = veronica.flux.Actions.getAction("SampleAction");
                expect(sampleActionObj.Promise).to.be.an("Object");
            });
        });
    });
});

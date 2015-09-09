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
});

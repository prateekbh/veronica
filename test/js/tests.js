function check(done, f) {
    try {
        f();
        done();
    } catch (e) {
        done(e);
    }
}

describe('Veronica Test Suite => ', function() {
    describe('Actions tests: ', function() {
        it("Actions are there", function(done) {
            check(done, function() {
                expect(veronica.flux.Actions).to.be.an("Object");
            });
        });
    });
});

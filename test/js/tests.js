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
    // describe('Store defination test: ', function() {
    //     var SampleStore=function(){
    //         this.store="abc"
    //     };
    //     veronica.flux.Stores.createStore(SampleStore);
    //     it("Store should have pubsub methods",function(done){
    //         check(done, function() {
    //             var sampleStoreObj=veronica.flux.Stores.getStore("SampleStore");
    //             console.log("YO: "+sampleStoreObj);
    //             // debugger;
    //             // expect(sampleStoreObj.on).to.be.a("Function");
    //             // expect(sampleStoreObj.off).to.be.a("Function");
    //             // expect(sampleStoreObj.trigger).to.be.a("Function");
    //         });
    //     })
    // });
});

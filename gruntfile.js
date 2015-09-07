/* =====================================
    Grunt Scripts
=======================================*/

var compiledFile = "./veronica_compiled.js";
var compiledMinFile = "./veronica_compiled.min.js";

var jsFiles = [
    "./node_modules/riot/riot.js",
    "./wrap/prefix.js",
    "./lib/sizzle.js",
    "./lib/dispatcher.js",
    "./lib/promises.js",
    "./lib/ajax.js",
    "./lib/storage.js",
    "./wrap/suffix.js"
];

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        clean: {
            pre_build: [compiledFile, compiledMinFile]
        },

        concat: {
            concat_js: {
                src: jsFiles,
                dest: compiledFile,
            }
        }
    });

    // Load the plugin that provides the "clean" task.
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Load the plugin that provides the "concat" task.
    grunt.loadNpmTasks("grunt-contrib-concat");

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //Task for building the static contents of the application
    grunt.registerTask("default", ["clean:pre_build", "concat"]);
};

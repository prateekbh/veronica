/* =====================================
    Grunt Scripts
=======================================*/


module.exports = function(grunt) {

    /* =====================================
        Fevicol settings
    =======================================*/
    var fevicolSettings=grunt.file.readJSON("./fevicol.json");
    var tagsFolder = fevicolSettings.fevicol.tagFolder||"tags";

    /* =====================================
        CSS Files List
    =======================================*/
    //var cssFilesList = grunt.file.readJSON("./code/css_filelist.json");

    /* =====================================
        JS Files List
    =======================================*/
    //var jsFilesList=grunt.file.readJSON("./jsFiles.json");


    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        clean: {
            pre_build: ["tags/**/*.js"]
        },

        riot: {
            dist: {
                expand: true,
                cwd: tagsFolder,
                src: "**/*.html",
                dest: tagsFolder,
                ext: ".js"
            }
        },

        concat: {
            concat_tags: {
                src: "tags/**/*.js",
                dest: tagsFolder+"/compiled_app_tags.js",
            },
            concat_app: {
                src: ["riot_core/riot.js","tags/compiled_app_tags.js","riot_core/veronica.js"],
                dest: "bin/app.js",
            }
        },

    });

    // Load the plugin that provides the "clean" task.
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Load the plugin that provides the "riot" task.
    grunt.loadNpmTasks("grunt-riot");

    // Load the plugin that provides the "concat" task.
    grunt.loadNpmTasks("grunt-contrib-concat");


    //Task for building the static contents of the application
    grunt.registerTask("default", ["clean:pre_build","riot", "concat:concat_tags","concat:concat_app"]);
};

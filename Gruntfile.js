module.exports = function(grunt) {

  // Configuration
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    copy: {
      dev: {
        files: [
          {expand: true, cwd: "", src: "bower_components/keymaster/keymaster.js", dest: 'dist/', flatten: true }
        ]
      }
    },

    less: {
      dev: {
        files: {
          "dist/GripScroll.css": "less/*.less"
        }
      }
    },

    uglify: {
      dev: {
        files: {
          "dist/GripScroll.js": "js/*.js"
        },
        options: {
          beautify: true,
          mangle: false
        }
      }
    },

    watch: {
      less: {
        files: "less/*.less",
        tasks: "less"
      },
      js: {
        files: "js/*.js",
        tasks: "uglify"
      }
    }

  });

  // Tasks
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Commands
  grunt.registerTask('default', ['copy', 'less', 'uglify', 'watch']);

};
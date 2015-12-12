module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  var babelify = require('babelify');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {
        options: {
          port: 8000,
          hostname: 'localhost',
          open: true,
          base: 'public'
        }
      }
    },

    babel: {
    },

    browserify: {
      options: {
        transform: [ 
          require('stringify')(['.vert', '.frag']), 
          ["babelify", {
            presets: ["es2015", "react"]
          }],
        ]
      },
      js: {
        src: 'src/app.js',
        dest: 'public/js/app.js'
      },
    },

    concat: {
      sass: {
        src: ['src/css/bs.sass', 'src/css/main.sass'],
        dest: 'src/css/glui.sass'
      }
    },

    sass: {
      dev: {
        options: {
          style: 'expanded'
        },
        files: {
          'public/css/main.min.css': 'src/css/main.sass',
        }
      },
      prod: {
        options: {
          style: 'compressed',
          sourcemap: 'none'
        },
        files: {
          'public/css/glui.min.css': 'src/css/glui.sass'
        }
      }
    },

    watch: {
      react: {
        files: ['src/**/*.js', 'src/**/*.frag', 'src/**/*.vert'],
        tasks: ['browserify'],
        options: {
          atBegin: true,
          livereload: true
        }
      },

      css: {
        files: ['src/css/**/*.sass', 'src/css/*.scss'],
        tasks: ['sass:dev'],
        options: {
          atBegin: true,
          livereload: true,
          spawn: false
        }
      },

      html: {
        files: ['src/index.html'],
        tasks: ['copy:html'],
        options: {
          atBegin: true,
          livereload: true,
          spawn: false
        }
      },

      backend: {
        files: ['app.js'],
        tasks: ['exec:serve']
      },

      config: {
        files: ['Gruntfile.js'],
        options: {
          reload: true
        }
      }
    },

    copy: {
      html: {
        src: 'src/index.html',
        dest: 'public/index.html'
      },
    },

  });
  
  grunt.registerTask('default', ['connect', 'watch']);
};

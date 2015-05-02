module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    exec: {
      serve: {
        command: "node bin/web-server.js",
        stdout: true
      },
    },

    browserify: {
      options: {
        transform: [ require('grunt-react').browserify ]
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
          'public/css/bs.min.css': 'src/css/bs.sass'
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
        files: ['src/**/*.js'],
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

    useminPrepare: {
      html: 'src/index.html',
      options: { 
        root: 'public',
        dest: 'public',
      }
    },

    uglify: {
      options: {
        sourceMap: false
      }
    },

    copy: {
      html: {
        src: 'src/index.html',
        dest: 'public/index.html'
      },
    },

    usemin: {
      html: 'public/index.html'
    },
  });
  
  grunt.registerTask('serve', ['exec:serve']);
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('build', [ 
    'concat:sass',  // produces temp src/css/mixamo.sass
    'sass:prod',
    'browserify',

    'useminPrepare',
      'concat:generated',
      'uglify:generated',
      'copy:html',
    'usemin',

    'exec:cleanup', // browserify leaves mixamo.js in public/js, and
                    // we want to hide that from prying eyes
  ]);
};

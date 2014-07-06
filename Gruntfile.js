'use strict';

module.exports = function (grunt) {
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);
  // Show elapsed time at the end
  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed MIT */\n',
    // Task configuration.
    clean: {
      files: ['dist'],
      docs: ['docs']
    },

    copy: {
      main: {
        src: 'src/gridmanager.css',
        dest: 'dist/css/jquery.gridmanager.css'
      },
      democss: {
        src: 'src/demo.css',
        dest: 'demo/css/demo.css'
      },
      demobootstrap: {
        src: 'bower_components/bootstrap/dist/css/bootstrap.min.css',
        dest: 'demo/css/bootstrap.css'
      },
      demofoundation: {
        src: 'bower_components/foundation/css/foundation.css',
        dest: 'demo/css/foundation.css'
      },
      demobootstrapjs: {
        src: 'bower_components/bootstrap/dist/js/bootstrap.min.js',
        dest: 'demo/js/bootstrap.js'
      },
      demofoundationjs: {
        src: 'bower_components/foundation/js/foundation.min.js',
        dest: 'demo/js/foundation.js'
      },
      demockeditor: {
        cwd: 'bower_components/ckeditor',
        src: '**/*',
        dest: 'demo/js/ckeditor/',
        expand: true
      },
      demotinymce: {
        cwd: 'bower_components/tinymce',
        src: '**/*',
        dest: 'demo/js/tinymce/',
        expand: true
      },
      demojquery: {
        src: 'bower_components/jquery/dist/jquery.min.js',
        dest: 'demo/js/jquery.js'
      },
      demojqueryui: {
        src: 'bower_components/jquery-ui/ui/minified/jquery-ui.min.js',
        dest: 'demo/js/jquery-ui.js'
      }
      
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['src/<%= pkg.name %>.js'],
        dest: 'dist/js/jquery.<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/js/jquery.<%= pkg.name %>.min.js'
      }
    },
    qunit: {
      all: {
        options: {
          urls: ['http://localhost:9000/test/<%= pkg.name %>.html']
        }
      }
    },
    jshint: {
      options: {
        reporter: require('jshint-stylish')
      },
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      src: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        src: ['src/**/*.js']
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/**/*.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: '<%= jshint.src.src %>',
        tasks: ['jshint:src', 'qunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'qunit']
      }
    },

    jsdoc : {
      dist : {
        src: ['src/*.js'],
        jsdoc: './node_modules/.bin/jsdoc',
        options: {
          destination: 'docs',
          configure: './jsdoc.json',
          template: './node_modules/ink-docstrap/template'
        }
      }
    },

    connect: {
      server: {
        options: {
          hostname: '*',
          port: 9000
        }
      }
    }
  });
 

  // Default task.
  grunt.registerTask('default', ['jshint', 'connect', 'qunit', 'clean','copy', 'concat', 'uglify']);
  grunt.registerTask('docs', ['clean:docs', 'jsdoc']);
  grunt.registerTask('demo', ['copy:demobootstrap', 'copy:demofoundation', 'copy:demobootstrapjs', 'copy:demofoundationjs', 'copy:demockeditor', 'copy:demotinymce', 'copy:demojquery', 'copy:demojqueryui']);
  grunt.registerTask('dist', ['jshint', 'clean', 'copy', 'concat', 'uglify', 'jsdoc']);
  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });
  grunt.registerTask('serve', ['connect', 'watch']);
  grunt.registerTask('test', ['jshint', 'connect', 'qunit']);
};

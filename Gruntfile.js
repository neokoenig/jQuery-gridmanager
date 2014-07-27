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
      files: ['dist']
    },
    less: {
      themeDefault: {
        options: {
          compress: true,
        },
        files: {
          'src/gridmanager.css':'src/less/themes/default.less'
        }
      },
      themeLight: {
        options: {
          compress: true,
        },
        files: {
          'src/gridmanager_light.css':'src/less/themes/light.less'
        }
      },
      themeDark: {
        options: {
          compress: true,
        },
        files: {
          'src/gridmanager_dark.css':'src/less/themes/dark.less'
        }
      }
    },
    copy: {
      main: {
        src: 'src/gridmanager.css',
        dest: 'dist/css/jquery.gridmanager.css'
      },
      themeLight: {
        src: 'src/gridmanager_light.css',
        dest: 'dist/css/jquery.gridmanager-light.css'
      },
      themeDark: {
        src: 'src/gridmanager_dark.css',
        dest: 'dist/css/jquery.gridmanager-dark.css'
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
      demojquery: {
        src: 'bower_components/jquery/dist/jquery.min.js',
        dest: 'demo/js/jquery.js'
      },
      demojqueryui: {
        src: 'bower_components/jquery-ui/jquery-ui.min.js',
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
      less: {
        files: 'src/less/**/*.less',
        tasks: ['less']
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
  grunt.registerTask('demo', ['copy:demobootstrap', 'copy:demofoundation', 'copy:demobootstrapjs', 'copy:demofoundationjs',    'copy:demojquery', 'copy:demojqueryui']);
  grunt.registerTask('dist', ['jshint', 'clean', 'less', 'copy', 'concat', 'uglify']);
  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });
  grunt.registerTask('serve', ['connect', 'watch']);
  grunt.registerTask('test', ['jshint', 'connect', 'qunit']);
};

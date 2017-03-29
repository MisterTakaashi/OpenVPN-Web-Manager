module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodemon: {
      dev: {
        script: 'server.js'
      }
    },
    watch: {
      server: {
        files: ['**/*.js', '**/*.ejs'],
        options: {
          livereload: true
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['nodemon']);

  grunt.registerTask('serve', ['nodemon:dev', 'watch']);

};

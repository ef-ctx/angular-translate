module.exports = {
    
    dist: {

        files: [{
            src: ['<%= build_dir %>/*'],
            dest: '<%= dist_dir %>/',
            cwd: '.',
            expand: true,
            flatten: true
        }]
    
    }

};

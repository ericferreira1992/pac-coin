let cpx = require('cpx');

cpx.copy('src/*.css', 'dist');
cpx.copy('src/*.html', 'dist');
cpx.copy('src/assets/**/*.*', 'dist/assets');
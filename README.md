# glaboratory
A WebGL playground, with a react-based front-end.

To get started:

1.   `cd glaboratory`
1.   `node bin/web-server.js`
1.   `grunt`
1.   navigate to http://localhost:8000/index.html
1.   try adding an experiment in src/experiments, and adding it to the list of experiments in app.js

Fancy docker approach:

    cd glaboratory
    docker build -t glaboratory .
    docker run -p 8000:8000 -t glaboratory node bin/web-server.js

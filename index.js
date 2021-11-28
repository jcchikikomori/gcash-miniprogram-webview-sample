// Include it and extract some methods for convenience
const server = require('server');
const { get } = server.router;
const { render } = server.reply;

// Launch server with options and a couple of routes
server({ port: 8088, public: './public/' }, [
  get('/', () => render('index.html')),
  get('/second', () => render('second.html'))
]);

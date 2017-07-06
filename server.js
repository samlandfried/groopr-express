const express = require('express');
const app = express();

app.locals.title = 'Groopr';

if (!module.parent) {
  app.set('port', process.env.PORT || 3000);
  app.listen(app.get('port'), () => console.log(`${app.locals.title} is running on port ${app.get('port')}.`));
}

app.get('/', (request, response) => {
  response.send('Hello, world!');
});

module.exports = app;

const express = require('express');
const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.locals.title = 'Groopr';

if (!module.parent) {
  app.set('port', process.env.PORT || 3000);
  app.listen(app.get('port'), () => console.log(`${app.locals.title} is running on port ${app.get('port')}.`));
}

app.get('/', (request, response) => {
  response.send('Hello, world!');
});

app.get('/groop', (request, response) => {
  body = {
    groups: [0,1,2,3,4,5,6,7,8,9]
  }
  response.json(body);
});

module.exports = app;

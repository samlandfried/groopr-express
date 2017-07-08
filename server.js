const express = require('express');
const namespace = require('express-namespace');
const bodyParser = require('body-parser');
const Grouper = require('./lib/grouper')
const groupsController = require('./lib/controllers/groupsController');
const GroupsController = new groupsController();

const app = express();

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

app.namespace('/api', () => {
  app.namespace('/v1', () => {
    app.post('/groups', GroupsController.create );
  });
});

module.exports = app;

const express = require('express');
const namespace = require('express-namespace');
const bodyParser = require('body-parser');
const cors = require('cors')
const Grouper = require('./lib/grouper')
const groupsController = require('./lib/controllers/groupsController');
const GroupsController = new groupsController();

const app = express();

app.use(cors({origin: 'http://localhost:3000'}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.locals.title = 'Groopr';

if (!module.parent) {
  app.set('port', process.env.PORT || 3001);
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

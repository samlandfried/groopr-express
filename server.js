const express = require('express');
const app = express();

app.set('port', process.env.PORT || 3000);
app.locals.title = 'Groopr';
app.listen(app.get('port'), () => console.log(`${app.locals.title} is running on port ${app.get('port')}.`))

module.exports = app;
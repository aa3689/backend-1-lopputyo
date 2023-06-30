const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');

const app = express();

mongoose.connect(
  'mongodb+srv://mongodb://username:password@host:port/database',
  { useNewUrlParser: true }
);
mongoose.connection.once('open', () => {
  console.log('Connected to the database');
});

// Suoritetaan graphqlHTTP-funktio,
// kun graphql-osoitteeseen tulee liikennettä
app.use(
  '/graphql',
  graphqlHTTP({
    // otetaan schema käyttöön
    schema,
    graphiql: true,
  })
);

app.listen(3000, () => console.log('Listening port 3000'));

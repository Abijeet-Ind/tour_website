const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './cofig.env' });

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION CAUGHT 💥💥💥');
  console.log(err.name, err.message);

  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    // useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

const port = 80 || process.env.port;

const server = app.listen(port, () => {
  console.log(`listening at port ${port}`);
});

// this will handle uncertain error in
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandled rejection! 💥 💥💥');
  server.close(() => {
    process.exit(1);
  });
});

// server.close gives certain time to complete its task which is not related to DATA BASE and after that it will stop running
// in process.exit, 0 stands for success and 1 (or another number)stands for failure

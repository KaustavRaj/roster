const mongoose = require("mongoose");
const config = require("./config");

const {
  db: { host, port, name, atlas },
} = config;
const connectionURL = atlas || `mongodb://${host}:${port}/${name}`;

mongoose.connect(connectionURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

module.exports = mongoose;

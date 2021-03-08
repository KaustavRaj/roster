const env = process.env.ENV || "dev";

const dev = {
  app: {
    port: parseInt(process.env.PORT || process.env.DEV_APP_PORT || 5000),
  },
  db: {
    host: process.env.DEV_DB_HOST,
    port: parseInt(process.env.DEV_DB_PORT || 27017),
    name: process.env.DEV_DB_NAME,
    atlas: process.env.ATLAS_CONNECTION_URL,
  },
  token: {
    access_secret: process.env.ACCESS_TOKEN_SECRET,
    refresh_secret: process.env.REFRESH_TOKEN_SECRET,
    expiry_in: process.env.TOKEN_EXPIRY_TIME || "1d",
  },
  bcrypt: {
    salt_rounds: 10,
  },
  predefined_stages: {
    names: ["To Do", "In development", "To be reviewed", "Finished"],
  },
  user_search: {
    max_entries: 10,
  },
};

const config = {
  dev,
};

module.exports = config[env];

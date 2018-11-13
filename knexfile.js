module.exports = {
  client: process.env.DATABASE_CLIENT || 'pg',
  connection: process.env.DATABASE_URL,
  useNullAsDefault: true,
  searchPath: process.env.DATABASE_SEARCH_PATH,
  migrations: {
    directory: __dirname + '/migrations'
  }
};

const config = {
  MONGODB_URL: process.env.MONGODB_URL || 'mongodb://localhost',
  PORT: process.env.PORT || 8080,
  APP_NAME: process.env.APP_NAME || 'Learning Plan Manager',
};

export default config;
export { config };

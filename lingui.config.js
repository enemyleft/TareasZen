module.exports = {
  locales: ["en", "es", "de"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/locales/{locale}/messages",
      include: ["<rootDir>/src"],
    },
  ],
  format: "po",
};

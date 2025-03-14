module.exports = function override(config, env) {
    // Ignore les source maps pour html2pdf.js
    config.module.rules.push({
      test: /\.js$/,
      enforce: 'pre',
      use: ['source-map-loader'],
      include: [/node_modules\/html2pdf\.js/],
      options: {
        filterSourceMappingUrl: (url, resourcePath) => {
          if (/es6-promise\.map/.test(url)) {
            return false; // Ignore le fichier es6-promise.map
          }
          return true;
        },
      },
    });
  
    // Ignore les avertissements liés aux source maps manquants
    config.ignoreWarnings = [/Failed to parse source map/];
  
    return config;
  };
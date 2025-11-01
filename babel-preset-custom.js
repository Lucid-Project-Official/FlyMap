/**
 * Preset Babel personnalise qui force le plugin Flow en premier
 * pour transformer correctement la syntaxe component( dans React Native
 */
const metroPreset = require('metro-react-native-babel-preset');

module.exports = function (api, options = {}) {
  // Obtenir la config du preset Metro
  const metroConfig = metroPreset(api, options);
  
  // Plugin syntax-flow DOIT etre en premier pour parser Flow
  // Plugin transform-flow-strip-types DOIT etre en deuxieme pour transformer
  const flowSyntaxPlugin = require('@babel/plugin-syntax-flow');
  const flowStripPlugin = [
    require('@babel/plugin-transform-flow-strip-types'),
    {
      allowDeclareFields: true,
      requireDirective: false,
    },
  ];
  
  // S'assurer que les plugins Flow sont TOUJOURS en premier
  if (!metroConfig.plugins) {
    metroConfig.plugins = [];
  }
  
  // Retirer tous les plugins Flow existants
  metroConfig.plugins = metroConfig.plugins.filter(plugin => {
    if (Array.isArray(plugin)) {
      const pluginName = plugin[0];
      return pluginName !== '@babel/plugin-transform-flow-strip-types' &&
             pluginName !== '@babel/plugin-syntax-flow' &&
             pluginName !== require('@babel/plugin-transform-flow-strip-types') &&
             pluginName !== require('@babel/plugin-syntax-flow');
    }
    return plugin !== '@babel/plugin-transform-flow-strip-types' &&
           plugin !== '@babel/plugin-syntax-flow' &&
           plugin !== require('@babel/plugin-transform-flow-strip-types') &&
           plugin !== require('@babel/plugin-syntax-flow');
  });
  
  // Ajouter Flow syntax en PREMIER, puis Flow strip en DEUXIEME
  metroConfig.plugins.unshift(flowStripPlugin);
  metroConfig.plugins.unshift(flowSyntaxPlugin);
  
  // Modifier les overrides pour s'assurer que Flow est toujours en premier
  if (metroConfig.overrides && Array.isArray(metroConfig.overrides)) {
    metroConfig.overrides = metroConfig.overrides.map(override => {
      if (override.plugins && Array.isArray(override.plugins)) {
        // Retirer tous les plugins Flow existants
        override.plugins = override.plugins.filter(plugin => {
          if (Array.isArray(plugin)) {
            const pluginName = plugin[0];
            return pluginName !== '@babel/plugin-transform-flow-strip-types' &&
                   pluginName !== '@babel/plugin-syntax-flow';
          }
          return plugin !== '@babel/plugin-transform-flow-strip-types' &&
                 plugin !== '@babel/plugin-syntax-flow';
        });
        // Ajouter Flow syntax et strip en premier
        override.plugins.unshift(flowStripPlugin);
        override.plugins.unshift(flowSyntaxPlugin);
      }
      return override;
    });
  } else {
    metroConfig.overrides = [];
  }
  
  // Ajouter un override specifique pour react-native qui force Flow en premier
  metroConfig.overrides.unshift({
    test: /node_modules[\/\\]react-native[\/\\].*\.js$/,
    plugins: [flowSyntaxPlugin, flowStripPlugin],
  });
  
  return metroConfig;
};


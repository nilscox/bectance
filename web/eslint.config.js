import pluginQuery from '@tanstack/eslint-plugin-query';

import rootConfig from '../eslint.config.js';

export default [
  //
  ...pluginQuery.configs['flat/recommended'],
  ...rootConfig,
];

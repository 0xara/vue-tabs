// rollup.config.js
import vue from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify-es';
import minimist from 'minimist';
import postcss from 'rollup-plugin-postcss'

const argv = minimist(process.argv.slice(2));

const config = {
  input: 'src/entry.js',
  output: {
    name: 'VueTabs',
    exports: 'named',
  },
  plugins: [
	  replace({
		  'process.env.NODE_ENV': JSON.stringify('production'),
	  }),
	  postcss(),
	  vue({
		  css: false,
		  compileTemplate: true,
		  template: {
			  isProduction: true,
		  },
	  }),
	  babel({
		  babelrc: false,
		  presets: [['env', { modules: false }]],
		  exclude: 'node_modules/**',
		  externalHelpersWhitelist: ['objectSpread'],
		  plugins: ["transform-vue-jsx","transform-es2015-parameters","transform-es2015-destructuring","transform-es2015-spread","transform-object-rest-spread"]
	  }),
	  commonjs(),
  ],
};

// Only minify browser (iife) version
if (argv.format === 'iife') {
  config.plugins.push(uglify());
}

export default config;

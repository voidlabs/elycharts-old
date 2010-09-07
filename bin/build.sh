#/bin/sh

cat src/elycharts_defaults.js src/elycharts_core.js src/elycharts_manager_* src/elycharts_chart_* > dist/elycharts.js
yui-compressor dist/elycharts.js -o dist/elycharts.min.js


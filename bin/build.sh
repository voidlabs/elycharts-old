#/bin/sh

cat src/elycharts_defaults.js src/elycharts_core.js src/elycharts_manager_anchor.js src/elycharts_manager_animation.js src/elycharts_manager_highlight.js src/elycharts_manager_label.js src/elycharts_manager_legend.js src/elycharts_manager_mouse.js src/elycharts_manager_tooltip.js src/elycharts_chart_line.js src/elycharts_chart_pie.js > dist/elycharts.js
yui-compressor dist/elycharts.js -o dist/elycharts.min.js
cat src/elycharts_defaults.js src/elycharts_core.js src/elycharts_manager_* src/elycharts_chart_* > dist/elycharts-full.js
yui-compressor dist/elycharts-full.js -o dist/elycharts-full.min.js


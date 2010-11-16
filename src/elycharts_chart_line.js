/**********************************************************************
 * ELYCHARTS
 * A Javascript library to generate interactive charts with vectorial graphics.
 *
 * Copyright (c) 2010 Void Labs s.n.c. (http://void.it)
 * Licensed under the MIT (http://creativecommons.org/licenses/MIT/) license.
 **********************************************************************/

(function($) {

var featuresmanager = $.elycharts.featuresmanager;
var common = $.elycharts.common;

/***********************************************************************
 * CHART: LINE/BAR
 **********************************************************************/

$.elycharts.line = {
  init : function($env) {
  },
  
  draw : function(env) {
    if (common.executeIfChanged(env, ['values', 'series'])) {
      env.plots = {};
      env.axis = { x : {} };
      env.barno = 0;
      env.indexCenter = 'line';
    }
    
    var opt = env.opt;
    var plots = env.plots;
    var axis = env.axis;
    var paper = env.paper;
    
    var values = env.opt.values;
    var labels = env.opt.labels;
    var i, cum, props, serie, plot, labelsCount;
    
    // Valorizzazione di tutte le opzioni utili e le impostazioni interne di ogni grafico e dell'ambiente di lavoro
    if (common.executeIfChanged(env, ['values', 'series'])) {
      var idx = 0;
      var prevVisibleSerie = false;
      for (serie in values) {
        plot = {
          index : idx,
          type : false,
          visible : false
        };
        plots[serie] = plot;
        if (values[serie]) {
          props = common.areaProps(env, 'Series', serie);
          plot.type = props.type;
          if (props.type == 'bar')
            env.indexCenter = 'bar';
          
          if (props.visible) {
            plot.visible = true;
            if (!labelsCount || labelsCount < values[serie].length)
              labelsCount = values[serie].length;
            
            // Values
            // showValues: manage NULL elements (doing an avg of near points) for line serie
            var showValues = []
            for (i = 0; i < values[serie].length; i++) {
              var val = values[serie][i];
              if (val == null) {
                if (props.type == 'bar')
                  val = 0;
                else {
                  for (var j = i + 1; j < values[serie].length && values[serie][j] == null; j++) {}
                  var next = j < values[serie].length ? values[serie][j] : null;
                  for (var k = i -1; k >= 0 && values[serie][k] == null; k--) {}
                  var prev = k >= 0 ? values[serie][k] : null;
                  val = next != null ? (prev != null ? (next * (i - k) + prev * (j - i)) / (j - k) : next) : prev;
                }
              }
              showValues.push(val);
            }

            if (props.stacked && !(typeof props.stacked == 'string'))
              props.stacked = prevVisibleSerie;
            
            if (typeof props.stacked == 'undefined' || props.stacked == serie || props.stacked < 0 || !plots[props.stacked] || !plots[props.stacked].visible || plots[props.stacked].type != plot.type) {
              // NOT Stacked
              plot.ref = serie;
              if (props.type == 'bar')
                plot.barno = env.barno ++;
              plot.from = [];
              if (!props.cumulative)
                plot.to = showValues;
              else {
                plot.to = [];
                cum = 0;
                for (i = 0; i < showValues.length; i++)
                  plot.to.push(cum += showValues[i]);
              }
              for (i = 0; i < showValues.length; i++)
                plot.from.push(0);

            } else {
              // Stacked
              plot.ref = props.stacked;
              if (props.type == 'bar')
                plot.barno = plots[props.stacked].barno;
              plot.from = plots[props.stacked].stack;
              plot.to = [];
              cum = 0;
              if (!props.cumulative)
                for (i = 0; i < showValues.length; i++)
                  plot.to.push(plot.from[i] + showValues[i]);
              else
                for (i = 0; i < showValues.length; i++)
                  plot.to.push(plot.from[i] + (cum += showValues[i]));
              plots[props.stacked].stack = plot.to;
            }
            
            plot.stack = plot.to;
            plot.max = Math.max.apply(Math, plot.from.concat(plot.to));
            plot.min = Math.min.apply(Math, plot.from.concat(plot.to));
            
            // Assi (DEP: values, series)
            if (props.axis) {
              if (!axis[props.axis])
                axis[props.axis] = { plots : [] };
              axis[props.axis].plots.push(serie);
              if (typeof axis[props.axis].max == 'undefined')
                axis[props.axis].max = plot.max;
              else
                axis[props.axis].max = Math.max(axis[props.axis].max, plot.max);
              if (typeof axis[props.axis].min == 'undefined')
                axis[props.axis].min = plot.min;
              else
                axis[props.axis].min = Math.min(axis[props.axis].min, plot.min);
            }
            
            prevVisibleSerie = serie;
          }
        }
      }
    }

    // Labels normalization (if not set or less  than values)
    if (!labels)
      labels = [];
    while (labelsCount > labels.length)
      labels.push(null);
    labelsCount = labels.length;
    env.opt.labels = labels;

    // Prepare axis scale (values, series, axis)
    if (common.executeIfChanged(env, ['values', 'series', 'axis'])) {
      for (var lidx in axis) {
        props = common.areaProps(env, 'Axis', lidx);
        axis[lidx].props = props;
        
        if (typeof props.max != 'undefined')
          axis[lidx].max = props.max;
        if (typeof props.min != 'undefined')
          axis[lidx].min = props.min;

        if (axis[lidx].min == axis[lidx].max)
          axis[lidx].max = axis[lidx].min + 1;

        if (props.normalize && props.normalize > 0) {
          var v = Math.abs(axis[lidx].max);
          if (axis[lidx].min && Math.abs(axis[lidx].min) > v)
            v = Math.abs(axis[lidx].min);
          if (v) {
            var basev = Math.floor(Math.log(v)/Math.LN10) - (props.normalize - 1);
            // NOTE: On firefox Math.pow(10, -X) sometimes results in number noise (0.89999...), it's better to do 1/Math.pow(10,X)
            basev = basev >= 0 ? Math.pow(10, basev) : 1 / Math.pow(10, -basev);
            v = Math.ceil(v / basev / (opt.features.grid.ny ? opt.features.grid.ny : 1)) * basev * (opt.features.grid.ny ? opt.features.grid.ny : 1);
            // Calculation above, with decimal number sometimes insert some noise in numbers (eg: 8.899999... instead of 0.9), so i need to round result with proper precision
            v = Math.round(v / basev) * basev;
            // I need to store the normalization base for further roundin (eg: in axis label, sometimes calculation results in "number noise", so i need to round them with proper precision)
            axis[lidx].normalizationBase = basev;
            if (axis[lidx].max)
              axis[lidx].max = Math.ceil(axis[lidx].max / v) * v;
            if (axis[lidx].min)
              axis[lidx].min = Math.floor(axis[lidx].min / v) * v;
          }
        }
        if (axis[lidx].plots)
          for (var ii in axis[lidx].plots) {
            plots[axis[lidx].plots[ii]].max = axis[lidx].max;
            plots[axis[lidx].plots[ii]].min = axis[lidx].min;
          }
      }
    }

    var pieces = [];
    
    this.grid(env, pieces);
    
    // DEP: *
    var deltaX = (opt.width - opt.margins[3] - opt.margins[1]) / (labels.length > 1 ? labels.length - 1 : 1);
    var deltaBarX = (opt.width - opt.margins[3] - opt.margins[1]) / (labels.length > 0 ? labels.length : 1);

    for (serie in values) {
      props = common.areaProps(env, 'Series', serie);
      plot = plots[serie];

      if (props.lineCenter && props.lineCenter == 'auto')
        props.lineCenter = (env.indexCenter == 'bar');
      else if (props.lineCenter && env.indexCenter == 'line')
        env.indexCenter = 'bar';

      if (values[serie] && props.visible) {
        var deltaY = (opt.height - opt.margins[2] - opt.margins[0]) / (plot.max - plot.min);
        
        if (props.type == 'line') {
          // LINE CHART
          var linePath = [ 'LINE', [], props.rounded ];
          var fillPath = [ 'LINEAREA', [], [], props.rounded ];
          var dotPieces = [];
          
          for (i = 0, ii = labels.length; i < ii; i++)
            if (plot.to.length > i) {
              var indexProps = common.areaProps(env, 'Series', serie, i);

              var d = plot.to[i] > plot.max ? plot.max : (plot.to[i] < plot.min ? plot.min : plot.to[i]);
              var x = Math.round((props.lineCenter ? deltaBarX / 2 : 0) + opt.margins[3] + i * (props.lineCenter ? deltaBarX : deltaX));
              var y = Math.round(opt.height - opt.margins[2] - deltaY * (d - plot.min));
              var dd = plot.from[i] > plot.max ? plot.max : (plot.from[i] < plot.min ? plot.min : plot.from[i]);
              var yy = Math.round(opt.height - opt.margins[2] - deltaY * (dd - plot.min)) + ($.browser.msie ? 1 : 0);

              linePath[1].push([x, y]);

              if (props.fill) {
                fillPath[1].push([x, y]);
                fillPath[2].push([x, yy]);
              }
              if (indexProps.dot) {
                if (values[serie][i] == null && !indexProps.dotShowOnNull)
                  dotPieces.push({path : false, attr : false});
                else
                  dotPieces.push({path : [ [ 'CIRCLE', x, y, indexProps.dotProps.size ] ], attr : indexProps.dotProps}); // TODO Size should not be in dotProps (not an svg props)
              }
            }

          if (props.fill)
            pieces.push({ section : 'Series', serie : serie, subSection : 'Fill', path : [ fillPath ], attr : props.fillProps });
          else 
            pieces.push({ section : 'Series', serie : serie, subSection : 'Fill', path : false, attr : false });
          pieces.push({ section : 'Series', serie : serie, subSection : 'Plot', path : [ linePath ], attr : props.plotProps , mousearea : 'pathsteps'});
          
          if (dotPieces.length)
            pieces.push({ section : 'Series', serie : serie, subSection : 'Dot', paths : dotPieces });
          else
            pieces.push({ section : 'Series', serie : serie, subSection : 'Dot', path : false, attr : false });
          
        } else {
          pieceBar = [];
          
          // BAR CHART
          for (i = 0, ii = labels.length; i < ii; i++)
            if (plot.to.length > i) {
              if (plot.from[i] != plot.to[i]) {
                var bwid = Math.floor((deltaBarX - opt.barMargins) / env.barno);
                var bpad = bwid * (100 - props.barWidthPerc) / 200;
                var boff = opt.barMargins / 2 + plot.barno * bwid;

                var x1 = Math.floor(opt.margins[3] + i * deltaBarX + boff + bpad);
                var y1 = Math.round(opt.height - opt.margins[2] - deltaY * (plot.to[i] - plot.min));
                var y2 = Math.round(opt.height - opt.margins[2] - deltaY * (plot.from[i] - plot.min));

                pieceBar.push({path : [ [ 'RECT', x1, y1, x1 + bwid - bpad * 2, y2 ] ], attr : props.plotProps });
              } else
                pieceBar.push({path : false, attr : false });
            }
          
          if (pieceBar.length)
            pieces.push({ section : 'Series', serie : serie, subSection : 'Plot', paths: pieceBar, mousearea : 'paths' });
          else
            pieces.push({ section : 'Series', serie : serie, subSection : 'Plot', path: false, attr: false, mousearea : 'paths' });
        }
        
      } else {
        // Grafico non visibile / senza dati, deve comunque inserire i piece vuoti (NELLO STESSO ORDINE SOPRA!)
        if (props.type == 'line')
          pieces.push({ section : 'Series', serie : serie, subSection : 'Fill', path : false, attr : false });
        pieces.push({ section : 'Series', serie : serie, subSection : 'Plot', path: false, attr: false, mousearea : 'paths' });
        if (props.type == 'line')
          pieces.push({ section : 'Series', serie : serie, subSection : 'Dot', path : false, attr : false });
      }
    }
    featuresmanager.beforeShow(env, pieces);
    common.show(env, pieces);
    featuresmanager.afterShow(env, pieces);
    return pieces;
  }, 
  
  grid : function(env, pieces) {

    // DEP: axis, [=> series, values], labels, margins, width, height, grid*
    if (common.executeIfChanged(env, ['values', 'series', 'axis', 'labels', 'margins', 'width', 'height', 'features.grid'])) {
      var opt = env.opt;
      var props = env.opt.features.grid;
      var paper = env.paper;
      var axis = env.axis;
      var labels = env.opt.labels;
      var deltaX = (opt.width - opt.margins[3] - opt.margins[1]) / (labels.length > 1 ? labels.length - 1 : 1);
      var deltaBarX = (opt.width - opt.margins[3] - opt.margins[1]) / (labels.length > 0 ? labels.length : 1);
      var i, j, x, y, lw, labx, laby, labe, val, txt;
      // Label X axis
      var paths = [];
      var labelsCenter = props.labelsCenter;
      if (labelsCenter == 'auto')
        labelsCenter = (env.indexCenter == 'bar');

      if (axis.x && axis.x.props.labels)
        for (i = 0; i < labels.length; i++) 
          if (labels[i]) {
            if (axis.x.props.labelsSkip && i < axis.x.props.labelsSkip)
              labels[i] = false;
            else if (typeof labels[i] != 'boolean' || labels[i]) {
              val = labels[i];
              if (axis.x.props.labelsFormatHandler)
                val = axis.x.props.labelsFormatHandler(val);
              txt = (axis.x.props.prefix ? axis.x.props.prefix : "") + labels[i] + (axis.x.props.suffix ? axis.x.props.suffix : "");
              labx = (labelsCenter && axis.x.props.labelsAnchor != "start" ? Math.round(deltaBarX / 2) : 0) + opt.margins[3] + i * (labelsCenter ? deltaBarX : deltaX) + (axis.x.props.labelsMargin ? axis.x.props.labelsMargin : 0);
              laby = opt.height - opt.margins[2] + axis.x.props.labelsDistance;
              labe = paper.text(labx, laby, txt).attr(axis.x.props.labelsProps).toBack();
              if (axis.x.props.labelsRotate)
                // Rotazione label
                labe.attr({"text-anchor" : axis.x.props.labelsRotate > 0 ? "start" : "end"}).rotate(axis.x.props.labelsRotate, labx, laby).toBack();
              else if (props.nx == 'auto' && labx + labe.getBBox().width / (axis.x.props.labelsAnchor && axis.x.props.labelsAnchor == "start" ? 1 : 2) > opt.width) {
                // Il label has overflow on the right => delete it (if nx = auto)
                labe.hide();
                labels[i] = false;
              } else if (props.nx == 'auto' && (!axis.x.props.labelsAnchor || axis.x.props.labelsAnchor != "start") && labx - labe.getBBox().width / 2 < 0) {
                // Il label has overflow on the left => delete it (if nx = auto and labelsAnchor != start)
                labe.hide();
                labels[i] = false;
              } else if (axis.x.props.labelsAnchor && axis.x.props.labelsAnchor == "start") {
                // label not rotated buth with a labelsAnchor
                labe.attr({"text-anchor" : "start"});
                lw = labe.getBBox().width + (axis.x.props.labelsMargin ? axis.x.props.labelsMargin : 0) + (axis.x.props.labelsMarginRight ? axis.x.props.labelsMarginRight : 0) - (labelsCenter ? deltaBarX : deltaX);
                if (axis.x.props.labelsHideCovered && lw > 0) {
                  j = i + Math.ceil(lw / (labelsCenter ? deltaBarX : deltaX));
                  for (; i < j && i + 1 < labels.length; i++)
                    labels[i + 1] = false;
                }
              } else if (axis.x.props.labelsHideCovered) {
                // Manages labelsHideCovered with labelsAnchor != 'start'
                lw = (labe.getBBox().width + (axis.x.props.labelsMargin ? axis.x.props.labelsMargin : 0) + (axis.x.props.labelsMarginRight ? axis.x.props.labelsMarginRight : 0)) / 1 - (labelsCenter ? deltaBarX : deltaX);
                if (lw > 0) {
                  j = i + Math.ceil(lw / (labelsCenter ? deltaBarX : deltaX));
                  for (; i < j && i + 1 < labels.length; i++)
                    labels[i + 1] = false;
                }
              }
              paths.push({ path : [ [ 'RELEMENT', labe ] ], attr : false });
            }
          }
      pieces.push({ section : 'Axis', serie : 'x', subSection : 'Label', paths : paths });
          
      // Title X Axis
      if (axis.x && axis.x.props.title) {
        x = opt.margins[3] + Math.floor((opt.width - opt.margins[1] - opt.margins[3]) / 2);
        y = opt.height - opt.margins[2] + axis.x.props.titleDistance * ($.browser.msie ? axis.x.props.titleDistanceIE : 1);
        //paper.text(x, y, axis.x.props.title).attr(axis.x.props.titleProps);
        pieces.push({ section : 'Axis', serie : 'x', subSection : 'Title', path : [ [ 'TEXT', axis.x.props.title, x, y ] ], attr : axis.x.props.titleProps });
      } else
        pieces.push({ section : 'Axis', serie : 'x', subSection : 'Title', path : false, attr : false });

      // Label + Title L/R Axis
      for (var jj in ['l', 'r']) {
        j = ['l', 'r'][jj];
        if (axis[j] && axis[j].props.labels && props.ny) {
          paths = [];
          for (i = axis[j].props.labelsSkip ? axis[j].props.labelsSkip : 0; i <= props.ny; i++) {
            var deltaY = (opt.height - opt.margins[2] - opt.margins[0]) / props.ny;
            if (j == 'r') {
              labx = opt.width - opt.margins[1] + axis[j].props.labelsDistance;
              if (!axis[j].props.labelsProps["text-anchor"])
                axis[j].props.labelsProps["text-anchor"] = "start";
            } else {
              labx = opt.margins[3] - axis[j].props.labelsDistance;
              if (!axis[j].props.labelsProps["text-anchor"])
                axis[j].props.labelsProps["text-anchor"] = "end";
            }
            if (axis[j].props.labelsAnchor)
              axis[j].props.labelsProps["text-anchor"] = axis[j].props.labelsAnchor;
            // NOTE: Parenthesis () around division are useful to keep right number precision
            val = (axis[j].min + (i * ((axis[j].max - axis[j].min) / props.ny)));
            // Rounding with proper precision for "number sharpening"
            if (axis[j].normalizationBase)
              // I use (1 / ( 1 / norm ) ) to avoid some noise
              val = Math.round(val / axis[j].normalizationBase) / ( 1 / axis[j].normalizationBase );

            if (axis[j].props.labelsFormatHandler)
              val = axis[j].props.labelsFormatHandler(val);
            if (axis[j].props.labelsCompactUnits)
              val = common.compactUnits(val, axis[j].props.labelsCompactUnits);
            txt = (axis[j].props.prefix ? axis[j].props.prefix : "") + val + (axis[j].props.suffix ? axis[j].props.suffix : "");
            laby = opt.height - opt.margins[2] - i * deltaY;
            //var labe = paper.text(labx, laby + (axis[j].props.labelsMargin ? axis[j].props.labelsMargin : 0), txt).attr(axis[j].props.labelsProps).toBack();
            paths.push( { path : [ [ 'TEXT', txt, labx, laby + (axis[j].props.labelsMargin ? axis[j].props.labelsMargin : 0) ] ], attr : axis[j].props.labelsProps });
          }
          pieces.push({ section : 'Axis', serie : j, subSection : 'Label', paths : paths });
        } else
          pieces.push({ section : 'Axis', serie : j, subSection : 'Label', paths : [] });

        if (axis[j] && axis[j].props.title) {
          if (j == 'r')
            x = opt.width - opt.margins[1] + axis[j].props.titleDistance * ($.browser.msie ? axis[j].props.titleDistanceIE : 1);
          else
            x = opt.margins[3] - axis[j].props.titleDistance * ($.browser.msie ? axis[j].props.titleDistanceIE : 1);
          //paper.text(x, opt.margins[0] + Math.floor((opt.height - opt.margins[0] - opt.margins[2]) / 2), axis[j].props.title).attr(axis[j].props.titleProps).attr({rotation : j == 'l' ? 270 : 90});
          var attr = common._clone(axis[j].props.titleProps);
          attr.rotation = j == 'l' ? 270 : 90
          pieces.push({ section : 'Axis', serie : j, subSection : 'Title', path : [ [ 'TEXT', axis[j].props.title, x, opt.margins[0] + Math.floor((opt.height - opt.margins[0] - opt.margins[2]) / 2) ] ], attr : attr });
        } else
          pieces.push({ section : 'Axis', serie : j, subSection : 'Title', path : false, attr : false });
      }
      
      // Grid
      if (props.nx || props.ny) {
        var path = [], bandsH = [], bandsV = [],
          nx = props.nx == 'auto' ? (labelsCenter ? labels.length : labels.length - 1) : props.nx,
          ny = props.ny,
          rowHeight = (opt.height - opt.margins[2] - opt.margins[0]) / (ny ? ny : 1),
          columnWidth = (opt.width - opt.margins[1] - opt.margins[3]) / (nx ? nx : 1),
          forceBorderX1 = typeof props.forceBorder == 'object' ? props.forceBorder[3] : props.forceBorder,
          forceBorderX2 = typeof props.forceBorder == 'object' ? props.forceBorder[1] : props.forceBorder,
          forceBorderY1 = typeof props.forceBorder == 'object' ? props.forceBorder[0] : props.forceBorder,
          forceBorderY2 = typeof props.forceBorder == 'object' ? props.forceBorder[2] : props.forceBorder,
          drawH = ny > 0 ? (typeof props.draw == 'object' ? props.draw[0] : props.draw) : false,
          drawV = nx > 0 ? typeof props.draw == 'object' ? props.draw[1] : props.draw : false;

        if (ny > 0)
          for (i = 0; i < ny + 1; i++) {
            if (
              forceBorderY1 && i == 0 || // Show top line only if forced
              forceBorderY2 && i == ny ||  // Show bottom line only if forced
              drawH && i > 0 && i < ny // Show  other lines if draw = true
            ) {
              path.push(["M", opt.margins[3] - props.extra[3], opt.margins[0] + Math.round(i * rowHeight) ]);
              path.push(["L", opt.width - opt.margins[1] + props.extra[1], opt.margins[0] + Math.round(i * rowHeight)]);
            }
            if (i < ny) {
              if (i % 2 == 0 && props.evenHProps || i % 2 == 1 && props.oddHProps)
                bandsH.push({path : [ [ 'RECT',
                      opt.margins[3] - props.extra[3], opt.margins[0] + Math.round(i * rowHeight), // x1, y1
                      opt.width - opt.margins[1] + props.extra[1], opt.margins[0] + Math.round((i + 1) * rowHeight) // x2, y2
                  ] ], attr : i % 2 == 0 ? props.evenHProps : props.oddHProps });
              else
                bandsH.push({ path : false, attr: false})
            }
          }

        for (i = 0; i < nx + 1; i++) {
          if (
            forceBorderX1 && i == 0 || // Always show first line if forced
            forceBorderX2 && i == nx || // Always show last line if forced
            drawV && ( // To show other lines draw must be true
              (props.nx != 'auto' && i > 0 && i < ny) || // If nx = [number] show other lines (first and last are managed above with forceBorder)
              (props.nx == 'auto' && (typeof labels[i] != 'boolean' || labels[i])) // if nx = 'auto' show all lines if a label is associated
            )
            // Show all lines if props.nx is a number, or if label != false, AND draw must be true
          ) {
            path.push(["M", opt.margins[3] + Math.round(i * columnWidth), opt.margins[0] - props.extra[0] ]); //(t ? props.extra[0] : 0)]);
            path.push(["L", opt.margins[3] + Math.round(i * columnWidth), opt.height - opt.margins[2] + props.extra[2] ]); //(t ? props.extra[2] : 0)]);
          }
          if (i < nx) {
            if (i % 2 == 0 && props.evenVProps || i % 2 == 1 && props.oddVProps)
              bandsV.push({path : [ [ 'RECT',
                    opt.margins[3] + Math.round(i * columnWidth), opt.margins[0] - props.extra[0], // x1, y1
                    opt.margins[3] + Math.round((i + 1) * columnWidth), opt.height - opt.margins[2] + props.extra[2], // x2, y2
                ] ], attr : i % 2 == 0 ? props.evenVProps : props.oddVProps });
            else
              bandsV.push({ path : false, attr: false})
          }
        }
        
        pieces.push({ section : 'Grid', path : path.length ? path : false, attr : path.length ? props.props : false });
        pieces.push({ section : 'GridBandH', paths : bandsH });
        pieces.push({ section : 'GridBandV', paths : bandsV });

        var tpath = [];
        
        // Ticks asse X
        if (props.ticks.active && (typeof props.ticks.active != 'object' || props.ticks.active[0])) {
          for (i = 0; i < nx + 1; i++) {
            if (props.nx != 'auto' || typeof labels[i] != 'boolean' || labels[i]) {
              tpath.push(["M", opt.margins[3] + Math.round(i * columnWidth), opt.height - opt.margins[2] - props.ticks.size[1] ]);
              tpath.push(["L", opt.margins[3] + Math.round(i * columnWidth), opt.height - opt.margins[2] + props.ticks.size[0] ]);
            }
          }
        }
        // Ticks asse L
        if (props.ticks.active && (typeof props.ticks.active != 'object' || props.ticks.active[1]))
          for (i = 0; i < ny + 1; i++) {
            tpath.push(["M", opt.margins[3] - props.ticks.size[0], opt.margins[0] + Math.round(i * rowHeight) ]);
            tpath.push(["L", opt.margins[3] + props.ticks.size[1], opt.margins[0] + Math.round(i * rowHeight)]);
          }
        // Ticks asse R
        if (props.ticks.active && (typeof props.ticks.active != 'object' || props.ticks.active[2]))
          for (i = 0; i < ny + 1; i++) {
            tpath.push(["M", opt.width - opt.margins[1] - props.ticks.size[1], opt.margins[0] + Math.round(i * rowHeight) ]);
            tpath.push(["L", opt.width - opt.margins[1] + props.ticks.size[0], opt.margins[0] + Math.round(i * rowHeight)]);
          }
        
        pieces.push({ section : 'Ticks', path : tpath.length ? tpath : false, attr : tpath.length ? props.ticks.props : false });
      }
    }
  }
}

})(jQuery);

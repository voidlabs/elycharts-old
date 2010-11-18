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
 * CHART: PIE
 **********************************************************************/

$.elycharts.pie = {
  init : function($env) {
  },
  
  draw : function(env) {
    //var paper = env.paper;
    var opt = env.opt;
    
    var w = env.opt.width;
    var h = env.opt.height;
    var r = env.opt.r ? env.opt.r : Math.floor((w < h ? w : h) / 2.5);
    var cx = env.opt.cx ? env.opt.cx : Math.floor(w / 2);
    var cy = env.opt.cy ? env.opt.cx : Math.floor(h / 2);
    
    var cnt = 0, i, ii, serie, plot, props;
    for (serie in opt.values) {
      plot = {
        visible : false,
        total : 0,
        values : []
      };
      env.plots[serie] = plot;
      var serieProps = common.areaProps(env, 'Series', serie);
      if (serieProps.visible) {
        plot.visible = true;
        cnt ++;
        plot.values = opt.values[serie];
        for (i = 0, ii = plot.values.length; i < ii; i++)
          if (plot.values[i] > 0) {
            props = common.areaProps(env, 'Series', serie, i);
            if (typeof props.inside == 'undefined' || props.inside < 0)
              plot.total += plot.values[i];
          }
        for (i = 0; i < ii; i++)
          if (plot.values[i] < plot.total * opt.valueThresold) {
            plot.total = plot.total - plot.values[i];
            plot.values[i] = 0;
          }
      }
    }
    
    var rstep = r / cnt;
    var rstart = -rstep, rend = 0;
      
    var pieces = [];
    for (serie in opt.values) {
      plot = env.plots[serie];
      var paths = [];
      if (plot.visible) {
        rstart += rstep;
        rend += rstep;
        var angle = env.opt.startAngle, angleplus = 0, anglelimit = 0;
      
        if (plot.total == 0) {
          env.emptySeries = true;
          props = common.areaProps(env, 'Series', 'empty');
          paths.push({ path : [ [ 'CIRCLE', cx, cy, r ] ], attr : props.plotProps });

        } else {
          env.emptySeries = false;
          for (i = 0, ii = plot.values.length; i < ii; i++) {
            var value = plot.values[i];
            if (value > 0) {
              props = common.areaProps(env, 'Series', serie, i);
              if (typeof props.inside == 'undefined' || props.inside < 0) {
                angle += anglelimit;
                angleplus = 360 * value / plot.total;
                anglelimit = angleplus;
              } else {
                angleplus = 360 * values[props.inside] / plot.total * value / values[props.inside];
              }
              var rrstart = rstart, rrend = rend;
              if (props.r) {
                if (props.r > 0) {
                  if (props.r <= 1)
                    rrend = rstart + rstep * props.r;
                  else
                    rrend = rstart + props.r;
                } else {
                  if (props.r >= -1)
                    rrstart = rstart + rstep * (-props.r);
                  else
                    rrstart = rstart - props.r;
                }
              }
              
              if (!env.opt.clockwise)
                paths.push({ path : [ [ 'SLICE', cx, cy, rrend, rrstart, angle, angle + angleplus ] ], attr : props.plotProps });
              else
                paths.push({ path : [ [ 'SLICE', cx, cy, rrend, rrstart, - angle - angleplus, - angle ] ], attr : props.plotProps });
            } else
              paths.push({ path : false, attr : false });
          }
        }
      } else {
        // Even if serie is not visible it's better to put some empty path (for better transitions). It's not mandatory, just better
        if (opt.values[serie] && opt.values[serie].length)
          for (i = 0, ii = opt.values[serie].length; i < ii; i++)
            paths.push({ path : false, attr : false });
      }

      pieces.push({ section : 'Series', serie : serie, subSection : 'Plot', paths : paths , mousearea : 'paths'});
    }
    
    featuresmanager.beforeShow(env, pieces);
    common.show(env, pieces);
    featuresmanager.afterShow(env, pieces);
    return pieces;
  }
}

})(jQuery);

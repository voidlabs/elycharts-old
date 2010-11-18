/**********************************************************************
 * ELYCHARTS
 * A Javascript library to generate interactive charts with vectorial graphics.
 *
 * Copyright (c) 2010 Void Labs s.n.c. (http://void.it)
 * Licensed under the MIT (http://creativecommons.org/licenses/MIT/) license.
 **********************************************************************/

(function($) {

//var featuresmanager = $.elycharts.featuresmanager;
var common = $.elycharts.common;

/***********************************************************************
 * FEATURE: LEGEND
 **********************************************************************/

$.elycharts.legendmanager = {
  
  afterShow : function(env, pieces) {
    if (!env.opt.legend || env.opt.legend.length == 0)
      return;

    var props = env.opt.features.legend;
    
    if (props.x == 'auto') {
      var autox = 1;
      props.x = 0;
    }
    if (props.width == 'auto') {
      var autowidth = 1;
      props.width = env.opt.width;
    }
    
    var borderPath = [ [ 'RECT', props.x, props.y, props.x + props.width, props.y + props.height, props.r ] ];
    var border = common.showPath(env, borderPath).attr(props.borderProps);
    if (autox || autowidth)
      border.hide();
    
    var wauto = 0;
    var items = [];
    // env.opt.legend normalmente è { serie : 'Legend', ... }, per i pie invece { serie : ['Legend', ...], ... }
    var legendCount = 0;
    var serie, data, h, w, x, y, xd;
    for (serie in env.opt.legend) {
      if (env.opt.type != 'pie')
        legendCount ++;
      else
        legendCount += env.opt.legend[serie].length;
    }
    var i = 0;
    for (serie in env.opt.legend) {
      if (env.opt.type != 'pie')
        data = [ env.opt.legend[serie] ];
      else
        data = env.opt.legend[serie];

      for (var j in data) {
        var sprops = common.areaProps(env, 'Series', serie, env.opt.type == 'pie' ? j : false);
        var dprops = $.extend(true, {}, props.dotProps);
        if (sprops.legend && sprops.legend.dotProps)
          dprops = $.extend(true, dprops, sprops.legend.dotProps);
        if (!dprops.fill && env.opt.type == 'pie') {
          if (sprops.color)
            dprops.fill = sprops.color;
          if (sprops.plotProps && sprops.plotProps.fill)
            dprops.fill = sprops.plotProps.fill;
        }
        var dtype = sprops.legend && sprops.legend.dotType ? sprops.legend.dotType : props.dotType;
        var dwidth = sprops.legend && sprops.legend.dotWidth ? sprops.legend.dotWidth : props.dotWidth;
        var dheight = sprops.legend && sprops.legend.dotHeight ? sprops.legend.dotHeight : props.dotHeight;
        var dr = sprops.legend && sprops.legend.dotR ? sprops.legend.dotR : props.dotR;
        var tprops = sprops.legend && sprops.legend.textProps ? sprops.legend.textProps : props.textProps;
        
        if (!props.horizontal) {
          // Posizione dell'angolo in alto a sinistra
          h = (props.height - props.margins[0] - props.margins[2]) / legendCount;
          w = props.width - props.margins[1] - props.margins[3];
          x = Math.floor(props.x + props.margins[3]);
          y = Math.floor(props.y + props.margins[0] + h * i);
        } else {
          h = props.height - props.margins[0] - props.margins[2];
          if (!props.itemWidth || props.itemWidth == 'fixed') {
            w = (props.width - props.margins[1] - props.margins[3]) / legendCount;
            x = Math.floor(props.x + props.margins[3] + w * i);
          } else {
            w = (props.width - props.margins[1] - props.margins[3]) - wauto;
            x = props.x + props.margins[3] + wauto;
          }
          y = Math.floor(props.y + props.margins[0]);
        }
        
        if (dtype == "rect") {
          items.push(common.showPath(env, [ [ 'RECT', props.dotMargins[0] + x, y + Math.floor((h - dheight) / 2), props.dotMargins[0] + x + dwidth, y + Math.floor((h - dheight) / 2) + dheight, dr ] ]).attr(dprops));
          xd = props.dotMargins[0] + dwidth + props.dotMargins[1];
        } else if (dtype == "circle") {
          items.push(common.showPath(env, [ [ 'CIRCLE', props.dotMargins[0] + x + dr, y + (h / 2), dr ] ]).attr(dprops));
          xd = props.dotMargins[0] + dr * 2 + props.dotMargins[1];
        }
        
        var text = data[j];
        var t = common.showPath(env, [ [ 'TEXT', text, x + xd, y + Math.ceil(h / 2) + ($.browser.msie ? 2 : 0) ] ]).attr({"text-anchor" : "start"}).attr(tprops); //.hide();
        items.push(t);
        while (t.getBBox().width > (w - xd) && t.getBBox().width > 10) {
          text = text.substring(0, text.length - 1);
          t.attr({text : text});
        }
        t.show();
        
        if (props.horizontal && props.itemWidth == 'auto')
          wauto += xd + t.getBBox().width + 4;
        else if (!props.horizontal && autowidth)
          wauto = t.getBBox().width + xd > wauto ? t.getBBox().width + xd : wauto;
        else
          wauto += w;

        i++;
      }
    }
      
    if (autowidth)
      props.width = wauto + props.margins[3] + props.margins[1] - 1;
    if (autox) {
      props.x = Math.floor((env.opt.width - props.width) / 2);
      for (i in items) {
        if (items[i].attrs.x)
          items[i].attr('x', items[i].attrs.x + props.x);
        else
          items[i].attr('path', common.movePath(env, items[i].attrs.path, [props.x, 0]));
      }
    }
    if (autowidth || autox) {
      borderPath = [ [ 'RECT', props.x, props.y, props.x + props.width, props.y + props.height, props.r ] ];
      border.attr(common.getSVGProps(common.preparePathShow(env, borderPath)));
      //border.attr({path : common.preparePathShow(env, common.getSVGPath(borderPath))});
      border.show();
    }
  }
}

$.elycharts.featuresmanager.register($.elycharts.legendmanager, 90);

})(jQuery);

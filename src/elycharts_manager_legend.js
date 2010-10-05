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
    for (var serie in env.opt.legend) {
      if (env.opt.type != 'pie') {
        var data = {};
        data[serie] = env.opt.legend[serie];
        var legendCount = env.opt.legend.length;
      } else {
        var data = env.opt.legend[serie];
        var legendCount = env.opt.legend[serie].length;
      }
      for (var i in data) {
        var sprops = common.areaProps(env, 'Series', serie, env.opt.type == 'pie' ? i : false);
        var dprops = sprops.legend && sprops.legend.dotProps ? sprops.legend.dotProps : props.dotProps;
        var dtype = sprops.legend && sprops.legend.dotType ? sprops.legend.dotType : props.dotType;
        var dwidth = sprops.legend && sprops.legend.dotWidth ? sprops.legend.dotWidth : props.dotWidth;
        var dheight = sprops.legend && sprops.legend.dotHeight ? sprops.legend.dotHeight : props.dotHeight;
        var dr = sprops.legend && sprops.legend.dotR ? sprops.legend.dotR : props.dotR;
        var tprops = sprops.legend && sprops.legend.textProps ? sprops.legend.textProps : props.textProps;
        
        if (!props.horizontal) {
          // Posizione dell'angolo in alto a sinistra
          var h = (props.height - props.margins[0] - props.margins[2]) / legendCount;
          var w = props.width - props.margins[1] - props.margins[3];
          var x = Math.floor(props.x + props.margins[3]);
          var y = Math.floor(props.y + props.margins[0] + h * i);
        } else {
          var h = props.height - props.margins[0] - props.margins[2];
          if (!props.itemWidth || props.itemWidth == 'fixed') {
            var w = (props.width - props.margins[1] - props.margins[3]) / legendCount;
            var x = Math.floor(props.x + props.margins[3] + w * i);
          } else {
            var w = (props.width - props.margins[1] - props.margins[3]) - wauto;
            var x = props.x + props.margins[3] + wauto;
          }
          var y = Math.floor(props.y + props.margins[0]);
        }
        
        if (dtype == "rect") {
          items.push(common.showPath(env, [ [ 'RECT', props.dotMargins[0] + x, y + Math.floor((h - dheight) / 2), props.dotMargins[0] + x + dwidth, y + Math.floor((h - dheight) / 2) + dheight, dr ] ]).attr(dprops));
          var xd = props.dotMargins[0] + dwidth + props.dotMargins[1];
        } else if (dtype == "circle") {
          items.push(common.showPath(env, [ [ 'CIRCLE', props.dotMargins[0] + x + dr, y + dr, dr ] ]).attr(dprops));
          var xd = props.dotMargins[0] + dr * 2 + props.dotMargins[1];
        }
        
        var text = data[i];
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
      }
    }
      
    if (autowidth)
      props.width = wauto + props.margins[3] + props.margins[1];
    if (autox) {
      props.x = Math.floor((env.opt.width - props.width) / 2);
      for (var i in items) {
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

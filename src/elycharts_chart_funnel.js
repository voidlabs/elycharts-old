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
 * CHART: FUNNEL
 **********************************************************************/

$.elycharts.funnel = {
  
  init : function($env) {
  },
  
  draw : function(env) {
    var paper = env.paper;
    var opt = env.opt;
    
    env.xmin = opt.margins[3];
    env.xmax = opt.width - opt.margins[1];
    env.ymin = opt.margins[0] + Math.abs(opt.rh);

    for (var serie in opt.values) {
      var values = opt.values[serie];
      
      var lastwidthratio = opt.method == 'width' ? values[values.length - 1] / (values[0] ? values[0] : 1) :
        Math.sqrt(values[values.length - 1] / (values[0] ? values[0] : 1) * Math.pow(1 / 2, 2)) * 2;
      
      env.ymax = opt.height - opt.margins[2] - lastwidthratio * Math.abs(opt.rh);
      
      var pieces = this.pieces(env, serie, 0, 1, 1, values);
    }
      
    featuresmanager.beforeShow(env, pieces);
    common.show(env, pieces);
    featuresmanager.afterShow(env, pieces);
    return pieces;
  },
  
  pieces : function(env, serie, hstart, hend, wratio, values) {
    var path, pieces = [], opt = env.opt;
    
    var v0 = values[0] ? values[0] : 1;
    var h = hstart; // Starting height
    var hslices = (hend - hstart - opt.topSector - opt.bottomSector) / (values.length > 1 ? values.length - 1 : 1);
    var w = wratio; // Starting width
    if ((path = this.edge(env, h, w, true)))
      pieces.push({path : path, section: 'Edge', attr : env.opt.edgeProps});
    if (opt.topSector > 0 && (path = this.section(env, h, h = h + opt.topSector, w, w)))
      pieces.push({path : path.path, center: path.center, rect: path.rect, section: 'Sector', serie: 'top', attr : env.opt.topSectorProps});
    var paths = [];  
    for (var i = 1; i < values.length; i++) {
      var v = values[0] ? values[i] : 1;
      // METODO "cutarea"
      // area taglio attuale / area taglio iniziale = valore attuale / valore iniziare
      // => larghezza attuale = sqrt(values[i] / values[0] * pow(larghezza iniziale / 2, 2)) * 2
      if ((path = this.section(env, h, h = h + hslices, w,
        opt.method == 'width' ? w = v / v0 * wratio : w = Math.sqrt(v / v0 * Math.pow(wratio / 2, 2)) * 2)))
      var props = common.areaProps(env, 'Series', serie, i - 1);
      paths.push({path : path.path, center: path.center, rect: path.rect, attr : props.plotProps});
    }
    pieces.push({section: 'Series', serie: serie, paths : paths, subSection : 'Plot', mousearea : 'paths' });
    
    if (opt.bottomSector > 0 && (path = this.section(env, h, h = h + opt.bottomSector, w, w)))
      pieces.push({path : path.path, center: path.center, rect: path.rect, section: 'Sector', serie: 'bottom', attr : env.opt.bottomSectorProps});
    if ((path = this.edge(env, h, w, false)))
      pieces.push({path : path, section : 'Edge', attr : env.opt.edgeProps});

    return pieces;
  },
  
  section : function(env, hfrom, hto, wfrom, wto) {
    x1a = env.xmin + (env.xmax - env.xmin) * (wfrom / -2 + 1/2);
    x2a = env.xmin + (env.xmax - env.xmin) * (wfrom / 2 + 1/2);
    x1b = env.xmin + (env.xmax - env.xmin) * (wto / -2 + 1/2);
    x2b = env.xmin + (env.xmax - env.xmin) * (wto / 2 + 1/2);
    y1 = env.ymin + (env.ymax - env.ymin) * hfrom;
    y2 = env.ymin + (env.ymax - env.ymin) * hto;
    var rwa = (x2a - x1a) / 2;
    var rha = rwa / (env.xmax - env.xmin) * 2 * Math.abs(env.opt.rh);
    var rwb = (x2b - x1b) / 2;
    var rhb = rwb / (env.xmax - env.xmin) * 2 * Math.abs(env.opt.rh);

    var pathLn = [];
    
    pathLn.push(['M', x1a, y1]);
    if (env.opt.rh != 0)
      pathLn.push(['A', rwa, rha, 0, 0, env.opt.rh > 0 ? 1 : 0, x2a, y1]);
    else
      pathLn.push(['L', x2a, y1]);
    pathLn.push(['L', x2b, y2]);
    if (env.opt.rh != 0)
      pathLn.push(['A', rwb, rhb, 0, 0, env.opt.rh > 0 ? 0 : 1, x1b, y2]);
    else
      pathLn.push(['L', x1b, y2]);
    pathLn.push(['z']);
    
    return {path: pathLn, center: [(x2a + x1a) / 2, (y2 + y1) / 2 + (env.opt.rh > 0 ? -1 : +1) * (rha + rhb) / 2], rect: [x1a, y1, x2a, y2]};
  },

  edge : function(env, h, w, isTop) {
    if ((isTop && env.opt.rh >= 0) || (!isTop && env.opt.rh <= 0))
      return false;
    
    x1 = env.xmin + (env.xmax - env.xmin) * (w / -2 + 1/2);
    x2 = env.xmin + (env.xmax - env.xmin) * (w / 2 + 1/2);
    y = env.ymin + (env.ymax - env.ymin) * h;
    var rw = (x2 - x1) / 2;
    var rh = rw / (env.xmax - env.xmin) * 2 * Math.abs(env.opt.rh);

    var pathLn = [];
    pathLn.push(['M', x1, y]);
    pathLn.push(['A', rw, rh, 0, 0, env.opt.rh < 0 ? 1 : 0, x2, y]);
    pathLn.push(['A', rw, rh, 0, 0, env.opt.rh < 0 ? 1 : 0, x1, y]);
    pathLn.push(['z']);
    return pathLn;
  }
};

})(jQuery);

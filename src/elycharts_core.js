/*!*********************************************************************
 * ELYCHARTS
 * A Javascript library to generate interactive charts with vectorial graphics.
 *
 * Copyright (c) 2010 Void Labs s.n.c. (http://void.it)
 * Licensed under the MIT (http://creativecommons.org/licenses/MIT/) license.
 **********************************************************************/

(function($) {
if (!$.elycharts)
  $.elycharts = {};

$.elycharts.lastId = 0;

/***********************************************************************
 * INITIALIZATION / MAIN CALL
 **********************************************************************/

$.fn.chart = function($options) {
  if (!this.length)
    return this;
  
  var $env = this.data('elycharts_env');
  
  if (!$env) {
    // First call, initialization
    
    if (!$options || !$options.type || !$.elycharts.templates[$options.type]) {
      alert('ElyCharts ERROR: chart type is not specified');
      return false;
    }
    $env = _initEnv(this, $options);
    
    $env.pieces = $.elycharts[$env.opt.type].draw($env);
    
    this.data('elycharts_env', $env);
    
  } else {
    $options = _normalizeOptions($options);
    
    // Already initialized
    $env.oldopt = common._clone($env.opt);
    $env.opt = $.extend(true, $env.opt, $options);
    $env.newopt = $options;
    
    $env.pieces = $.elycharts[$env.opt.type].draw($env);
  }
  
  return this;
}

function _initEnv($container, $options) {
  var k;
  // Compatibility with old $.elysia_charts.default_options and $.elysia_charts.templates
  if ($.elysia_charts) {
    if ($.elysia_charts.default_options)
      for (k in $.elysia_charts.default_options)
        $.elycharts.templates[k] = $.elysia_charts.default_options[k];
    if ($.elysia_charts.templates)
      for (k in $.elysia_charts.templates)
        $.elycharts.templates[k] = $.elysia_charts.templates[k];
  }

  // TODO Optimize extend cicle
  if (!$options.template)
    $options.template = $options.type;
    
  while ($options.template) {
    var d = $options.template;
    delete $options.template;
    $options = $.extend(true, {}, $.elycharts.templates[d], $options);
  }
  
  $options = _normalizeOptions($options);
  
  if (!$options.width)
    $options.width = $container.width();
  if (!$options.height)
    $options.height = $container.height();
    
	var $env = {
    id : $.elycharts.lastId ++,
		paper : common._RaphaelInstance($container.get()[0], $options.width, $options.height),
    container : $container,
		plots : [],
		opt : $options
	};
  // Rendering a transparent pixel up-left. Thay way SVG area is well-covered (else the position starts at first real object, and that mess-ups everything)
  $env.paper.rect(0,0,1,1).attr({opacity: 0});
  
  $.elycharts[$options.type].init($env);
	
	return $env;
}

/**
 * Normalize options passed (primarly for backward compatibility)
 * -
 */
function _normalizeOptions($options) {
  if ($options.type == 'pie' || $options.type == 'funnel') {
    if ($options.values && $.isArray($options.values) && !$.isArray($options.values[0]))
      $options.values = { root : $options.values };
    if ($options.tooltips && $.isArray($options.tooltips) && !$.isArray($options.tooltips[0]))
      $options.tooltips = { root : $options.tooltips };
    if ($options.anchors && $.isArray($options.anchors) && !$.isArray($options.anchors[0]))
      $options.anchors = { root : $options.anchors };
    if ($options.balloons && $.isArray($options.balloons) && !$.isArray($options.balloons[0]))
      $options.balloons = { root : $options.balloons };
    if ($options.legend && $.isArray($options.legend) && !$.isArray($options.legend[0]))
      $options.legend = { root : $options.legend };
  }
  
  if ($options.defaultSeries) {
    _normalizeOptionsColor($options, $options.defaultSeries);
    if ($options.defaultSeries.stackedWith) {
      $options.defaultSeries.stacked = $options.defaultSeries.stackedWith;
      delete $options.defaultSeries.stackedWith;
    }
  }
    
  if ($options.series)
    for (var serie in $options.series) {
      _normalizeOptionsColor($options, $options.series[serie]);
      if ($options.series[serie].values)
        for (var value in $options.series[serie].values)
          _normalizeOptionsColor($options, $options.series[serie].values[value]);
      
      if ($options.series[serie].stackedWith) {
        $options.series[serie].stacked = $options.series[serie].stackedWith;
        delete $options.series[serie].stackedWith;
      }
    }
    
  if ($options.type == 'line') {
    if (!$options.features)
      $options.features = {};
    if (!$options.features.grid)
      $options.features.grid = {};
  
    if (typeof $options.gridNX != 'undefined') {
      $options.features.grid.nx = $options.gridNX;
      delete $options.gridNX;
    }
    if (typeof $options.gridNY != 'undefined') {
      $options.features.grid.ny = $options.gridNY;
      delete $options.gridNY;
    }
    if (typeof $options.gridProps != 'undefined') {
      $options.features.grid.props = $options.gridProps;
      delete $options.gridProps;
    }
    if (typeof $options.gridExtra != 'undefined') {
      $options.features.grid.extra = $options.gridExtra;
      delete $options.gridExtra;
    }
    if (typeof $options.gridForceBorder != 'undefined') {
      $options.features.grid.forceBorder = $options.gridForceBorder;
      delete $options.gridForceBorder;
    }
    
    if ($options.defaultAxis && $options.defaultAxis.normalize && ($options.defaultAxis.normalize == 'auto' || $options.defaultAxis.normalize == 'autony'))
      $options.defaultAxis.normalize = 2;
    
    if ($options.axis)
      for (var axis in $options.axis)
        if ($options.axis[axis] && $options.axis[axis].normalize && ($options.axis[axis].normalize == 'auto' || $options.axis[axis].normalize == 'autony'))
          $options.axis[axis].normalize = 2;
  }

  return $options;
}

function _normalizeOptionsColor($options, $section) {
  if ($section.color) {
    var color = $section.color;
    
    if (!$section.plotProps)
      $section.plotProps = {};
    if ($section.type == 'line' || ($options.type == 'line' && !$section.type)) {
      if ($section.plotProps && !$section.plotProps.stroke)
        $section.plotProps.stroke = color;
    } else {
      if ($section.plotProps && !$section.plotProps.fill)
        $section.plotProps.fill = color;
    }
      
    if (!$section.tooltip)
      $section.tooltip = {};
    if (!$section.tooltip.frameProps)
      $section.tooltip.frameProps = {};
    if ($section.tooltip && $section.tooltip.frameProps && !$section.tooltip.frameProps.stroke)
      $section.tooltip.frameProps.stroke = color;
      
    if (!$section.legend)
      $section.legend = {};
    if (!$section.legend.dotProps)
      $section.legend.dotProps = {};
    if ($section.legend.dotProps && !$section.legend.dotProps.fill)
      $section.legend.dotProps.fill = color;
      
    if ($options.type == 'line' && ($section.type == 'line' || !$section.type)) {
      if (!$section.dotProps)
        $section.dotProps = {};
      if ($section.dotProps && !$section.dotProps.fill)
        $section.dotProps.fill = color;
        
      if (!$section.fillProps)
        $section.fillProps = {};
      if ($section.fillProps && !$section.fillProps.fill)
        $section.fillProps.fill = color;
    }
  }
}

/***********************************************************************
 * COMMON
 **********************************************************************/

$.elycharts.common = {
  _RaphaelInstance : function(c, w, h) {
    var r = Raphael(c, w, h);

    r.customAttributes.slice = function (cx, cy, r, rint, aa1, aa2) {
      // Method body is for clockwise angles, but parameters passed are ccw
      a1 = 360 - aa2; a2 = 360 - aa1;
      //a1 = aa1; a2 = aa2;
      var flag = (a2 - a1) > 180;
      a1 = (a1 % 360) * Math.PI / 180;
      a2 = (a2 % 360) * Math.PI / 180;
      // a1 == a2  (but they where different before) means that there is a complete round (eg: 0-360). This should be shown
      if (a1 == a2 && aa1 != aa2)
        a2 += 359.99 * Math.PI / 180;
      
      return { path : rint ? [
        ["M", cx + r * Math.cos(a1), cy + r * Math.sin(a1)], 
        ["A", r, r, 0, +flag, 1, cx + r * Math.cos(a2), cy + r * Math.sin(a2)], 
        ["L", cx + rint * Math.cos(a2), cy + rint * Math.sin(a2)], 
        //["L", cx + rint * Math.cos(a1), cy + rint * Math.sin(a1)], 
        ["A", rint, rint, 0, +flag, 0, cx + rint * Math.cos(a1), cy + rint * Math.sin(a1)],
        ["z"]
      ] : [
        ["M", cx, cy], 
        ["l", r * Math.cos(a1), r * Math.sin(a1)], 
        ["A", r, r, 0, +flag, 1, cx + r * Math.cos(a2), cy + r * Math.sin(a2)], 
        ["z"]
      ] };
    };
    
    return r;
  },

  _clone : function(obj){
    if(obj == null || typeof(obj) != 'object')
      return obj;
    if (obj.constructor == Array)
      return [].concat(obj);
    var temp = new obj.constructor(); // changed (twice)
    for(var key in obj)
      temp[key] = this._clone(obj[key]);
    return temp;
  },
  
  _mergeObjects : function(o1, o2) {
    return $.extend(true, o1, o2);
    /*
    if (typeof o1 == 'undefined')
      return o2;
    if (typeof o2 == 'undefined')
      return o1;
    
    for (var idx in o2)
      if (typeof o1[idx] == 'undefined')
        o1[idx] = this._clone(o2[idx]);
      else if (typeof o2[idx] == 'object') {
        if (typeof o1[idx] == 'object')
          o1[idx] = this._mergeObjects(o1[idx], o2[idx]);
        else
          o1[idx] = this._mergeObjects({}, o2[idx]);
      }
      else 
        o1[idx] = this._clone(o2[idx]);
    return o1;*/
  },
  
  compactUnits : function(val, units) {
    for (var i = units.length - 1; i >= 0; i--) {
      var v = val / Math.pow(1000, i + 1);
      //console.warn(i, units[i], v, v * 10 % 10);
      if (v >= 1 && v * 10 % 10 == 0)
        return v + units[i];
    }
    return val;
  },
  
  getElementOriginalAttrs : function(element) {
    var attr = $(element.node).data('original-attr');
    if (!attr) {
      attr = element.attr();
      $(element.node).data('original-attr', attr);
    }
    return attr;
  },
  
  findInPieces : function(pieces, section, serie, index, subsection) {
    for (var i = 0; i < pieces.length; i++) {
      if (
        (typeof section == undefined || section == -1 || section == false || pieces[i].section == section) &&
        (typeof serie == undefined || serie == -1 || serie == false || pieces[i].serie == serie) &&
        (typeof index == undefined || index == -1 || index == false || pieces[i].index == index) &&
        (typeof subsection == undefined || subsection == -1 || subsection == false || pieces[i].subSection == subsection)
      )
        return pieces[i];
    }
    return false;
  },
  
  samePiecePath : function(piece1, piece2) {
    return (((typeof piece1.section == undefined || piece1.section == -1 || piece1.section == false) && (typeof piece2.section == undefined || piece2.section == -1 || piece2.section == false)) || piece1.section == piece2.section) && 
      (((typeof piece1.serie == undefined || piece1.serie == -1 || piece1.serie == false) && (typeof piece2.serie == undefined || piece2.serie == -1 || piece2.serie == false)) || piece1.serie == piece2.serie) && 
      (((typeof piece1.index == undefined || piece1.index == -1 || piece1.index == false) && (typeof piece2.index == undefined || piece2.index == -1 || piece2.index == false)) || piece1.index == piece2.index) && 
      (((typeof piece1.subSection == undefined || piece1.subSection == -1 || piece1.subSection == false) && (typeof piece2.subSection == undefined || piece2.subSection == -1 || piece2.subSection == false)) || piece1.subSection == piece2.subSection);
  },
  
  executeIfChanged : function(env, changes) {
    if (!env.newopt)
      return true;
    
    for (var i = 0; i < changes.length; i++) {
      if (changes[i][changes[i].length - 1] == "*") {
        for (var j in env.newopt)
          if (j.substring(0, changes[i].length - 1) + "*" == changes[i])
            return true;
      }
      else if (changes[i] == 'series' && (env.newopt.series || env.newopt.defaultSeries))
        return true;
      else if (changes[i] == 'axis' && (env.newopt.axis || env.newopt.defaultAxis))
        return true;
      else if (changes[i].substring(0, 9) == "features.") {
        changes[i] = changes[i].substring(9);
        if (env.newopt.features && env.newopt.features[changes[i]])
          return true;
      }
      else if (typeof env.newopt[changes[i]] != 'undefined')
        return true;
    }
    return false;
  },
  
  /**
   * Ottiene le proprietà di una "Area" definita nella configurazione (options),
   * identificata da section / serie / index / subsection, e facendo il merge
   * di tutti i defaults innestati.
   */
  areaProps : function(env, section, serie, index, subsection) {
    var props;

    // TODO fare una cache e fix del toLowerCase (devono solo fare la prima lettera
    if (!subsection) {
      if (typeof serie == 'undefined' || !serie)
        props = env.opt[section.toLowerCase()];

      else {
        props = this._clone(env.opt['default' + section]);
        if (env.opt[section .toLowerCase()] && env.opt[section.toLowerCase()][serie])
          props = this._mergeObjects(props, env.opt[section.toLowerCase()][serie]);

        if ((typeof index != 'undefined') && index >= 0 && props['values'] && props['values'][index])
          props = this._mergeObjects(props, props['values'][index]);
      }

    } else {
      props = this._clone(env.opt[subsection.toLowerCase()]);
      
      if (typeof serie == 'undefined' || !serie) {
        if (env.opt[section.toLowerCase()] && env.opt[section.toLowerCase()][subsection.toLowerCase()])
          props = this._mergeObjects(props, env.opt[section.toLowerCase()][subsection.toLowerCase()]);

      } else {
        if (env.opt['default' + section] && env.opt['default' + section][subsection.toLowerCase()])
          props = this._mergeObjects(props, env.opt['default' + section][subsection.toLowerCase()]);

        if (env.opt[section .toLowerCase()] && env.opt[section.toLowerCase()][serie] && env.opt[section.toLowerCase()][serie][subsection.toLowerCase()])
          props = this._mergeObjects(props, env.opt[section.toLowerCase()][serie][subsection.toLowerCase()]);
        
        if (props && (typeof index != 'undefined') && index > 0 && props['values'] && props['values'][index])
          props = this._mergeObjects(props, props['values'][index]);
      }
    }
    
    return props;
  },
  
  absrectpath : function(x1, y1, x2, y2, r) {
    // TODO Supportare r
    return [['M', x1, y1], ['L', x1, y2], ['L', x2, y2], ['L', x2, y1], ['z']];
  },
  
  linepathAnchors : function(p1x, p1y, p2x, p2y, p3x, p3y, rounded) {
    var method = 1;
    if (rounded && rounded.length) {
      method = rounded[1];
      rounded = rounded[0];
    }
    if (!rounded)
      rounded = 1;
    var l1 = (p2x - p1x) / 2,
        l2 = (p3x - p2x) / 2,
        a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
        b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
    a = p1y < p2y ? Math.PI - a : a;
    b = p3y < p2y ? Math.PI - b : b;
    if (method == 2) {
      // If added by Bago to avoid curves beyond min or max
      if ((a - Math.PI / 2) * (b - Math.PI / 2) > 0) {
        a = 0;
        b = 0;
      } else {
        if (Math.abs(a - Math.PI / 2) < Math.abs(b - Math.PI / 2))
          b = Math.PI - a;
        else
          a = Math.PI - b;
      }
    }

    var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2,
        dx1 = l1 * Math.sin(alpha + a) / 2 / rounded,
        dy1 = l1 * Math.cos(alpha + a) / 2 / rounded,
        dx2 = l2 * Math.sin(alpha + b) / 2 / rounded,
        dy2 = l2 * Math.cos(alpha + b) / 2 / rounded;
    return {
      x1: p2x - dx1,
      y1: p2y + dy1,
      x2: p2x + dx2,
      y2: p2y + dy2
    };
  },
  
  linepathRevert : function(path) {
    var rev = [], anc = false;
    for (var i = path.length - 1; i >= 0; i--) {
      switch (path[i][0]) {
        case "M" : case "L" :
          if (!anc)
            rev.push( [ rev.length ? "L" : "M", path[i][1], path[i][2] ] );
          else
            rev.push( [ "C", anc[0], anc[1], anc[2], anc[3], path[i][1], path[i][2] ] );
          anc = false;
          
          break;
        case "C" :
          if (!anc)
            rev.push( [ rev.length ? "L" : "M", path[i][5], path[i][6] ] );
          else
            rev.push( [ "C", anc[0], anc[1], anc[2], anc[3], path[i][5], path[i][6] ] );
          anc = [ path[i][3], path[i][4], path[i][1], path[i][2] ];
      }
    }
    return rev;
  },
  
  linepath : function ( points, rounded ) {
    var path = [];
    if (rounded) {
      var anc = false;
      for (var j = 0, jj = points.length - 1; j < jj ; j++) {
        if (j) {
          var a = this.linepathAnchors(points[j - 1][0], points[j - 1][1], points[j][0], points[j][1], points[j + 1][0], points[j + 1][1], rounded);
          path.push([ "C", anc[0], anc[1], a.x1, a.y1, points[j][0], points[j][1] ]);
          anc = [ a.x2, a.y2 ];
        } else {
          path.push([ "M", points[j][0], points[j][1] ]);
          anc = [ points[j][0], points[j][1] ];
        }
      }
      if (anc)
        path.push([ "C", anc[0], anc[1], points[jj][0], points[jj][1], points[jj][0], points[jj][1] ]);
      
    } else {
      for (var i = 0; i < points.length; i++)
        var x = points[i][0], y = points[i][1];
          path.push([i == 0 ? "M" : "L", x, y]);
    }
    
    return path;
  },

  lineareapath : function (points1, points2, rounded) {
    var path = this.linepath(points1, rounded), path2 = this.linepathRevert(this.linepath(points2, rounded));
    
    for (var i = 0; i < path2.length; i++)
      path.push( !i ? [ "L", path2[0][1], path2[0][2] ] : path2[i] );
    
    if (path.length)
      path.push(['z']);

    return path;
  },
  
  /**
   * Prende la coordinata X di un passo di un path
   */
  getX : function(p, pos) {
    switch (p[0]) {
      case 'CIRCLE':
        return p[1];
      case 'RECT':
        return p[!pos ? 1 : 3];
      case 'SLICE':
        return p[1];
      default:
        return p[p.length - 2];
    }
  },

  /**
   * Prende la coordinata Y di un passo di un path
   */
  getY : function(p, pos) {
    switch (p[0]) {
      case 'CIRCLE':
        return p[2];
      case 'RECT':
        return p[!pos ? 2 : 4];
      case 'SLICE':
        return p[2];
      default:
        return p[p.length - 1];
    }
  },
  
  /**
   * Prende il centro di un path
   * 
   * @param offset un offset [x,y] da applicare. Da notare che gli assi potrebbero essere dipendenti dalla figura 
   *        (ad esempio per lo SLICE x e' l'asse che passa dal centro del cerchio, y l'ortogonale).
   */
  getCenter: function(path, offset) {
    if (!path.path)
      return false;
    if (path.path.length == 0)
      return false;
    if (!offset)
      offset = [0, 0];
      
    if (path.center)
      return [path.center[0] + offset[0], path.center[1] + offset[1]];
      
    var p = path.path[0];
    switch (p[0]) {
      case 'CIRCLE':
        return [p[1] + offset[0], p[2] + offset[1]];
      case 'RECT':
        return [(p[1] + p[2])/2 + offset[0], (p[3] + p[4])/2 + offset[1]];
      case 'SLICE':
        var popangle = p[5] + (p[6] - p[5]) / 2;
        var rad = Math.PI / 180;
        return [
          p[1] + (p[4] + ((p[3] - p[4]) / 2) + offset[0]) * Math.cos(-popangle * rad) + offset[1] * Math.cos((-popangle-90) * rad), 
          p[2] + (p[4] + ((p[3] - p[4]) / 2) + offset[0]) * Math.sin(-popangle * rad) + offset[1] * Math.sin((-popangle-90) * rad)
        ];
    }
    
    // WARN Complex paths not supported
    alert('ElyCharts: getCenter with complex path not supported');
    
    return false;
  },
  
  /**
   * Sposta il path passato di un offset [x,y]
   * Il risultato e' il nuovo path
   * 
   * @param offset un offset [x,y] da applicare. Da notare che gli assi potrebbero essere dipendenti dalla figura 
   *        (ad esempio per lo SLICE x e' l'asse che passa dal centro del cerchio, y l'ortogonale).
   * @param marginlimit se true non sposta oltre i margini del grafico (applicabile solo su path standard o RECT)
   * @param simple se true lo spostamento e' sempre fatto sul sistema [x, y] complessivo (altrimenti alcuni elementi, come lo SLICE,
   *        si muovono sul proprio sistema di coordinate - la x muove lungo il raggio e la y lungo l'ortogonale)
   */
  movePath : function(env, path, offset, marginlimit, simple) {
    var p = [], i;
    if (path.length == 1 && path[0][0] == 'RECT')
      return [ [path[0][0], this._movePathX(env, path[0][1], offset[0], marginlimit), this._movePathY(env, path[0][2], offset[1], marginlimit), this._movePathX(env, path[0][3], offset[0], marginlimit), this._movePathY(env, path[0][4], offset[1], marginlimit)] ];
    if (path.length == 1 && path[0][0] == 'SLICE') {
      if (!simple) {
        var popangle = path[0][5] + (path[0][6] - path[0][5]) / 2;
        var rad = Math.PI / 180;
        var x = path[0][1] + offset[0] * Math.cos(- popangle * rad) + offset[1] * Math.cos((-popangle-90) * rad);
        var y = path[0][2] + offset[0] * Math.sin(- popangle * rad) + offset[1] * Math.cos((-popangle-90) * rad);
        return [ [path[0][0], x, y, path[0][3], path[0][4], path[0][5], path[0][6] ] ];
      }
      else
        return [ [ path[0][0], path[0][1] + offset[0], path[0][2] + offset[1], path[0][3], path[0][4], path[0][5], path[0][6] ] ];
    }
    if (path.length == 1 && path[0][0] == 'CIRCLE')
      return [ [ path[0][0], path[0][1] + offset[0], path[0][2] + offset[1], path[0][3] ] ];
    if (path.length == 1 && path[0][0] == 'TEXT')
      return [ [ path[0][0], path[0][1], path[0][2] + offset[0], path[0][3] + offset[1] ] ];
    if (path.length == 1 && path[0][0] == 'LINE') {
      for (i = 0; i < path[0][1].length; i++)
        p.push( [ this._movePathX(env, path[0][1][i][0], offset[0], marginlimit), this._movePathY(env, path[0][1][i][1], offset[1], marginlimit) ] );
      return [ [ path[0][0], p, path[0][2] ] ];
    }
    if (path.length == 1 && path[0][0] == 'LINEAREA') {
      for (i = 0; i < path[0][1].length; i++)
        p.push( [ this._movePathX(env, path[0][1][i][0], offset[0], marginlimit), this._movePathY(env, path[0][1][i][1], offset[1], marginlimit) ] );
      var pp = [];
      for (i = 0; i < path[0][2].length; i++)
        pp.push( [ this._movePathX(env, path[0][2][i][0], offset[0], marginlimit), this._movePathY(env, path[0][2][i][1], offset[1], marginlimit) ] );
      return [ [ path[0][0], p, pp, path[0][3] ] ];
    }

    var newpath = [];
    // http://www.w3.org/TR/SVG/paths.html#PathData
    for (var j = 0; j < path.length; j++) {
      var o = path[j];
      switch (o[0]) {
        case 'M': case 'm': case 'L': case 'l': case 'T': case 't':
          // (x y)+
          newpath.push([o[0], this._movePathX(env, o[1], offset[0], marginlimit), this._movePathY(env, o[2], offset[1], marginlimit)]);
          break;
        case 'A': case 'a':
          // (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+
          newpath.push([o[0], o[1], o[2], o[3], o[4], o[5], this._movePathX(env, o[6], offset[0], marginlimit), this._movePathY(env, o[7], offset[1], marginlimit)]);
          break;
        case 'C': case 'c':
          // (x1 y1 x2 y2 x y)+
          newpath.push([o[0], o[1], o[2], o[3], o[4], this._movePathX(env, o[5], offset[0], marginlimit), this._movePathY(env, o[6], offset[1], marginlimit)]);
          break;
        case 'S': case 's': case 'Q': case 'q':
          // (x1 y1 x y)+
          newpath.push([o[0], o[1], o[2], this._movePathX(env, o[3], offset[0], marginlimit), this._movePathY(env, o[4], offset[1], marginlimit)]);
          break;
        case 'z': case 'Z':
          newpath.push([o[0]]);
          break;
      }
    }
    
    return newpath;
  },
  
  _movePathX : function(env, x, dx, marginlimit) {
    if (!marginlimit)
      return x + dx;
    x = x + dx;
    return dx > 0 && x > env.opt.width - env.opt.margins[1] ? env.opt.width - env.opt.margins[1] : (dx < 0 && x < env.opt.margins[3] ? env.opt.margins[3] : x);
  },
  
  _movePathY : function(env, y, dy, marginlimit) {
    if (!marginlimit)
      return y + dy;
    y = y + dy;
    return dy > 0 && y > env.opt.height - env.opt.margins[2] ? env.opt.height - env.opt.margins[2] : (dy < 0 && y < env.opt.margins[0] ? env.opt.margins[0] : y);
  },

  /**
   * Ritorna le proprieta SVG da impostare per visualizzare il path non SVG passato (se applicabile, per CIRCLE e TEXT non lo e')
   */
  getSVGProps : function(path, prevprops) {
    var props = prevprops ? prevprops : {};
    var type = 'path', value;

    if (path.length == 1 && path[0][0] == 'RECT')
      value = common.absrectpath(path[0][1], path[0][2], path[0][3], path[0][4], path[0][5]);
    else if (path.length == 1 && path[0][0] == 'SLICE') {
      type = 'slice';
      value = [ path[0][1], path[0][2], path[0][3], path[0][4], path[0][5], path[0][6] ];
    } else if (path.length == 1 && path[0][0] == 'LINE')
      value = common.linepath( path[0][1], path[0][2] );
    else if (path.length == 1 && path[0][0] == 'LINEAREA')
      value = common.lineareapath( path[0][1], path[0][2], path[0][3] );
    else if (path.length == 1 && (path[0][0] == 'CIRCLE' || path[0][0] == 'TEXT' || path[0][0] == 'DOMELEMENT' || path[0][0] == 'RELEMENT'))
      return prevprops ? prevprops : false;
    else
      value = path;

    if (type != 'path' || (value && value.length > 0))
      props[type] = value;
    else if (!prevprops)
      return false;
    return props;
  },
  
  /**
   * Disegna il path passato
   * Gestisce la feature pixelWorkAround
   */
  showPath : function(env, path, paper) {
    path = this.preparePathShow(env, path);
    
    if (!paper)
      paper = env.paper;
    if (path.length == 1 && path[0][0] == 'CIRCLE')
      return paper.circle(path[0][1], path[0][2], path[0][3]);
    if (path.length == 1 && path[0][0] == 'TEXT')
      return paper.text(path[0][2], path[0][3], path[0][1]);
    var props = this.getSVGProps(path);

    // Props must be with some data in it
    var hasdata = false;
    for (var k in props) {
      hasdata = true;
      break;
    }

    return props && hasdata ? paper.path().attr(props) : false;
  },
  
  /**
   * Applica al path le modifiche per poterlo visualizzare
   * Per ora applica solo pixelWorkAround
   */
  preparePathShow : function(env, path) {
    return env.opt.features.pixelWorkAround.active ? this.movePath(env, this._clone(path), [.5, .5], false, true) : path;
  },
  
  /**
   * Ritorna gli attributi Raphael completi di un piece
   * Per attributi completi si intende l'insieme di attributi specificato, 
   * assieme a tutti gli attributi calcolati che determinano lo stato 
   * iniziale di un piece (e permettono di farlo ritornare a tale stato).
   * In genere viene aggiunto il path SVG, per il circle vengono aggiunti
   * i dati x,y,r
   */
  getPieceFullAttr : function(env, piece) {
    if (!piece.fullattr) {
      piece.fullattr = this._clone(piece.attr);
      if (piece.path)
        switch (piece.path[0][0]) {
          case 'CIRCLE':
            var ppath = this.preparePathShow(env, piece.path);
            piece.fullattr.cx = ppath[0][1];
            piece.fullattr.cy = ppath[0][2];
            piece.fullattr.r = ppath[0][3];
            break;
          case 'TEXT': case 'DOMELEMENT': case 'RELEMENT':
            break;
          default:
            piece.fullattr = this.getSVGProps(this.preparePathShow(env, piece.path), piece.fullattr);
        }
      if (typeof piece.fullattr.opacity == 'undefined')
        piece.fullattr.opacity = 1;
    }
    return piece.fullattr;
  },


  show : function(env, pieces) {
    pieces = this.getSortedPathData(pieces);

    common.animationStackStart(env);

    var previousElement = false;
    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i];

      if (typeof piece.show == 'undefined' || piece.show) {
        // If there is piece.animation.element, this is the old element that must be transformed to the new one
        piece.element = piece.animation && piece.animation.element ? piece.animation.element : false;
        piece.hide = false;

        if (!piece.path) {
          // Element should not be shown or must be hidden: nothing to prepare
          piece.hide = true;

        } else if (piece.path.length == 1 && piece.path[0][0] == 'TEXT') {
          // TEXT
          // Animation is not supported, so if there's an old element i must hide it (with force = true to hide it for sure, even if there's a new version of same element)
          if (piece.element) {
            common.animationStackPush(env, piece, piece.element, false, piece.animation.speed, piece.animation.easing, piece.animation.delay, true);
            piece.animation.element = false;
          }
          piece.element = this.showPath(env, piece.path);
          // If this is a transition i must position new element
          if (piece.element && env.newopt && previousElement)
            piece.element.insertAfter(previousElement);

        } else if (piece.path.length == 1 && piece.path[0][0] == 'DOMELEMENT') {
          // DOMELEMENT
          // Already shown
          // Animation not supported

        } else if (piece.path.length == 1 && piece.path[0][0] == 'RELEMENT') {
          // RAPHAEL ELEMENT
          // Already shown
          // Animation is not supported, so if there's an old element i must hide it (with force = true to hide it for sure, even if there's a new version of same element)
          if (piece.element) {
            common.animationStackPush(env, piece, piece.element, false, piece.animation.speed, piece.animation.easing, piece.animation.delay, true);
            piece.animation.element = false;
          }

          piece.element = piece.path[0][1];
          if (piece.element && previousElement)
            piece.element.insertAfter(previousElement);
          piece.attr = false;

        } else {
          // OTHERS
          if (!piece.element) {
            if (piece.animation && piece.animation.startPath && piece.animation.startPath.length)
              piece.element = this.showPath(env, piece.animation.startPath);
            else
              piece.element = this.showPath(env, piece.path);

            // If this is a transition i must position new element
            if (piece.element && env.newopt && previousElement)
              piece.element.insertAfter(previousElement);
          }
        }

        if (piece.element) {
          if (piece.attr) {
            if (!piece.animation) {
              // Standard piece visualization
              if (typeof piece.attr.opacity == 'undefined')
                piece.attr.opacity = 1;
              piece.element.attr(piece.attr);

            } else {
              // Piece animation
              if (!piece.animation.element)
                piece.element.attr(piece.animation.startAttr ? piece.animation.startAttr : piece.attr);
              //if (typeof animationAttr.opacity == 'undefined')
              //  animationAttr.opacity = 1;
              common.animationStackPush(env, piece, piece.element, this.getPieceFullAttr(env, piece), piece.animation.speed, piece.animation.easing, piece.animation.delay);
            }
          } else if (piece.hide)
            // Hide the piece
            common.animationStackPush(env, piece, piece.element, false, piece.animation.speed, piece.animation.easing, piece.animation.delay);

          previousElement = piece.element;
        }
      }
    }

    common.animationStackEnd(env);
  },

  /**
   * Given an array of pieces, return an array of single pathdata contained in pieces, sorted by zindex
   */
  getSortedPathData : function(pieces) {
    res = [];

    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i];
      if (piece.paths) {
        for (var j = 0; j < piece.paths.length; j++) {
          piece.paths[j].pos = res.length;
          piece.paths[j].parent = piece;
          res.push(piece.paths[j]);
        }
      } else {
        piece.pos = res.length;
        piece.parent = false;
        res.push(piece);
      }
    }
    return res.sort(function (a, b) {
      var za = typeof a.attr == 'undefined' || typeof a.attr.zindex == 'undefined' ? ( !a.parent || typeof a.parent.attr == 'undefined' || typeof a.parent.attr.zindex == 'undefined' ? 0 : a.parent.attr.zindex ) : a.attr.zindex;
      var zb = typeof b.attr == 'undefined' || typeof b.attr.zindex == 'undefined' ? ( !b.parent || typeof b.parent.attr == 'undefined' || typeof b.parent.attr.zindex == 'undefined' ? 0 : b.parent.attr.zindex ) : b.attr.zindex;
      return za < zb ? -1 : (za > zb ? 1 : (a.pos < b.pos ? -1 : (a.pos > b.pos ? 1 : 0)));
    });
  },

  animationStackStart : function(env) {
    if (!env.animationStackDepth || env.animationStackDepth == 0) {
      env.animationStackDepth = 0;
      env.animationStack = {};
    }
    env.animationStackDepth ++;
  },

  animationStackEnd : function(env) {
    env.animationStackDepth --;
    if (env.animationStackDepth == 0) {
      for (var delay in env.animationStack) {
        this._animationStackAnimate(env.animationStack[delay], delay);
        delete env.animationStack[delay];
      }
      env.animationStack = {};
    }
  },

  /**
   * Inserisce l'animazione richiesta nello stack di animazioni.
   * Nel caso lo stack non sia inizializzato esegue subito l'animazione.
   */ 
  animationStackPush : function(env, piece, element, newattr, speed, easing, delay, force) {
    if (typeof delay == 'undefined')
      delay = 0;

    if (!env.animationStackDepth || env.animationStackDepth == 0) {
      this._animationStackAnimate([{piece : piece, object : element, props : newattr, speed: speed, easing : easing, force : force}], delay);

    } else {
      if (!env.animationStack[delay])
        env.animationStack[delay] = [];
      
      env.animationStack[delay].push({piece : piece, object : element, props : newattr, speed: speed, easing : easing, force : force});
    }
  },
  
  _animationStackAnimate : function(stack, delay) {
    var caller = this;
    var func = function() {
      var a = stack.pop();
      caller._animationStackAnimateElement(a);
      
      while (stack.length > 0) {
        var b = stack.pop();
        caller._animationStackAnimateElement(b, a);
      }
    }
    if (delay > 0) 
      setTimeout(func, delay);
    else
      func();
  },
  
  _animationStackAnimateElement : function (a, awith) {
    //console.warn('call', a.piece.animationInProgress, a.force, a.piece.path, a.piece);

    if (a.force || !a.piece.animationInProgress) {
      
      // Metodo non documentato per bloccare l'animazione corrente
      a.object.stop();
      if (!a.props)
        a.props = { opacity : 0 }; // TODO Sarebbe da rimuovere l'elemento alla fine
        
      if (!a.speed || a.speed <= 0) {
        //console.warn('direct');
        a.object.attr(a.props);
        a.piece.animationInProgress = false;
        return;
      }
        
      a.piece.animationInProgress = true;
      //console.warn('START', a.piece.animationInProgress, a.piece.path, a.piece);
        
      // NOTA onEnd non viene chiamato se l'animazione viene bloccata con stop
      var onEnd = function() { 
        //console.warn('END', a.piece.animationInProgress, a.piece); 
        a.piece.animationInProgress = false 
      }
      
      if (awith)
        a.object.animateWith(awith, a.props, a.speed, a.easing ? a.easing : 'linear', onEnd);
      else
        a.object.animate(a.props, a.speed, a.easing ? a.easing : 'linear', onEnd);
    }
    //else console.warn('SKIP', a.piece.animationInProgress, a.piece.path, a.piece);
  }
}

var common = $.elycharts.common;

/***********************************************************************
 * FEATURESMANAGER
 **********************************************************************/

$.elycharts.featuresmanager = {
  
  managers : [],
  initialized : false,
  
  register : function(manager, priority) {
    $.elycharts.featuresmanager.managers.push([priority, manager]);
    $.elycharts.featuresmanager.initialized = false;
  },
  
  init : function() {
    $.elycharts.featuresmanager.managers.sort(function(a, b) { return a[0] < b[0] ? -1 : (a[0] == b[0] ? 0 : 1) });
    $.elycharts.featuresmanager.initialized = true;
  },
  
  beforeShow : function(env, pieces) {
    if (!$.elycharts.featuresmanager.initialized)
      this.init();
    for (var i = 0; i < $.elycharts.featuresmanager.managers.length; i++)
      if ($.elycharts.featuresmanager.managers[i][1].beforeShow)
        $.elycharts.featuresmanager.managers[i][1].beforeShow(env, pieces);
  },
  
  afterShow : function(env, pieces) {
    if (!$.elycharts.featuresmanager.initialized)
      this.init();
    for (var i = 0; i < $.elycharts.featuresmanager.managers.length; i++)
      if ($.elycharts.featuresmanager.managers[i][1].afterShow)
        $.elycharts.featuresmanager.managers[i][1].afterShow(env, pieces);
  },

  onMouseOver : function(env, serie, index, mouseAreaData) {
    if (!$.elycharts.featuresmanager.initialized)
      this.init();
    for (var i = 0; i < $.elycharts.featuresmanager.managers.length; i++)
      if ($.elycharts.featuresmanager.managers[i][1].onMouseOver)
        $.elycharts.featuresmanager.managers[i][1].onMouseOver(env, serie, index, mouseAreaData);
  },
  
  onMouseOut : function(env, serie, index, mouseAreaData) {
    if (!$.elycharts.featuresmanager.initialized)
      this.init();
    for (var i = 0; i < $.elycharts.featuresmanager.managers.length; i++)
      if ($.elycharts.featuresmanager.managers[i][1].onMouseOut)
        $.elycharts.featuresmanager.managers[i][1].onMouseOut(env, serie, index, mouseAreaData);
  },
  
  onMouseEnter : function(env, serie, index, mouseAreaData) {
    if (!$.elycharts.featuresmanager.initialized)
      this.init();
    for (var i = 0; i < $.elycharts.featuresmanager.managers.length; i++)
      if ($.elycharts.featuresmanager.managers[i][1].onMouseEnter)
        $.elycharts.featuresmanager.managers[i][1].onMouseEnter(env, serie, index, mouseAreaData);
  },
  
  onMouseChanged : function(env, serie, index, mouseAreaData) {
    if (!$.elycharts.featuresmanager.initialized)
      this.init();
    for (var i = 0; i < $.elycharts.featuresmanager.managers.length; i++)
      if ($.elycharts.featuresmanager.managers[i][1].onMouseChanged)
        $.elycharts.featuresmanager.managers[i][1].onMouseChanged(env, serie, index, mouseAreaData);
  },
  
  onMouseExit : function(env, serie, index, mouseAreaData) {
    if (!$.elycharts.featuresmanager.initialized)
      this.init();
    for (var i = 0; i < $.elycharts.featuresmanager.managers.length; i++)
      if ($.elycharts.featuresmanager.managers[i][1].onMouseExit)
        $.elycharts.featuresmanager.managers[i][1].onMouseExit(env, serie, index, mouseAreaData);
  }
}

})(jQuery);

/***********************************************

* OGGETTI USATI:

PIECE:
Contiene un elemento da visualizzare nel grafico. E' un oggetto con queste proprietà:

- section,[serie],[index],[subsection]: Dati che permettono di identificare che tipo
  di elemento è e a quale blocco della configurazione appartiene.
  Ad esempio gli elementi principali del chart hanno
  section="Series", serie=nome della serie, subSection = 'Plot'
- [paths]: Contiene un array di pathdata, nel caso questo piece è costituito da 
  piu' sottoelementi (ad esempio i Dots, o gli elementi di un Pie o Funnel)
- [PATHDATA.*]: Se questo piece e' costituito da un solo elemento, i suoi dati sono
  memorizzati direttamente nella root di PIECE.
- show: Proprieta' usata internamente per decidere se questo piece dovrà essere
  visualizzato o meno (in genere nel caso di una transizione che non ha variato
  questo piece, che quindi puo' essere lasciato allo stato precedente)
- hide: Proprieta' usata internamente per decidere se l'elemento va nascosto,
  usato in caso di transizione se l'elemento non è piu' presente.

PATHDATA:
I dati utili per visualizzare un path nel canvas:

- PATH: Il path che permette di disegnare l'elemento. Se NULL l'elemento è vuoto/ da
  non visualizzare (instanziato solo come placeholder)
- attr: gli attributi Raphael dell'elemento. NULL se path è NULL.
- [center]: centro del path
- [rect]: rettangolo che include il path

PATH:
Un array in cui ogni elemento determina un passo del percorso per disegnare il grafico.
E' una astrazione sul PATH SVG effettivo, e puo' avere alcuni valori speciali:
[ [ 'TEXT',  testo, x, y ] ]
[ [ 'CIRCLE', x, y, raggio ] ]
[ [ 'RECT', x1, y1, x2, y2, rounded ] ] (x1,y1 dovrebbero essere sempre le coordinate in alto a sx)
[ [ 'SLICE', x, y, raggio, raggio int, angolo1, angolo2 ] ] (gli angoli sono in gradi)
[ [ 'RELEMENT', element ] ] (elemento Raphael gia' disegnato)
[ [ 'DOMELEMENT', element ] ] (elemento DOM - in genere un DIV html - già disegnato)
[ ... Path SVG ... ]

------------------------------------------------------------------------

Z-INDEX:
0 : base
10 : tooltip
20 : interactive area (tutti gli elementi innescati dalla interactive area dovrebbero essere < 20)
25 : label / balloons (potrebbero essere resi cliccabili dall'esterno, quindi > 20)

------------------------------------------------------------------------

USEFUL RESOURCES:

http://docs.jquery.com/Plugins/Authoring
http://www.learningjquery.com/2007/10/a-plugin-development-pattern
http://dean.edwards.name/packer/2/usage/#special-chars

http://raphaeljs.com/reference.html#attr

TODO
* ottimizzare common.areaProps
* rifare la posizione del tooltip del pie
* ripristinare shadow

*********************************************/

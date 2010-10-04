/*!*********************************************************************
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
 * MOUSEMANAGER
 **********************************************************************/

$.elycharts.mousemanager = {

  afterShow : function(env, pieces) {
    if (!env.opt.interactive)
      return;
      
    if (env.mouseLayer) {
      env.mouseLayer.remove();
      env.mouseLayer = null;
      env.mousePaper.remove();
      env.mousePaper = null;
      env.mouseTimer = null;
      env.mouseAreas = null;
      // Meglio fare anche l'unbind???
    }

    env.mouseLayer = $('<div></div>').css({position : 'absolute', 'z-index' : 20, opacity : 0}).prependTo(env.container);
    env.mousePaper = common._RaphaelInstance(env.mouseLayer.get(0), env.opt.width, env.opt.height);
    var paper = env.mousePaper;

    if (env.opt.features.debug.active && typeof DP_Debug != 'undefined') {
      env.paper.text(env.opt.width, env.opt.height - 5, 'DEBUG').attr({ 'text-anchor' : 'end', stroke: 'red', opacity: .1 });
      paper.text(env.opt.width, env.opt.height - 5, 'DEBUG').attr({ 'text-anchor' : 'end', stroke: 'red', opacity: .1 }).click(function() {
        DP_Debug.dump(env.opt, '', false, 4);
      });
    }

    var i, j;

    // Adding mouseover only in right area, based on pieces
    env.mouseAreas = [];
    if (env.opt.features.mousearea.type == 'single') {
      // SINGLE: Every serie's index is an area
      for (i = 0; i < pieces.length; i++) {
        if (pieces[i].mousearea) {
          // pathstep
          if (!pieces[i].paths) {
            // path standard, generating an area for each point
            if (pieces[i].path.length >= 1 && (pieces[i].path[0][0] == 'LINE' || pieces[i].path[0][0] == 'LINEAREA'))
              for (j = 0; j < pieces[i].path[0][1].length; j++) {
                env.mouseAreas.push({
                  path : [ [ 'CIRCLE', pieces[i].path[0][1][j][0], pieces[i].path[0][1][j][1], 10 ] ],
                  piece : pieces[i],
                  pieces : pieces,
                  index : j,
                  props : common.areaProps(env, pieces[i].section, pieces[i].serie)
                });
              }
              
            else // Code below is only for standard path - it should be useless now (now there are only LINE and LINEAREA)
              for (j = 0; j < pieces[i].path.length; j++) {
                env.mouseAreas.push({
                  path : [ [ 'CIRCLE', common.getX(pieces[i].path[j]), common.getY(pieces[i].path[j]), 10 ] ],
                  piece : pieces[i],
                  pieces : pieces,
                  index : j,
                  props : common.areaProps(env, pieces[i].section, pieces[i].serie)
                });
              }
            
          // paths
          } else if (pieces[i].paths) {
            // Set of paths (bar graph?), generating overlapped areas
            for (j = 0; j < pieces[i].paths.length; j++)
              if (pieces[i].paths[j].path)
                env.mouseAreas.push({
                  path : pieces[i].paths[j].path,
                  piece : pieces[i],
                  pieces : pieces,
                  index : j,
                  props : common.areaProps(env, pieces[i].section, pieces[i].serie)
                });
          }
        }
      }
    } else {
      // INDEX: Each index (in every serie) is an area
      var indexCenter = env.opt.features.mousearea.indexCenter;
      if (indexCenter == 'auto')
        indexCenter = env.indexCenter;
      var start, delta;
      if (indexCenter == 'bar') {
        delta = (env.opt.width - env.opt.margins[3] - env.opt.margins[1]) / (env.opt.labels.length > 0 ? env.opt.labels.length : 1);
        start = env.opt.margins[3];
      } else {
        delta = (env.opt.width - env.opt.margins[3] - env.opt.margins[1]) / (env.opt.labels.length > 1 ? env.opt.labels.length - 1 : 1);
        start = env.opt.margins[3] - delta / 2;
      }

      for (var index in env.opt.labels) {
        env.mouseAreas.push({
          path : [ [ 'RECT', start + index * delta, env.opt.margins[0], start + (index + 1) * delta, env.opt.height - env.opt.margins[2] ] ],
          piece : false,
          pieces : pieces,
          index : parseInt(index),
          props : env.opt.defaultSeries // TODO common.areaProps(env, 'Plot')
        });
      }
    }

    var syncenv = false;
    if (!env.opt.features.mousearea.syncTag) {
      env.mouseareaenv = { chartEnv : false, mouseObj : false, caller : false, inArea : -1, timer : false };
      syncenv = env.mouseareaenv;
    } else {
      if (!$.elycharts.mouseareaenv)
        $.elycharts.mouseareaenv = {};
      if (!$.elycharts.mouseareaenv[env.opt.features.mousearea.syncTag])
        $.elycharts.mouseareaenv[env.opt.features.mousearea.syncTag] = { chartEnv : false, mouseObj : false, caller : false, inArea : -1, timer : false };
      syncenv = $.elycharts.mouseareaenv[env.opt.features.mousearea.syncTag];
    }
    for (i = 0; i < env.mouseAreas.length; i++) {
      env.mouseAreas[i].area = common.showPath(env, env.mouseAreas[i].path, paper).attr({stroke: "none", fill: "#fff", opacity: 0});
      
      (function(env, obj, objidx, caller, syncenv) {
        var piece = obj.piece;
        var index = obj.index;
        
        obj.mouseover = function(e) {
          //BIND: if (obj.listenerDisabled) return;
          obj.event = e;
          clearTimeout(syncenv.timer);
          caller.onMouseOverArea(env, piece, index, obj);
          
          if (syncenv.chartEnv && syncenv.chartEnv.id != env.id) {
            // Chart changed, removing old one
            syncenv.caller.onMouseExitArea(syncenv.chartEnv, syncenv.mouseObj.piece, syncenv.mouseObj.index, syncenv.mouseObj);
            caller.onMouseEnterArea(env, piece, index, obj);
          } 
          else if (syncenv.inArea != objidx) {
            if (syncenv.inArea < 0)
              caller.onMouseEnterArea(env, piece, index, obj);
            else
              caller.onMouseChangedArea(env, piece, index, obj);
          }
          syncenv.chartEnv = env;
          syncenv.mouseObj = obj;
          syncenv.caller = caller;
          syncenv.inArea = objidx;
        };
        obj.mouseout = function(e) {
          //BIND: if (obj.listenerDisabled) return;
          obj.event = e;
          clearTimeout(syncenv.timer);
          caller.onMouseOutArea(env, piece, index, obj);
          syncenv.timer = setTimeout(function() {
            syncenv.timer = false;
            caller.onMouseExitArea(env, piece, index, obj);
            syncenv.chartEnv = false;
            syncenv.inArea = -1;
          }, env.opt.features.mousearea.areaMoveDelay);
        };
        
        $(obj.area.node).mouseover(obj.mouseover);
        $(obj.area.node).mouseout(obj.mouseout);
      })(env, env.mouseAreas[i], i, this, syncenv);
    }
  },
  
  // Called when mouse enter an area
  onMouseOverArea : function(env, piece, index, mouseAreaData) {
    //console.warn('over', piece.serie, index);
    featuresmanager.onMouseOver(env, mouseAreaData.piece ? mouseAreaData.piece.serie : false, mouseAreaData.index, mouseAreaData);
  },
  
  // Called when mouse exit from an area
  onMouseOutArea : function(env, piece, index, mouseAreaData) {
    //console.warn('out', piece.serie, index);
    featuresmanager.onMouseOut(env, mouseAreaData.piece ? mouseAreaData.piece.serie : false, mouseAreaData.index, mouseAreaData);
  },
  
  // Called when mouse enter an area from empty space (= it was in no area before)
  onMouseEnterArea : function(env, piece, index, mouseAreaData) {
    //console.warn('enter', piece.serie, index);
    featuresmanager.onMouseEnter(env, mouseAreaData.piece ? mouseAreaData.piece.serie : false, mouseAreaData.index, mouseAreaData);
  },

  // Called when mouse enter an area and it was on another area
  onMouseChangedArea : function(env, piece, index, mouseAreaData) {
    //console.warn('changed', piece.serie, index);
    featuresmanager.onMouseChanged(env, mouseAreaData.piece ? mouseAreaData.piece.serie : false, mouseAreaData.index, mouseAreaData);
  },
  
  // Called when mouse leaves an area and does not enter in another one (timeout check)
  onMouseExitArea : function(env, piece, index, mouseAreaData) {
    //console.warn('exit', piece.serie, index);
    featuresmanager.onMouseExit(env, mouseAreaData.piece ? mouseAreaData.piece.serie : false, mouseAreaData.index, mouseAreaData);
  }
  
}

$.elycharts.featuresmanager.register($.elycharts.mousemanager, 0);

})(jQuery);

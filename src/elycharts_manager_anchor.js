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
 * FEATURE: ANCHOR
 * 
 * Permette di collegare i dati del grafico con delle aree esterne, 
 * identificate dal loro selettore CSS, e di interagire con esse.
 **********************************************************************/

$.elycharts.anchormanager = {
  
  afterShow : function(env, pieces) {
    // Prendo le aree gestite da mouseAreas, e metto i miei listener
    // Non c'e' bisogno di gestire il clean per una chiamata successiva, lo fa gia' il mouseareamanager
    // Tranne per i bind degli eventi jquery

    if (!env.opt.anchors)
      return;
      
    if (!env.anchorBinds)
      env.anchorBinds = [];
    
    while (env.anchorBinds.length) {
      var b = env.anchorBinds.pop();
      $(b[0]).unbind(b[1], b[2]);
    }
    
    for (var i = 0; i < env.mouseAreas.length; i++) {
      var serie = env.mouseAreas[i].piece ? env.mouseAreas[i].piece.serie : false;
      var anc;
      if (serie)
        anc = env.opt.anchors[serie][env.mouseAreas[i].index];
      else
        anc = env.opt.anchors[env.mouseAreas[i].index];
        
      if (anc && env.mouseAreas[i].props.anchor && env.mouseAreas[i].props.anchor.highlight) {
        
        (function(env, mouseAreaData, anc, caller) {
          
          var f1 = function() { caller.anchorMouseOver(env, mouseAreaData); };
          var f2 = function() { caller.anchorMouseOut(env, mouseAreaData); };
          if (!env.mouseAreas[i].props.anchor.useMouseEnter) {
            env.anchorBinds.push([anc, 'mouseover', f1]);
            env.anchorBinds.push([anc, 'mouseout', f2]);
            $(anc).mouseover(f1);
            $(anc).mouseout(f2);
          } else {
            env.anchorBinds.push([anc, 'mouseenter', f1]);
            env.anchorBinds.push([anc, 'mouseleave', f2]);
            $(anc).mouseenter(f1);
            $(anc).mouseleave(f2);
          }
        })(env, env.mouseAreas[i], anc, this);
      }
    }
    
    env.onAnchors = [];
  },
  
  anchorMouseOver : function(env, mouseAreaData) {
    $.elycharts.highlightmanager.onMouseOver(env, mouseAreaData.piece ? mouseAreaData.piece.serie : false, mouseAreaData.index, mouseAreaData);
  },
  
  anchorMouseOut : function(env, mouseAreaData) {
    $.elycharts.highlightmanager.onMouseOut(env, mouseAreaData.piece ? mouseAreaData.piece.serie : false, mouseAreaData.index, mouseAreaData);
  },
  
  onMouseOver : function(env, serie, index, mouseAreaData) {
    if (!env.opt.anchors)
      return;

    if (mouseAreaData.props.anchor && mouseAreaData.props.anchor.addClass) {
      //var serie = mouseAreaData.piece ? mouseAreaData.piece.serie : false;
      var anc;
      if (serie)
        anc = env.opt.anchors[serie][mouseAreaData.index];
      else
        anc = env.opt.anchors[mouseAreaData.index];
      if (anc) {
        $(anc).addClass(mouseAreaData.props.anchor.addClass);
        env.onAnchors.push([anc, mouseAreaData.props.anchor.addClass]);
      }
    }
  },
  
  onMouseOut : function(env, serie, index, mouseAreaData) {
    if (!env.opt.anchors)
      return;
    
    while (env.onAnchors.length > 0) {
      var o = env.onAnchors.pop();
      $(o[0]).removeClass(o[1]);
    }
  }
}

$.elycharts.featuresmanager.register($.elycharts.anchormanager, 30);

})(jQuery);

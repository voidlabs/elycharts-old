/***********************************************************************
 * ELYCHARTS v2.1.1
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
    // TODO Pero' l'unbind precedente andrebbe fatto, e come fa ora fa l'unbind anche di funzioni non nostre

    if (!env.opt.anchors)
      return;
    
    for (var i = 0; i < env.mouseAreas.length; i++) {
      var serie = env.mouseAreas[i].piece ? env.mouseAreas[i].piece.serie : false;
      if (serie)
        var anc = env.opt.anchors[serie][env.mouseAreas[i].index];
      else
        var anc = env.opt.anchors[env.mouseAreas[i].index];
        
      if (anc && env.mouseAreas[i].props.anchor && env.mouseAreas[i].props.anchor.highlight) {
        
        (function(env, mouseAreaData, anc, caller) {
          // TODO Dovrebbe fare l'unbind solo delle sue funzioni
          $(anc).unbind();
          
          if (!env.mouseAreas[i].props.anchor.useMouseEnter) {
            $(anc).mouseover(function() { caller.anchorMouseOver(env, mouseAreaData); });
            $(anc).mouseout(function() { caller.anchorMouseOut(env, mouseAreaData); });
          } else {
            $(anc).mouseenter(function() { caller.anchorMouseOver(env, mouseAreaData); });
            $(anc).mouseleave(function() { caller.anchorMouseOut(env, mouseAreaData); });
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
      var serie = mouseAreaData.piece ? mouseAreaData.piece.serie : false;
      if (serie)
        var anc = env.opt.anchors[serie][mouseAreaData.index];
      else
        var anc = env.opt.anchors[mouseAreaData.index];
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

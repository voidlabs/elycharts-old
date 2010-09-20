/***********************************************************************
 * ELYCHARTS v2.1.1
 **********************************************************************/

(function($) {

//var featuresmanager = $.elycharts.featuresmanager;
var common = $.elycharts.common;

/***********************************************************************
 * FEATURE: LABELS
 * 
 * Permette di visualizzare in vari modi le label del grafico.
 * In particolare per pie e funnel permette la visualizzazione all'interno
 * delle fette.
 * Per i line chart le label sono visualizzate già nella gestione assi.
 * 
 * TODO:
 * - Comunque per i line chart si potrebbe gestire la visualizzazione
 *   all'interno delle barre, o sopra i punti.
 **********************************************************************/

$.elycharts.labelmanager = {

  beforeShow : function(env, pieces) {
    
    if (!common.executeIfChanged(env, ['labels', 'values', 'series']))
      return;
    
    if (env.opt.labels && (env.opt.type == 'pie' || env.opt.type == 'funnel')) {
      var /*lastSerie = false, */lastIndex = false;
      var paths;
      
      for (var i = 0; i < pieces.length; i++) {
        if (pieces[i].section == 'Series' && pieces[i].subSection == 'Plot') {
          var props = common.areaProps(env, 'Series', pieces[i].serie);
          if (env.emptySeries && env.opt.series.empty)
            props.label = $.extend(true, props.label, env.opt.series.empty.label);
          if (props && props.label && props.label.active) {
            paths = [];
            for (var index = 0; index < pieces[i].paths.length; index++) 
              if (pieces[i].paths[index].path) {
                //lastSerie = pieces[i].serie;
                lastIndex = index;
                paths.push(this.showLabel(env, pieces[i], pieces[i].paths[index], pieces[i].serie, index, pieces));
              } else
                paths.push({ path : false, attr : false });
            pieces.push({ section : pieces[i].section, serie : pieces[i].serie, subSection : 'Label', paths: paths });
          }
        }
        else if (pieces[i].section == 'Sector' && pieces[i].serie == 'bottom' && !pieces[i].subSection && lastIndex < env.opt.labels.length - 1) {
          paths = [];
          paths.push(this.showLabel(env, pieces[i], pieces[i], 'Series', env.opt.labels.length - 1, pieces));
          pieces.push({ section : pieces[i].section, serie : pieces[i].serie, subSection : 'Label', paths: paths });
        }
      }
      
    }
  },
  
  showLabel : function(env, piece, path, serie, index, pieces) {
    var pp = common.areaProps(env, 'Series', serie, index);
    if (env.opt.labels[index] || pp.label.label) {
      var p = path;
      var label = pp.label.label ? pp.label.label : env.opt.labels[index];
      var center = common.getCenter(p, pp.label.offset);
      if (!pp.label.html) {
        var attr = pp.label.props;
        if (pp.label.frameAnchor) {
          attr = common._clone(pp.label.props);
          attr['text-anchor'] = pp.label.frameAnchor[0];
          attr['alignment-baseline'] = pp.label.frameAnchor[1];
        }
        /*pieces.push({
          path : [ [ 'TEXT', label, center[0], center[1] ] ], attr : attr, 
          section: 'Series', serie : serie, index : index, subSection : 'Label'
        });*/
        return { path : [ [ 'TEXT', label, center[0], center[1] ] ], attr : attr };

      } else {
        var opacity = 1;
        var style = common._clone(pp.label.style);
        var set_opacity = (typeof style.opacity != 'undefined')
        if (set_opacity) {
          opacity = style.opacity;
          style.opacity = 0;
        }
        style.position = 'absolute';
        style['z-index'] = 25;

        var el;
        if (typeof label == 'string')
          el = $('<div>' + label + '</div>').css(style).prependTo(env.container);
        else
          el = $(label).css(style).prependTo(env.container);
          
        // Centramento corretto label
        if (env.opt.features.debug.active && el.height() == 0)
          alert('DEBUG: Al gestore label e\' stata passata una label ancora senza dimensioni, quindi ancora non disegnata. Per questo motivo il posizionamento potrebbe non essere correto.');
        var posX = center[0];
        var posY = center[1];
        if (!pp.label.frameAnchor || pp.label.frameAnchor[0] == 'middle')
          posX -= el.width() / 2;
        else if (pp.label.frameAnchor && pp.label.frameAnchor[0] == 'end')
          posX -= el.width();
        if (!pp.label.frameAnchor || pp.label.frameAnchor[1] == 'middle')
          posY -= el.height() / 2;
        else if (pp.label.frameAnchor && pp.label.frameAnchor[1] == 'top')
          posY -= el.height();
        if (set_opacity)
          el.css({ margin: posY + 'px 0 0 ' + posX + 'px', opacity : opacity});
        else
          el.css({ margin: posY + 'px 0 0 ' + posX + 'px'});
        
        /*pieces.push({
          path : [ [ 'DOMELEMENT', el ] ], attr : false,
          section: 'Series', serie : serie, index : index, subSection : 'Label'
        });*/
        return { path : [ [ 'DOMELEMENT', el ] ], attr : false };

      }
    }
    return false;
  }
}

$.elycharts.featuresmanager.register($.elycharts.labelmanager, 5);

})(jQuery);

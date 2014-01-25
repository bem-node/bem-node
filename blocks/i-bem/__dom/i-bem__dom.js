/**
 * make BEM.DOM.decl do not override BEM.decl
 */
BEM.decl = BEM.DOM.decl.bind(BEM.DOM);

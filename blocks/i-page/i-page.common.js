/**
 * Base class for pages
 *
 * @abstract
 */
BEM.decl('i-page', null, {

    /**
     * Initialize page
     *
     * @abstract
     * @param {Array} matchers matched params from path
     * @return {Vow.promise}
     */
    init: function (matchers) {},
    
    /**
     * Process bemjson and bemhtml then output generated html
     * @abstract
     * @param {Mixed} json
     */
    out: function () {},

    /**                                                                                  
     * Process given bemjson to html                                                     
     *                                                                                   
     * @param {String|Object|Array} bemJson                                              
     * @param {Boolean} [isSync] if true, method will perform synchronous BEM.JSON.build and return a html string
     * @return {Vow.promise|String}                                                      
     */    
    html: function (json, isSync) {
        return (isSync) ? this._htmlSync(json) : this._htmlAsync(json); 
    },

    _htmlSync: function (json) {                                                         
        return BEMHTML.call(BEM.JSON.build(json));                 
    },                                                                                   
                                                                                         
    _htmlAsync: function (json) {                                                        
        var promise;                                                                     
                                                                                         
        if (typeof (json) === 'string') {                                                
            promise = Vow.fulfill(json);                                                 
        } else {                                                                         
            promise = Vow.promise();                                                     
            BEM.JSON.buildAsync(                                                         
                json,                                                                    
                function (result) {                                                      
                    promise.fulfill(BEMHTML.call(result));                               
                }                                                                        
            );                                                                           
        }                                                                                
                                                                                         
        return promise;                                                                  
    }       

});

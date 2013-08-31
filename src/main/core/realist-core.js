/*
 * realist JavaScript library v0.1
 *
 */
(function(window) {

  "use strict";
  
  var realist = function(initProperties){

    var _properties = initProperties || {};

    // Main container for the items
    var _items = [];

    // Property that holds all private functions
    var _fn = {};

    /*
     * Quantifier function. Takes an item and returns
     * a value used for sorting items in this list
     *
     * @private
     * @param {object} item An item of this list
     * @return {number} The value used for sorting the item
     */
    _fn.quantifier = _properties.quantifier; 

    // Gets object properties by the given string
    var getObjectProperty = function(obj, prop) {
      prop = prop.replace(/\[(\w+)\]/g, '.$1'); // handle array indexes 
      prop = prop.replace(/^\./, '');           // strip a leading dot (just in case)
      var properties = prop.split('.');
      var result = obj;

      for(var i = 0, propSize = properties.length; i < propSize; i += 1) {
        if(result.hasOwnProperty(properties[i])) {
          result = obj[properties[i]];
        } else {
          return;
        }
      }
      return result;
    };

    /*
     * Function used for sorting items in the list.
     * It can be provided by the user.
     *
     * @private
     * @param {object} item1 one of the items to be compared
     * @param {object} item2 another of the items to be compared
     * @return {number} 0 if they are equal, and 1 or -1 depending
     * the sorting order
     */
    _fn.sort = _properties.sort || function(item1, item2) {
      
      // check if sortOrder is ok
      // TODO should signal error if not an accepted value
      var sortOrder = _properties.sortOrder || 'ascending';

      var quantifierVal1 = _fn.quantifier(item1);
      var quantifierVal2 = _fn.quantifier(item2);

      if(quantifierVal1 === quantifierVal2) {
        return 0;
      } else if (quantifierVal1 < quantifierVal2) {
        return sortOrder === 'ascending' ? -1 : 1;
      } else {
        return sortOrder === 'ascending' ? 1 : -1;
      }
    };


    return {
      /*
       * realist's current version
       */
      coreVersion : "0.1",

      /*
       * Adds items to the list. It will sort the underlying list if a 
       * sort function was specified.
       * 
       * @param{array} elements An array of elements to be inserted into the list
       */
      addItems: function(elements) {
        for( var i = 0, elementsSize = elements.length; i < elementsSize; i += 1 ) {
          _items.push(elements[i]);
        }

        // sort items
        _items.sort(_fn.sort);
      },

      /*
       * Get the underlying knockout array that holds the list's items
       * This method is mainly used for UI purposes
       *
       * @return {array} The underlying array that holds the list's items
       */
      getItems: function() { 
        return _items;
      },

      /*
       * Clears all the item stored in the list
       */
      clearItems: function() { 
        _items = [];
      },

      /*
       * Set the underlying ordering to be used (i.e. ascending, descending)
       *
       * @param {string} order The ordering used by the sort function
       */
      setOrdering: function(order) {
        _properties.sortOrder = order;
      },

      setSortFn: function(sortFn) {
        _fn.sort = sortFn;
      }
    };

  };

  window.realist = realist;
})(window);

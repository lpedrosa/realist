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

    // Property that quantifies an item
    var _quantifier = _properties.quantifier; 

    // Property that holds all private functions
    var _fn = {};

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

    // -------
    // Sorting

    _fn.sort = _properties.sort || function(item1, item2) {
      // TODO perform checks on quantifier's type
      // TODO signal error if cannot fetch quantifiable property
      
      // check if sortOrder is ok
      // TODO should signal error if not an accepted value
      var sortOrder = _properties.sortOrder || 'ascending';

      // for now I assume it is an integer
      var quantifierVal1 = getObjectProperty(item1, _quantifier);
      var quantifierVal2 = getObjectProperty(item2, _quantifier);

      if(quantifierVal1 === quantifierVal2) {
        return 0;
      } else if (quantifierVal1 < quantifierVal2) {
        return sortOrder === 'ascending' ? -1 : 1;
      } else {
        return sortOrder === 'ascending' ? 1 : -1;
      }
    };


    return {
      // realist current version
      coreVersion : "0.1",

      // Adds items to the list. It will sort the underlying list if a 
      // sort function was specified.
      //
      // This function can be extended to provide diferent functionality
      // while adding the items.
      addItems: function(elements) {
        for( var i = 0, elementsSize = elements.length; i < elementsSize; i += 1 ) {
          _items.push(elements[i]);
        }

        // sort items
        _items.sort(_fn.sort);
      },

      // Get the underlying knockout array that holds the list's items
      // This method is mainly used for UI purposes
      getItems: function() { 
        return _items; 
      },

      // Clears all the item stored in the list
      clearItems: function() { 
        _items = [];
      }
    };

  };

  window.realist = realist;
})(window);

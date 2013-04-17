function bind(func, owner) {
  return (function(func, owner) {
    return function() {
      return func.apply(owner, arguments);
    }
  }(func, owner));
}

var ManagedArray = (function() {

  function ManagedArray() {
    this.array = [];
  }

  ManagedArray.prototype = {
    add: function(object) {
      this.array.push(object);
    },

    remove: function(object) {
      this.array.splice(this.array.indexOf(object), 1);
    },

    each: function(func) {
      for(var i = 0; i < this.array.length; ++i) {
        func(this.array[i]);
      }
    },

    clear: function() {
      this.array.length = 0;
    },

    isEmpty: function() {
      return this.array.length == 0;
    }
  };

  return ManagedArray;
}());

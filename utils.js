function bind(func, owner) {
  return (function(func, owner) {
    return function() {
      return func.apply(owner, arguments);
    }
  }(func, owner));
}

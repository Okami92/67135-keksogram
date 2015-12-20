/**
 * Наследование через подмену конструктора на пустой конструктор.
 */

'use strict';

(function() {
  /**
   * Принимаем объекты Child и Parent и присваиваем объекту Child
   * все свойства и методы объекта Parent
   * @constructor
   * @param  {Object} child
   * @param  {Object} parent
   */
  var inherit = function(Child, Parent) {
    /** @constructor */
    var EmptyConstructor = function() {};
    EmptyConstructor.prototype = Parent.prototype;
    Child.prototype = new EmptyConstructor();
  };

  window.inherit = inherit;
})();

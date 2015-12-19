/**
 * Наследование через подмену конструктора на пустой конструктор.
 */

'use strict';

/**
 * Принимаем объекты Child и Parent и присваиваем объекту Child
 * все свойства и методы объекта Parent
 * @param  {Object} child
 * @param  {Object} parent
 */
function inherit(Child, Parent) {
  /** @constructor */
  var EmptyConstructor = function() {};
  EmptyConstructor.prototype = Parent.prototype;
  Child.prototype = new EmptyConstructor();
}

// Чтоб ESLint не ругался
inherit();

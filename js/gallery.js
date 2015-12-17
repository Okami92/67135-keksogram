'use strict';

(function() {
  /**
   * @constructor
   */
  var Gallery = function() {
    this.element = document.querySelector('.gallery-overlay');
    this._closeButton = document.querySelector('.gallery-overlay-close');
    this._photo = document.querySelector('.gallery-overlay-image');

    /**
     * Обработчик нажатия на крестик
     */
    this._onCloseClick = function() {
      this.hide();
    }.bind(this);

    /**
     * Обработчик клика по фотографии
     */
    this._onPhotoClick = function() {
      console.log('Click on photo');
    };

    /**
     * Обработчик нажатия на клавиатуру
     */
    this._onDocumentKeyDown = function(evt) {
      console.log('key code: ', evt.keyCode);
      // Если нажали на Esc
      if (evt.keyCode === 27) {
        this.hide();
      }
    }.bind(this);

  };

  /**
   * Отображение галереи
   */
  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');

    // Обработчик клика по крестику
    this._closeButton.addEventListener('click', this._onCloseClick);
    this._photo.addEventListener('click', this._onPhotoClick);
    document.addEventListener('keydown', this._onDocumentKeyDown);
  };

  /**
   * Скрытие галереи
   */
  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this._closeButton.removeEventListener('click', this._onCloseClick);
    this._photo.removeEventListener('click', this._onPhotoClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);
  };

  window.Gallery = Gallery;
})();

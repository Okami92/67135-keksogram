'use strict';

(function() {
  /**
   * @constructor
   */
  var Gallery = function() {
    this.element = document.querySelector('.gallery-overlay');
    this._closeButton = document.querySelector('.gallery-overlay-close');
    this._photo = document.querySelector('.gallery-overlay-image');

    // Переопределяем контекст обработчика
    this._onCloseClick = this._onCloseClick.bind(this);
    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
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

  /**
   * Обработчик нажатия на крестик
   */
  Gallery.prototype._onCloseClick = function() {
    this.hide();
  };

  /**
   * Обработчик клика по фотографии
   */
  Gallery.prototype._onPhotoClick = function() {
    console.log('Click on photo');
  };

  /**
   * Обработчик нажатия на клавиатуру
   */
  Gallery.prototype._onDocumentKeyDown = function(evt) {
    console.log('key code: ', evt.keyCode);
    // Если нажали на Esc
    if (evt.keyCode === 27) {
      this.hide();
    }
  };

  window.Gallery = Gallery;
})();

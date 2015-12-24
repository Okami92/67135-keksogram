/* global define: true */

/**
 * Объект Gallery
 */

'use strict';

define(function() {
  /**
   * @constructor
   */
  var Gallery = function() {

    /**
     * Галерея на странице
     * @type {Element}
     */
    this.element = document.querySelector('.gallery-overlay');

    /**
     * Кнопка-крестик для закрытия галереи
     * @type {Event}
     */
    this._closeButton = document.querySelector('.gallery-overlay-close');

    /**
     * Контейнер для фотографии
     * @type {Element}
     */
    this._photo = document.querySelector('.gallery-overlay-image');
    this._like = document.querySelector('.gallery-overlay-controls-like');
    this._comments = document.querySelector('.gallery-overlay-controls-comments');

    /**
     * Список фотографий из json
     * @type {Array}
     */
    this.pictures = [];

    /**
     * Текущая фотография
     * @type {Number}
     */
    this._currentImage = 0;

    /**
     * Обработчик нажатия на крестик
     * @private
     */
    this._onCloseClick = function() {
      this.hide();
    }.bind(this);

    /**
     * Обработчик клика по фотографии
     * @private
     */
    this._onPhotoClick = function() {
      if (this.pictures[this._currentImage + 1]) {
        this._setHash(this.pictures[++this._currentImage].url);
      } else {
        this._currentImage = 0;
        this._setHash(this.pictures[this._currentImage].url);
      }
    }.bind(this);

    /**
     * Обработчик нажатия на клавиатуру
     * @param {KeyboardEvent} evt
     * @private
     */
    this._onDocumentKeyDown = function(evt) {
      // Если нажали на Esc
      if (evt.keyCode === 27) {
        this.hide();
      }
      // Стрелочка вправо
      if (evt.keyCode === 39) {
        if (this._currentImage === this.pictures.length - 1) {
          this._currentImage = 0;
          this._setHash(this.pictures[this._currentImage].url);
        } else {
          this._setHash(this.pictures[++this._currentImage].url);
        }
      }
      // Стрелочка влево
      if (evt.keyCode === 37) {
        if (this._currentImage === 0) {
          this._currentImage = this.pictures.length - 1;
          this._setHash(this.pictures[this._currentImage].url);
        } else {
          this._setHash(this.pictures[--this._currentImage].url);
        }
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
    history.pushState('', document.title, window.location.pathname);
    this.element.classList.add('invisible');
    this._closeButton.removeEventListener('click', this._onCloseClick);
    this._photo.removeEventListener('click', this._onPhotoClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);
  };

  /**
   * Сохранение массива фотографий из json
   * @param {Array.<Object>} pictures
   * @method setPictures
   */
  Gallery.prototype.setPictures = function(pictures) {
    this.pictures = pictures;
  };

  /**
   * Отображаем текущую картинку
   * @param {number|string} index
   * @method setCurrentPicture
   */
  Gallery.prototype.setCurrentPicture = function(index) {
    var picture;

    if (typeof index === 'number') {
      if (index <= this.pictures.length - 1) {
        this._currentImage = index;
        picture = this.pictures[this._currentImage];
      }
    } else if (typeof index === 'string') {
      for (var i = 0; i < this.pictures.length; i++) {
        if (index.search(this.pictures[i].url) !== -1) {
          this._currentImage = i;
          picture = this.pictures[i];
          break;
        }
      }
    }

    this._photo.src = picture.url;
    this._like.querySelector('.likes-count').textContent = picture.likes;
    this._comments.querySelector('.comments-count').textContent = picture.comments;
  };

  /**
   * Добавление hash в адресную строку.
   * @param {string} hash
   * @private
   */
  Gallery.prototype._setHash = function(hash) {
    location.hash = hash ? 'photo/' + hash : '';
  };

  return Gallery;
});

/**
 * Объект Gallery
 */

'use strict';

(function() {
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
    // Список фотографий из json
    this.pictures = [];

    // Текущая фотография
    this._currentImage = 0;
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
      if (this.pictures[++this._currentImage]) {
        this.setCurrentPicture(++this._currentImage);
      }
    };

    /**
     * Обработчик нажатия на клавиатуру
     * @param {KeyboardEvent} evt
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
          this.setCurrentPicture(this._currentImage);
        } else {
          this.setCurrentPicture(++this._currentImage);
        }
      }
      // Стрелочка влево
      if (evt.keyCode === 37) {
        if (this._currentImage === 0) {
          this._currentImage = this.pictures.length - 1;
          this.setCurrentPicture(this._currentImage);
        } else {
          this.setCurrentPicture(--this._currentImage);
        }
      }
      console.log(this._currentImage);
    }.bind(this);

  };

  /**
   * Отображение галереи
   * @method show
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
   * @method hide
   */
  Gallery.prototype.hide = function() {
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
   * @param {number} index
   * @method setCurrentPicture
   */
  Gallery.prototype.setCurrentPicture = function(index) {
    if (index <= this.pictures.length - 1) {
      this._currentImage = index;
      var picture = this.pictures[this._currentImage];
      this._photo.src = picture.url;
      this._like.querySelector('.likes-count').textContent = picture.likes;
      this._comments.querySelector('.comments-count').textContent = picture.comments;
    }
  };

  window.Gallery = Gallery;
})();

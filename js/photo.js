/**
 * Объект Photo
 */
'use strict';

(function() {
  /**
   * @constructor
   * @param {Object} data
   */
  function Photo(data) {
    this._data = data;

    /**
     * Обработчик клика на фотографии
     */
    this._onPhotoClick = function(evt) {
      evt.preventDefault();
      if (!this.element.classList.contains('picture-load-failure')) {
        if (typeof this.onClick === 'function') {
          this.onClick();
        }
      }
    }.bind(this);
  }

  /**
   * Создание фотографии из шаблона
   */
  Photo.prototype.render = function() {
    /**
     * Размер стороны квадратной картинки
     * @type {number}
     */
    var IMAGE_SIZE = 182;

    /**
     * Время ожидания отклика от сервера
     * @type {Number}
     */
    var IMAGE_TIMEOUT = 10000;

    /**
     * Шаблон фотографии
     * @type {Element}
     */
    var template = document.querySelector('#picture-template');

    // Улучшаем поддержку для старых IE
    if ('content' in template) {
      this.element = template.content.children[0].cloneNode(true);
    } else {
      this.element = template.children[0].cloneNode(true);
    }

    // Добавляем информацию о фотографии
    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;

    /**
     * Картинка
     * @type {Image}
     */
    var blockImage = new Image(IMAGE_SIZE, IMAGE_SIZE);

    /**
     * Таймаут ожидания загрузки картинки
     */
    var imageLoadTimeout = setTimeout(function() {
      blockImage.src = '';
      this.element.classList.add('picture-load-failure');
    }.bind(this), IMAGE_TIMEOUT);

    // Обработчик загрузки фотографии
    blockImage.onload = function() {
      clearTimeout(imageLoadTimeout);
    };

    // Обрабатываем ошибку
    blockImage.onerror = function() {
      this.element.classList.add('picture-load-failure');
    }.bind(this);

    // Добавляем картинку в src
    blockImage.src = this._data.url;

    // Заменяем img из шаблона на созданный blockImage
    this.element.replaceChild(blockImage, this.element.children[0]);

    // Добавляем обработчик клика на фотографии
    this.element.addEventListener('click', this._onPhotoClick);
  };

  /** @type {?Function} */
  Photo.prototype.onClick = null;

  Photo.prototype.remove = function() {
    this.element.removeEventListener('click', this._onPhotoClick);
  };

  window.Photo = Photo;
})();

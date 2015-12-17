'use strict';

(function() {
  /**
   * @constructor
   * @param {Object} data
   */
  function Photo(data) {
    this._data = data;
  }

  /**
   * Создание фотографии из шаблона
   */
  Photo.prototype.render = function() {
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

    var backgroundImage = new Image();

    // Время ожидания ответа от сервера
    var IMAGE_TIMEOUT = 10000;

    // Если сервер не отдал нам картинку
    var imageLoadTimeout = setTimeout(function() {
      backgroundImage.src = '';
      this.element.classList.add('picture-load-failure');
    }.bind(this), IMAGE_TIMEOUT);

    // Обработчик загрузки фотографии
    backgroundImage.onload = function() {
      clearTimeout(imageLoadTimeout);
    };

    // Обрабатываем ошибку
    backgroundImage.onerror = function() {
      this.element.classList.add('picture-load-failure');
    }.bind(this);

    // Добавляем картинку в src
    backgroundImage.src = this._data.url;
    backgroundImage.setAttribute('width', '182px');
    backgroundImage.setAttribute('height', '182px');

    // Заменяем img из шаблона на созданный backgroundImage
    this.element.replaceChild(backgroundImage, this.element.children[0]);
  };

  window.Photo = Photo;
})();

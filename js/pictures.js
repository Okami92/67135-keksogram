'use strict';

(function() {
  // Контейнер фотографий
  var container = document.querySelector('.pictures');

  // Проверяем массив на существование
  if (typeof (pictures) !== 'undefined') {
    // Перебираем все элементы в структуре данных
    pictures.forEach(function(picture) {
      var element = getElementFromTemplate(picture);
      container.appendChild(element);
    });

    /**
     * Создаем DOM-элемент на основе шаблона
     * @param  {Object} data
     * @return {Element}
     */
    function getElementFromTemplate(data) {
      var template = document.querySelector('#picture-template');

      var element;
      // Улучшаем поддержку для старых IE
      if ('content' in template) {
        element = template.content.children[0].cloneNode(true);
      } else {
        element = template.children[0].cloneNode(true);
      }

      // Добавляем информацию о фотографии
      element.querySelector('.picture-comments').textContent = data.comments;
      element.querySelector('.picture-likes').textContent = data.likes;

      var backgroundImage = new Image();

      // Время ожидания ответа от сервера
      var IMAGE_TIMEOUT = 10000;

      // Если сервер не отдал нам картинку
      var imageLoadTimeout = setTimeout(function() {
        backgroundImage.src = '';
        element.classList.add('picture-load-failure');
      }, IMAGE_TIMEOUT);

      // Обработчик загрузки фотографии
      backgroundImage.onload = function() {
        clearTimeout(imageLoadTimeout);
        element.style.backgroundImage = 'url(\'' + backgroundImage.src + '\')';
      };

      // Обрабатываем ошибку
      backgroundImage.onerror = function() {
        element.classList.add('picture-load-failure');
      };

      // Добавляем картинку в src
      backgroundImage.src = '/' + data.url;
      backgroundImage.setAttribute('width', '182px');
      backgroundImage.setAttribute('height', '182px');

      // Заменяем img из шаблона на созданный backgroundImage
      element.replaceChild(backgroundImage, element.children[0]);

      return element;
    }
  }

  // Отображаем фильтр
  var filters = document.querySelector('.filters');
  filters.classList.remove('hidden');
})();

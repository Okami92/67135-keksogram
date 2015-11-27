'use strict';

(function() {
  // Контейнер фотографий
  var container = document.querySelector('.pictures');
  var activeFilter = 'filter-popular';
  var pictures = [];


  var filterForm = document.querySelector('.filters');
  var filters = document.querySelectorAll('.filters-radio');
  for (var i = 0; i < filters.length; i++) {
    filters[i].onclick = function(evt) {
      var clickedElementID = evt.target.id;
      setActiveFilter(clickedElementID);
    };
  }

  getPictures();

  /**
   * Отрисовка картинок
   * @param  {Array.<Object>} pictures
   */
  function renderPictures(picturesToRender) {
    container.innerHTML = '';
    var fragment = document.createDocumentFragment();

    // Перебираем все элементы в структуре данных
    picturesToRender.forEach(function(picture) {
      var element = getElementFromTemplate(picture);
      // Запихиваем в контейнер DocumentFragment
      fragment.appendChild(element);
    });

    // Анимируем отрисовку картинок
    var pics = fragment.querySelectorAll('.picture');
    for (i = 0; i < pics.length; i++) {
      appearPicture(pics[i], i);
    }

    container.appendChild(fragment);
  }

  /**
   * Добавляем анимацию появления картинок
   * @param {Array.<Object>} pic
   */
  function appearPicture(pic, number) {
    setTimeout(function() {
      pic.classList.add('picture--show');
    }, number * 30);
  }

  /**
   * Получение списка картинок
   */
  function getPictures() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/pictures.json');
    xhr.onload = function(evt) {
      var rawData = evt.target.responseText;
      var loadedPictures = JSON.parse(rawData);

      // Обновление списка картинок
      updateLoadedPictures(loadedPictures);
    };

    xhr.send();
  }

  /**
   * Сохранение списка картинок в переменную pictures, обновление счетчика отелей
   * и вызов фильтрации и отрисовки.
   * @param {Array.<Object>} loadedPictures
   */
  function updateLoadedPictures(loadedPictures) {
    pictures = loadedPictures;

    // Отрисовка полученных картинок
    setActiveFilter(activeFilter, true);
  }


  /**
   * Установка выбранного фильтра
   * @param {string} id
   * @param {boolean} force [Флаг на игнорирование проверки]
   */
  function setActiveFilter(id, force) {
    // Проверяем на идентичность
    if (activeFilter === id && !force) {
      return;
    }

    // Копирование массива
    var filteredPictures = pictures.slice(0);

    switch (id) {
      case 'filter-popular':
        filteredPictures = filteredPictures.sort(function(pic1, pic2) {
          return pic2.likes - pic1.likes;
        });
        break;
      case 'filter-new':
        // Удаляем все фотографии старше одного месяца
        filteredPictures = filteredPictures.filter(function(pic) {
          var oneMonthAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
          return Date.parse(pic.date) > oneMonthAgo.valueOf();
        });

        filteredPictures = filteredPictures.sort(function(pic1, pic2) {
          return Date.parse(pic2.date) - Date.parse(pic1.date);
        });
        break;
      case 'filter-discussed':
        filteredPictures = filteredPictures.sort(function(pic1, pic2) {
          return pic2.comments - pic1.comments;
        });
        break;
    }

    renderPictures(filteredPictures);

    activeFilter = id;
  }

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
    backgroundImage.src = data.url;
    backgroundImage.setAttribute('width', '182px');
    backgroundImage.setAttribute('height', '182px');

    // Заменяем img из шаблона на созданный backgroundImage
    element.replaceChild(backgroundImage, element.children[0]);

    return element;
  }

  // Отображаем фильтр
  filterForm.classList.remove('hidden');
})();

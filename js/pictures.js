/* global Photo: true, Gallery: true */

'use strict';

(function() {
  // Контейнер фотографий
  var container = document.querySelector('.pictures');
  var activeFilter = 'filter-popular';
  var pictures = []; // Начальный список
  var filteredPictures = []; // Отфильтрованный список
  var currentPage = 0;
  var PAGE_SIZE = 12;
  var gallery = new Gallery();

  var filters = document.querySelector('.filters');
  filters.addEventListener('click', function(evt) {
    var clickedElement = evt.target;
    if (clickedElement.getAttribute('name') === 'filter') {
      setActiveFilter(clickedElement.id);
    }
  });

  var scrollTimeout;

  // Отлавливаем "прокрутку" и подгружаем следующие страницы
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      _addPage();
    }, 100);
  });

  // NB! Может сделать свой обработчик?
  window.addEventListener('load', _addPage);
  window.addEventListener('resize', _addPage);

  /**
   * Обработчик добавления страницы
   * @param {Event} evt
   */
  function _addPage() {
    var bodyVisualHeight = document.documentElement.offsetHeight;
    var picturesCoordinates = document.querySelector('.pictures').getBoundingClientRect();

    if (picturesCoordinates.height <= bodyVisualHeight + window.scrollY) {
      // Увеличиваем текущую страницу, если мы еще не на последней
      if (currentPage < Math.ceil(filteredPictures.length / PAGE_SIZE)) {
        renderPictures(filteredPictures, ++currentPage);
      }
    }
  }

  getPictures();

  /**
   * Отрисовка картинок
   * @param  {Array.<Object>} pictures
   * @param {number} pageNumber
   * @package {boolean=} replace
   */
  function renderPictures(picturesToRender, pageNumber, replace) {
    if (replace) {
      var renderElements = document.querySelectorAll('.picture');

      Array.prototype.forEach.call(renderElements, function(el) {
        // Удаляем обработчик на фотографии
        el.removeEventListener('click', _onPhotoElementClick);
        // И саму фотографию
        container.removeChild(el);
      });
    }

    var fragment = document.createDocumentFragment();

    // Вырезаем страницу из PAGE_SIZE объектов для отображения
    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var pagePictures = picturesToRender.slice(from, to);

    // Перебираем все элементы в структуре данных
    pagePictures.forEach(function(picture) {
      var photoElement = new Photo(picture);
      photoElement.render();
      // Запихиваем в контейнер DocumentFragment
      fragment.appendChild(photoElement.element);

      photoElement.element.addEventListener('click', _onPhotoElementClick);
    });

    // Анимируем отрисовку картинок
    var pics = fragment.querySelectorAll('.picture');
    for (var i = 0; i < pics.length; i++) {
      appearPicture(pics[i], i);
    }

    container.appendChild(fragment);
  }

  /**
   * @param  {Event} evt
   */
  function _onPhotoElementClick(evt) {
    evt.preventDefault();
    gallery.show();
  }

  /**
   * Добавляем анимацию появления картинок
   * @param {Array.<Object>} pic
   */
  function appearPicture(pic, index) {
    setTimeout(function() {
      pic.classList.add('picture--show');
    }, index * 30);
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
    filteredPictures = pictures.slice(0);

    switch (id) {
      case 'filter-popular':
        filteredPictures = filteredPictures.sort(function(pic1, pic2) {
          return pic2.likes - pic1.likes;
        });
        break;
      case 'filter-new':
        // Удаляем все фотографии старше трех месяцев
        filteredPictures = filteredPictures.filter(function(pic) {
          var threeMonthAgo = new Date();
          threeMonthAgo.setMonth(threeMonthAgo.getMonth() - 3);
          return Date.parse(pic.date) > threeMonthAgo.valueOf();
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

    renderPictures(filteredPictures, 0, true);

    activeFilter = id;
  }

  // Отображаем фильтр
  filters.classList.remove('hidden');
})();

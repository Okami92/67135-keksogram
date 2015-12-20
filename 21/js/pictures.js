/* global requirejs: true, define: true */

/**
 * @fileOverview Модуль получает фотографии с данными из файла data/pictures.json,
 * затем выводит их на страницу с учетом заданного фильтра.
 */

'use strict';

requirejs.config({
  baseUrl: 'js'
});

define([
  'photo',
  'gallery',
  'resizer',
  'upload'
], function(Photo, Gallery) {
  /**
   * Контейнер фотографий
   * @type {HTMLElement}
   */
  var container = document.querySelector('.pictures');

  /**
   * Текущий фильтр
   * @type {String}
   */
  var activeFilter = localStorage.getItem('filter') || 'filter-popular';

  /**
   * Начальный список
   * @type {Array}
   */
  var pictures = [];

  /**
   * Отфильтрованный список
   * @type {Array}
   */
  var filteredPictures = [];

  /**
   * Текущая страница
   * @type {Number}
   */
  var currentPage = 0;

  /**
   * Кол-во фотографий на одну страницу
   * @type {Number}
   */
  var PAGE_SIZE = 12;

  /**
   * Создание галереи
   * @type {Gallery}
   */
  var gallery = new Gallery();

  /**
   * Блок с фильтрами
   * @type {HTMLElement}
   */
  var filters = document.querySelector('.filters');

  /**
   * Таймаут прокрутки
   */
  var scrollTimeout;

  /**
   * Время таймаута на скролле
   * @type {Number}
   */
  var SCROLL_TIMEOUT = 100;

  /**
   * Время через которое показываются фотографии
   * @type {Number}
   */
  var APPEAR_TIMEOUT = 30;


  /** Получение фотографий */
  getPictures();

  /**
   * Обработчик клика по блоку с фильтрами
   * @param  {MouseEvent} evt
   */
  filters.addEventListener('click', function(evt) {
    var clickedElement = evt.target;
    if (clickedElement.getAttribute('name') === 'filter') {
      setActiveFilter(clickedElement.id);
    }
  });

  // Отлавливаем "прокрутку" и подгружаем следующие страницы
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      _addPage();
    }, SCROLL_TIMEOUT);
  });

  // При загрузке и изменении размеров сайта запускаем обработчик добавления страницы
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

  /**
   * Отрисовка картинок
   * @param  {Array.<Object>} pictures
   * @param {number} pageNumber
   * @param {boolean=} replace
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
   * @param {number} index
   */
  function appearPicture(pic, index) {
    setTimeout(function() {
      pic.classList.add('picture--show');
    }, index * APPEAR_TIMEOUT);
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
    localStorage.setItem('filter', id);
    filters.querySelector('#' + activeFilter).checked = true;
  }

  // Отображаем фильтр
  filters.classList.remove('hidden');
});

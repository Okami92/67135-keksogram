/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Обработчик 'resizerchange'
   */
  window.addEventListener('resizerchange', function() {
    // Фильтр, который не позволяет пользователю вставлять часть картинки, которая
    // меньше, чем рамка

    // Условия по X
    // Левая границы
    if (currentResizer.getConstraint().x < 0) {
      currentResizer.setConstraint(0);
    }
    // Правая границы
    if (currentResizer.getConstraint().x > currentResizer.getImage().naturalWidth - currentResizer.getConstraint().side) {
      currentResizer.setConstraint(currentResizer.getImage().naturalWidth - currentResizer.getConstraint().side);
    }

    // Условия по Y
    // Верхняя граница
    if (currentResizer.getConstraint().y < 0) {
      currentResizer.setConstraint(currentResizer.getConstraint().x, 0);
    }
    // Нижняя границы
    if (currentResizer.getConstraint().y > currentResizer.getImage().naturalHeight - currentResizer.getConstraint().side) {
      currentResizer.setConstraint(currentResizer.getConstraint().x, currentResizer.getImage().naturalHeight - currentResizer.getConstraint().side);
    }

    // Отфильтрованные значения присваиваем форме
    resizeForm['resize-x'].value = parseInt(currentResizer.getConstraint().x, 10);
    resizeForm['resize-y'].value = parseInt(currentResizer.getConstraint().y, 10);
    resizeForm['resize-size'].value = parseInt(currentResizer.getConstraint().side, 10);
  });

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    if ((+resizeForm['resize-x'].value + +resizeForm['resize-size'].value <= currentResizer._image.naturalWidth) &&
      (+resizeForm['resize-y'].value + +resizeForm['resize-size'].value <= currentResizer._image.naturalHeight)) {
      return true;
    }
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  /**
   * Скрытие сообщения
   */
  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.addEventListener('load', function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);

          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        });

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });

  /**
   * Обработка изменения формы кадрирования.
   * @param {Event} evt
   */
  resizeForm.addEventListener('change', function(evt) {
    var element = evt.target;

    if (element.name === 'x') {
      if (+element.value <= 0) {
        element.value = 0;
        currentResizer.setConstraint(+element.value);
      } else if (+element.value + currentResizer.getConstraint().side <= currentResizer.getImage().naturalWidth) {
        currentResizer.setConstraint(+element.value);
      } else {
        element.value = currentResizer.getImage().naturalWidth - currentResizer.getConstraint().side;
        currentResizer.setConstraint(+element.value);
      }
    }

    if (element.name === 'y') {
      if (+element.value <= 0) {
        element.value = 0;
        currentResizer.setConstraint(+resizeForm['resize-x'].value, +element.value);
      } else if (+element.value + currentResizer.getConstraint().side <= currentResizer.getImage().naturalHeight) {
        currentResizer.setConstraint(+resizeForm['resize-x'].value, +element.value);
      } else {
        element.value = currentResizer.getImage().naturalHeight - currentResizer.getConstraint().side;
        currentResizer.setConstraint(+resizeForm['resize-x'].value, +element.value);
      }
    }

    if (element.name === 'size') {
      if (+element.value <= 0) {
        element.value = 0;
        currentResizer.setConstraint(+resizeForm['resize-x'].value, +resizeForm['resize-y'].value, +element.value);
      } else if (+element.value <= Math.min(currentResizer.getImage().naturalWidth - resizeForm['resize-x'].value,
                 currentResizer.getImage().naturalHeight - resizeForm['resize-y'].value)) {
        currentResizer.setConstraint(+resizeForm['resize-x'].value, +resizeForm['resize-y'].value, +element.value);
      } else {
        element.value = Math.min(currentResizer.getImage().naturalWidth - resizeForm['resize-x'].value,
                        currentResizer.getImage().naturalHeight - resizeForm['resize-y'].value);
        currentResizer.setConstraint(+resizeForm['resize-x'].value, +resizeForm['resize-y'].value, +element.value);
      }
    }

    currentResizer.redraw();
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
      filterImage.className = 'filter-image-preview ' + docCookies.getItem('filter');
      filterForm['upload-' + docCookies.getItem('filter')].setAttribute('checked', 'checked');
    }
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');

    // Последний день рождения
    var lastYearBirthday = new Date().getFullYear();
    var lastBirthday = new Date(lastYearBirthday, 11, 31);

    // Если в этом году еще не было дня рождения, то уменьшаем год
    if (lastBirthday > +Date.now()) {
      lastBirthday.setFullYear(lastYearBirthday - 1);
    }

    // Подсчитываем дни с прошедшего ДР
    var daysFromBirthday = +Date.now() - +lastBirthday;

    var dateToExpire = +Date.now() + daysFromBirthday;
    var formattedDateToExpire = new Date(dateToExpire).toUTCString();

    document.cookie = 'filter=' + filterImage.className.split(' ')[1] + ';expires=' + formattedDateToExpire;
  });

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  });

  cleanupResizer();
  updateBackground();
})();

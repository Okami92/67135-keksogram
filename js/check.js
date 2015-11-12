function getMessage(imageType, imageCount) {
  if (typeof imageType == "boolean") {
    if (imageType == true) {
      return "Переданное GIF-изображение анимировано и содержит " + imageCount + " кадров";
    } else {
      return "Переданное GIF-изображение не анимировано";
    }
  } else if (typeof imageType == "number") {
    return "Переданное SVG-изображение содержит " + imageType + " объектов и " + imageCount * 4 + " аттрибутов"
  } else if (imageType instanceof Array && imageCount instanceof Array) {
    var square = 0;
    if (imageType.length != imageCount.length) {
      return "Невозможно обработать данное изображение, попробуйте загрузить другое";
    }
    for (var i = 0; i < imageType.length; i++) {
      square += imageType[i] * imageCount[i];
    }
    return "Общая площадь артефактов сжатия: " + square + " пикселей";
  } else if (imageType instanceof Array) {
    var sum = 0;
    for (var i = 0; i < imageType.length; i++) {
      sum += imageType[i];
    }
    return "Количество красных точек во всех строчках изображения: " + sum;
  } else {
    return "Невозможно обработать данное изображение, попробуйте загрузить другое";
  }
}

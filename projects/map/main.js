ymaps.ready(init);
let map;

function init() {
  map = new ymaps.Map('map', {
    center: [55.76, 37.61],
    zoom: 7,
    controls: ['zoomControl'],
    behaviors: ['drag'],
  });
  const placemark = new ymaps.Placemark([55.8, 38.0], {
    hintContent: 'Хинт',
    balloonContent: 'Балун',
  });
  map.geoObjects.add(placemark);
}
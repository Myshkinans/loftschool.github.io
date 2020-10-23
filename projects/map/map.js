class GeoReview {
  address;
  reviewId = 0;
  reviews = [];

  constructor() {
    this.formTemplate = document.querySelector('#addFormTemplate').innerHTML;
    this.map = new InteractiveMap('map', this.onClick.bind(this));
    this.map.init().then(this.onInit.bind(this));
  }
  async onInit() {
    const localS = JSON.parse(localStorage.getItem('map'));
    if (localS !== null) {
      const b = JSON.parse(localStorage.getItem('map'));
      for (const obj of b) {
        this.reviews.push(obj);
        this.map.createPlacemark(obj.coords);
      }
    }
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  createForm(coords) {
    const root = document.createElement('div');
    root.innerHTML = this.formTemplate;
    const reviewList = root.querySelector('[data-role=review-list]');
    const reviewForm = root.querySelector('[data-role=review-form]');
    reviewForm.dataset.coords = JSON.stringify(coords);

    for (const obj of this.reviews) {
      const a = JSON.stringify(obj.address);
      const b = localStorage.getItem('address');
      //фильтр для показа только тех отзывов, которые имеют одинаковые адрес
      if (a === b) {
        const div = document.createElement('div');
        div.classList.add('review-item');
        div.innerHTML = `
          <div>
              <b>${obj.name}</b> [${obj.place}]
          </div>
          <div>${obj.text}</div>`;
        reviewList.appendChild(div);
      }
    }
    return root;
  }
  async onClick(coords) {
    const adr = await this.getAddress(coords);
    localStorage.setItem('address', JSON.stringify(adr));
    this.map.openBalloon(coords);
    const form = this.createForm(coords);
    this.map.setBalloonContent(form.innerHTML);
  }
  async getAddress(coords) {
    return new Promise((resolve, reject) => {
      ymaps
        .geocode(coords)
        .then((response) => resolve(response.geoObjects.get(0).getAddressLine()))
        .catch((e) => reject(e));
    });
  }
  //когда кликаем на кнопку "добавить":
  async onDocumentClick(e) {
    if (e.target.dataset.role === 'review-add') {
      const reviewForm = document.querySelector('[data-role=review-form]');
      const coords = JSON.parse(reviewForm.dataset.coords);
      const adr = await this.getAddress(coords);
      const data = {
        reviewId: this.reviewId,
        address: adr,
        coords: coords,
        name: reviewForm.querySelector('#name').value,
        place: reviewForm.querySelector('#place').value,
        text: reviewForm.querySelector('#text').value,
      };
      this.reviewId++;

      this.reviews.push(data);
      localStorage.setItem('map', JSON.stringify(this.reviews));

      this.map.createPlacemark(coords);
      this.map.closeBalloon();
    }

    /*try {
                  console.log(strData);
                  storage.data = strData;
                  console.log(strData);
                  this.map.createPlacemark(coords);
                  this.map.closeBalloon();
              } catch (e) {
                  const formError = document.querySelector('.form-error');
                 
              }*/
  }
}

class InteractiveMap {
  clusterer;
  mapCenter = [55.75, 37.6];

  constructor(mapId, onClick) {
    this.mapId = mapId;
    this.onClick = onClick;
  }

  async init() {
    await this.injectYMapsScript();
    await this.loadYMaps();
    this.initMap();
  }
  injectYMapsScript() {
    return new Promise((resolve) => {
      const ymapsScript = document.createElement('script');
      ymapsScript.src =
        'https://api-maps.yandex.ru/2.1/?apikey=44db2daf-cbf1-418c-993b-da5a199788bb&lang=ru_RU';
      document.body.appendChild(ymapsScript);
      ymapsScript.addEventListener('load', resolve);
    });
  }
  loadYMaps() {
    return new Promise((resolve) => ymaps.ready(resolve));
  }
  getAddress(coords) {
    return new Promise((resolve, reject) => {
      ymaps
        .geocode(coords)
        .then((response) => resolve(response.geoObjects.get(0).getAddressLine()))
        .catch((e) => reject(e));
    });
  }
  initMap() {
    this.clusterer = new ymaps.Clusterer({
      groupByCoordinates: false,
      clusterDisableClickZoom: true,
      clucterOpenBalloonOnClick: true,
      clusterHideIconOnBalloonOpen: false,
    });
    // const objectManager = new ymaps.ObjectManager({
    //   clusterize: true,
    // Опции кластеров задаются с префиксом 'cluster'.
    //   clusterHasBalloon: false,
    // Опции геообъектов задаются с префиксом 'geoObject'.
    ///   geoObjectOpenBalloonOnClick: false,
    // });

    // objectManager.objects.events.add('click', function (e) {
    //var objectId = e.get('objectId');
    //  objectManager.objects.balloon.open(objectId);
    // });

    this.clusterer.events.add('click', (e) => {
      const coords = e.get('target').geometry.getCoordinates();
      this.onClick(coords);
    });
    this.map = new ymaps.Map(this.mapId, {
      center: [55.75, 37.6],
      zoom: 10,
      controls: ['zoomControl'],
      behaviors: ['drag', 'scrollZoom'],
    });
    this.map.events.add('click', (e) => this.onClick(e.get('coords')));
    this.map.geoObjects.add(this.clusterer);
  }

  openBalloon(coords, content) {
    this.map.balloon.open(coords, content);
  }
  setBalloonContent(content) {
    this.map.balloon.setData(content);
  }
  closeBalloon() {
    this.map.balloon.close();
  }
  createPlacemark(coords) {
    const placemark = new ymaps.Placemark(coords);
    placemark.events.add('click', (e) => {
      const coords = e.get('target').geometry.getCoordinates();
      this.onClick(coords);
    });
    this.clusterer.add(placemark);
  }
}
new GeoReview();

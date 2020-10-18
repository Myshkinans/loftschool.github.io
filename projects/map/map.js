class GeoReview {
  constructor() {
    this.formTemplate = document.querySelector('#addFormTemplate').innerHTML;
    this.map = new InteractiveMap('map', this.onClick.bind(this));
    this.map.init().then(this.onInit.bind(this));
  }
  async onInit() {
    for (let i = 0; i < localStorage.length; i++) {
      const t = localStorage.key([i]);
      const d = JSON.parse(localStorage.getItem(t));
      const coor = d.coords;
      this.map.createPlacemark(coor);
    }
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  createForm(coords) {
    const root = document.createElement('div');
    root.innerHTML = this.formTemplate;
    const reviewList = root.querySelector('[data-role=review-list]');
    const reviewForm = root.querySelector('[data-role=review-form]');
    const reviewAdd = root.querySelector('review-add');
    reviewForm.dataset.coords = JSON.stringify(coords);

    console.log('координаты:', coords);

    // console.log(localStorage.getItem());

    for (let i = 0; i < localStorage.length; i++) {
      const t = localStorage.key([i]);
      const d = JSON.parse(localStorage.getItem(t));

      console.log('через инклуд', coords.includes(coords));
      console.log('сравнение через===', coords === d.coords);
      console.log('локалкоорд:', coords);
      const div = document.createElement('div');
      div.classList.add('review-item');
      div.innerHTML = `
        <div>
            <b>${d.name}</b> [${d.place}]
        </div>
        <div>${d.text}</div>`;
      reviewList.appendChild(div);
    }
    return root;
  }
  async onClick(coords) {
    this.map.openBalloon(coords);
    const list = this.localStorage;
    const form = this.createForm(coords);
    this.map.setBalloonContent(form.innerHTML);
  }
  createNewkey() {
    return Math.round(Math.random() * 10000000);
  }
  async onDocumentClick(e) {
    const storage = localStorage;

    if (e.target.dataset.role === 'review-add') {
      const reviewForm = document.querySelector('[data-role=review-form]');
      const coords = JSON.parse(reviewForm.dataset.coords);
      const data = {
        coords: coords,
        name: reviewForm.querySelector('#name').value,
        place: reviewForm.querySelector('#place').value,
        text: reviewForm.querySelector('#text').value,
      };
      const strData = JSON.stringify(data);
      console.log(data.coords);
      const c = this.createNewkey();
      storage.setItem(c, strData);

      //var review = JSON.parse(storage.data);

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
  initMap() {
    this.clusterer = new ymaps.Clusterer({
      groupByCoordinates: true,
      clusterDisableClickZoom: true,
      clucterOpenBalloonOnClick: false,
    });
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

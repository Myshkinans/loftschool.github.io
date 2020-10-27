/* Задание со звездочкой */

/*
 Создайте страницу с кнопкой.
 При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией на экране
 Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
import './dnd.html';

function random(n) {
  return Math.round(Math.random() * n);
}

let currentDrag;
let startX = 0;
let startY = 0;

const homeworkContainer = document.querySelector('#app');

document.addEventListener('mousemove', (e) => {
  if (currentDrag) {
    currentDrag.style.top = e.clientY - startY + 'px';
    currentDrag.style.left = e.clientX - startX + 'px';
  }
});

export function createDiv() {
  const c = document.createElement('div');
  const maxSize = 300;
  const maxColor = 0xffffff;

  c.className = 'draggable-div';
  c.style.background = '#' + random(maxColor).toString(16);
  c.style.top = random(window.innerHeight) + 'px';
  c.style.left = random(window.innerWidth) + 'px';
  c.style.width = random(maxSize) + 'px';
  c.style.height = random(maxSize) + 'px';

  c.addEventListener('mousedown', (e) => {
    currentDrag = c;
    startX = e.offsetX;
    startY = e.offsetY;
  });
  c.addEventListener('mouseup', () => (currentDrag = false));
  return c;
}

const addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function () {
  const c = createDiv();
  homeworkContainer.appendChild(c);
});

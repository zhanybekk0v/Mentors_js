
const API = 'http://localhost:8000/products'
//? переменные для инпутов: для добавления товаров 
let name = document.querySelector('#name')
let surname = document.querySelector('#surname')
let age = document.querySelector('#age')
let about = document.querySelector('#about')
let image = document.querySelector('#image')
let btnAdd = document.querySelector('#btn-add')

//? блок для отображать товаров 
let list = document.querySelector('#products-list')

//? переменные для инпутов : редактирование товаров 
let editName = document.querySelector('#edit-name')
let editSurName = document.querySelector('#edit-surname')
let editAge = document.querySelector('#edit-age')
let editAbout = document.querySelector('#edit-about')
let editImage = document.querySelector('#edit-image')
let editSaveBtn = document.querySelector('#btn-save-edit')
let exampleModal = document.querySelector('#exampleModal')

//? searh
let searchChip = document.querySelector('#search')
let searchVal = '';

//? pagination 

let currentPage = 1; // текущая страница
let pageTotalCount = 1; //общее кол-во страниц
let paginationList = document.querySelector('.pagination-list') // блок куда добавляются кнопки с цифрами для переключения между сраницами
let prev = document.querySelector('.prev') //кнопка пред.страницы 
let next = document.querySelector('.next')  // кнопка след.страницы


//? добавление слушателя событий на кнопку 
btnAdd.addEventListener('click', async function () {
  //? формируем объект с данными из инпутов 
  let obj = {
    name: name.value,
    surname: surname.value,
    age: age.value,
    about: about.value,
    image: image.value,
  };
  //? проверка на заполненность, если хотябы один из инпутов пустой, срабатывает return, который останавливает весь код после 
  if (
    !obj.name.trim() ||
    !obj.surname.trim() ||
    !obj.age.trim() ||
    !obj.about.trim() ||
    !obj.image.trim()
  ) {
    alert("Заполните поля")
    return;
  }
  //? отправка POST запросы для добавления в database 
  await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },//? кодировка 
    body: JSON.stringify(obj), //? содержимое запроса 
  });

  render();
  //? очищаем инпуты 

  name.value = '';
  surname.value = '';
  age.value = '';
  about.value = '';
  image.value = '';
});

//! отображение карточек товаров 
render();
async function render() {
  //? получаем данные через get запрос из db 
  let products = await fetch(`${API}?q=${searchVal}&_page=${currentPage}&_limit=3`)
    .then((res) => res.json())
    .catch((err) => console.log(err));

  drawPaginationButtons()
  //? очищаем содержимое блока list 
  list.innerHTML = '';
  //? перебор массива с продуктами и отрисовка 
  products.forEach((element) => {
    // console.log(element.image);
    let newElem = document.createElement('div')
    newElem.id = element.id;
    newElem.innerHTML = ` 
        <div class="card m-5" style="width: 18rem;"> 
  <img  src="${element.image}" class="card-img-top" alt="..." > 
  <div class="card-body"> 
    <h5 class="card-title">${element.name}</h5> 
    <p class="card-text">${element.surname}</p> 
    <p class="card-text">${element.age}</p> 
    <p class="card-text">${element.about}</p> 
    <div class="d-flex justify-content-between">
    <a href="#" class="btn btn-danger btn-delete" id=${element.id}>DELETE</a> 
    <a href="#" class="btn btn-primary btn-edit" data-bs-toggle="modal" data-bs-target="#exampleModal" id=${element.id}>EDIT</a> 
    </div>
  </div> 
</div>`;
    list.append(newElem);//? отрисовываем карточку из list 
  });
}

//! редоктирование продуктов 
document.addEventListener('click', function (e) {
  //? отлавлимаем нажатие именно по кнопке с классом btn-edit 
  if (e.target.classList.contains('btn-edit')) {
    //? получаем id 
    let id = e.target.id
    // console.log(id)
    //? делаем запрос на редоктируемый продукт по id 
    fetch(`${API}/${id}`).then((res) => res.json())
      .then((data) => {
        //? заполняем инпуты модального окна, данными из полученного продукта 
        editName.value = data.name;
        editSurName.value = data.surname;
        editAge.value = data.age;
        editAbout.value = data.about;
        editImage.value = data.image;
        //? передаем id кнопке save через аттрибут 
        editSaveBtn.setAttribute('id', data.id)
      })
  }
})
//? слушатель событий на кнопку соxранения 
editSaveBtn.addEventListener('click', function () {
  let id = this.id
  //? вытаскиваем данные из инпутов 
  let name = editName.value;
  let surname = editSurName.value;
  let age = editAge.value;
  let about = editAbout.value;
  let image = editImage.value;

  editImage.value;
  //? делаем проверку на заполненность 
  if (!name ||
    !surname ||
    !age ||
    !about ||
    !image) return;


  //? формулируем объект с отредактированными данными 
  let editedProduct = {
    name: name,
    surname: surname,
    age: age,
    about: about,
    image: image,
  };
  saveEdit(editedProduct, id);
});
//? функция для сохранение изменений 
async function saveEdit(editedProduct, id) {
  await fetch(`${API}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(editedProduct),
  });
  //? Вызов функции render для отображения обновленных данных 
  render();
  //? закрываем модалку 
  let modal = bootstrap.Modal.getInstance(exampleModal);
  modal.hide();
}

//? delete function 

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-delete')) {
    let id = e.target.id;
    fetch(`${API}/${id}`, {
      method: "DELETE"
    }).then(() => render())

  }
})


//? search 

searchChip.addEventListener('input', () => {
  console.log(74);
  searchVal = searchChip.value;
  render()
})



//? pagination 

function drawPaginationButtons() {
  fetch(`${API}?q=${searchVal}`) // запрос на сервер чтобы узнать общее кол-во продуктов4
    .then((res) => res.json())
    .then((data) => {
      pageTotalCount = Math.ceil(data.length / 3) // рассчитываем общее кол-во продуктов делим на кол-во продуктов , которые отображаются на одной странице
      // pageTotalCount = кол-во страниц

      paginationList.innerHTML = '';

      for (let i = 1; i <= pageTotalCount; i++) {
        if (currentPage == i) {
          let page1 = document.createElement('li')
          page1.innerHTML = `<li class="page-item active"><a class="page-link page_number"  href="#">${i}</a></li> 
        `;
          paginationList.append(page1)
        } else {
          let page1 = document.createElement('li')
          page1.innerHTML = `<li class="page-item"><a class="page-link page_number"  href="#">${i}</a></li> 
        `;
          paginationList.append(page1)
        }
      }

      //? красим кнопки prec - next в серый
      if (currentPage == 1) {
        prev.classList.add('disabled')
      } else {
        prev.classList.remove('disabled')
      }
      if (currentPage == pageTotalCount) {
        next.classList.add('disabled')
      } else {
        next.classList.remove('disabled')
      }
    })
}

//?  логика кнопка переключения на пред.страницу 
prev.addEventListener('click', () => {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  render()
})

//?  логика кнопка переключения на след.страницу 
next.addEventListener('click', () => {
  if (currentPage >= pageTotalCount) {
    return;
  }
  currentPage++;
  render()
});

//? КНОПКИ переключения на определеннну страницу

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('page_number')) {
    currentPage = e.target.innerText;
    render()
  }
})

// import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs'
// СКРИПТЫ СЛАЙДЕРА

// var splide = new Splide('.clients__splide', {
// 	perMove: 1,
// 	gap: '4px',
// 	arrows: false,
// 	pagination: false,
// 	perPage    : 1,
// 	autoWidth  : false,
// 	fixedWidth : 300,
// 	gap        : '10px',
// 	speed      : 500,
// 	padding: {
// 		left: '16px'
// 	}
// }).mount();

// const items = document.querySelectorAll('.clients__slide');

// items.forEach(function (item) {
// 	item.addEventListener('click', function () {
// 			var index = parseInt(item.getAttribute('data-index'), 10);
// 			splide.go(index);  // Перемещаем слайдер к нужному индексу
// 	});
// });

// const backButton = document.querySelector('.back-button');
// function toggleBackButton(index) {
// 	if (index > 0) {
// 			backButton.style.display = 'flex'; // Показываем кнопку, если не первый слайд
// 	} else {
// 			backButton.style.display = 'none'; // Скрываем, если это первый слайд
// 	}
// }

// // Добавляем обработчик клика для кнопки «Назад»
// backButton.addEventListener('click', function () {
// 	if (splide.index > 0) {
// 			splide.go(splide.index - 1); // Возвращает к предыдущему слайду
// 	}
// });

// // Обновляем кнопку во время смены слайдов
// splide.on('move', function (newIndex) {
// 	toggleBackButton(newIndex);
// });

const backButton = document.querySelector('.back-button');

function updateBackButtonVisibility(index) {
	backButton.style.display = index > 0 ? 'block' : 'none'; // Показываем или скрываем кнопку
}

const swiper = new Swiper('.clients__splide', {
	slidesPerView: 1.5,
	spaceBetween: 10,
	// width: 300,
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},
	speed: 500,
	freeMode: true,
	navigation: false,
	on: {
		init: function () {
			updateBackButtonVisibility(this.activeIndex);
		},
		slideChange: function () {
			updateBackButtonVisibility(this.activeIndex);
		},
	},
});

const items = document.querySelectorAll('.clients__slide');

items.forEach(function (item) {
	item.addEventListener('click', function () {
		const index = parseInt(item.getAttribute('data-index'), 10);
		swiper.slideTo(index);  // Перемещаем слайдер к нужному индексу
	});
});


// Обработчик клика для кнопки "Назад"
backButton.addEventListener('click', function () {
	if (swiper.activeIndex > 0) {
		swiper.slideTo(swiper.activeIndex - 1); // Возвращает к предыдущему слайду
	}
});


// СКРИПТЫ КОРЗИНЫ
function addProductToCard() {
	// img, name, priceNow, priceOld, size

	const img = document.querySelector('.hero__img').src;
	const name = document.querySelector('.hero__title').textContent;
	const priceNow = document.querySelector('.hero__price-now span').textContent;
	const priceOld = document.querySelector('.hero__price-old span').textContent;
	const size = 100;
	const qty = 1;


	const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
	/*
		if (cart.some(item => item.name === name)) {
																		//console.log('return same! addProdCart', name, JSON.stringify(cart));
			return;
		}
	*/
	console.log('addProdCart', name, JSON.stringify(cart), checkNameExists(cart, name));
	if (checkNameExists(cart, name)) {
		console.log('ignor', name)
		return
	}

	cart.unshift({ img, name, priceNow, priceOld, size, qty });
	localStorage.setItem('cart', JSON.stringify(cart));

	outputCart()
}

function plusProduct(name) {
	let cart = JSON.parse(localStorage.getItem('cart') || '[]');

	cart = cart.map(item => {
		if (item.name === name && item.qty < 3) {
			item.qty++;
			const basePrice = parseFloat(item.priceOld.replace(',', '.').replace(' zł', '').replace('zł', ''));

			switch (item.qty) {
				case 2:
					item.priceNow = (basePrice * 0.9).toFixed(2);
					break;
				case 3:
					item.priceNow = (basePrice * 0.8).toFixed(2);
					break;
				default:
					item.priceNow = basePrice.toFixed(2);
			}
		}
		return item;
	});

	localStorage.setItem('cart', JSON.stringify(cart));
	outputCart();

	const currentItem = cart.find(item => item.name === name);
	if (currentItem) {
		syncRadioWithQty(currentItem.qty);
	}
}

function minusProduct(name) {
	let cart = JSON.parse(localStorage.getItem('cart') || '[]');

	cart = cart.map(item => {
		if (item.name === name && item.qty > 1) {
			item.qty--;
			const basePrice = parseFloat(item.priceOld.replace(',', '.').replace(' zł', '').replace('zł', ''));

			switch (item.qty) {
				case 2:
					item.priceNow = (basePrice * 0.9).toFixed(2);
					break;
				case 1:
				default:
					item.priceNow = basePrice.toFixed(2);
					break;
			}
		}
		return item;
	});

	localStorage.setItem('cart', JSON.stringify(cart));
	outputCart();

	const currentItem = cart.find(item => item.name === name);
	if (currentItem) {
		syncRadioWithQty(currentItem.qty);
	}
}


// function outputCart() {
// 	const cartList = document.querySelector('.cart__list');
// 	cartList.innerHTML = '';

// 	const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

// 	cart.forEach(item => {
// 		const li = document.createElement('li');
// 		li.classList.add('cart__item');
// 		li.innerHTML = `
// 			<img src="${item.img}" alt="${item.name}" class="cart__item-img">
// 			<div class="cart__item-body">
// 				<h5 class="cart__item-title">${item.name}</h5>
// 				<div class="cart__item-info">
// 					<div class="cart__item-price">${item.priceNow} zł &nbsp; <span>${item.priceOld} zł</span></div>
// 					<div class="cart__item-size">${item.size} ml</div>
// 				</div>
// 				<div class="cart__item-amount">
// 					<button class="cart__item-minus" onclick="minusProduct('${item.name}') ">-</button>
// 					<div class="cart__item-count">
// 						<span class="cart__item-count-number">${item.qty}</span>
// 						&nbsp; szt
// 					</div>
// 					<button class="cart__item-plus" onclick="plusProduct('${item.name}') ">+</button>
// 				</div>
// 			</div>
// 		`;
// 		cartList.append(li);
// 	})

// 	outputCartTotal()
// }
// function outputCart() {
// 	const cartList = document.querySelector('.cart__list');
// 	cartList.innerHTML = '';

// 	const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

// 	cart.forEach((item, index) => {
// 		const li = document.createElement('li');
// 		li.classList.add('cart__item');
// 		li.innerHTML = `
// 			<img src="${item.img}" alt="${item.name}" class="cart__item-img">
// 			<div class="cart__item-body">
// 				<h5 class="cart__item-title">${item.name}</h5>
// 				<div class="cart__item-info">
// 					<div class="cart__item-price">${item.priceNow} zł &nbsp; <span>${item.priceOld} zł</span></div>
// 					<div class="cart__item-size">${item.size} ml</div>
// 				</div>
// 				<div class="cart__item-amount">
// 					<button class="cart__item-minus">-</button>
// 					<div class="cart__item-count">
// 						<span class="cart__item-count-number">${item.qty}</span>
// 						&nbsp; szt
// 					</div>
// 					<button class="cart__item-plus">+</button>
// 				</div>
// 			</div>
// 		`;

// 		// Привязываем обработчики событий безопасно
// 		const minusBtn = li.querySelector('.cart__item-minus');
// 		const plusBtn = li.querySelector('.cart__item-plus');

// 		minusBtn.addEventListener('click', () => {
// 			minusProduct(item.name);
// 		});

// 		plusBtn.addEventListener('click', () => {
// 			plusProduct(item.name);
// 		});

// 		cartList.append(li);
// 	});

// 	outputCartTotal();
// }
function addProductToCart() {
	const img = document.querySelector('.hero__img').src;
	const name = document.querySelector('.hero__title').textContent;
	const priceNow = document.querySelector('.hero__price-now span').textContent;
	const priceOld = document.querySelector('.hero__price-old span').textContent;
	const size = 100;

	const selectedRadio = document.querySelector('.offer-radio:checked');
	const qty = selectedRadio ? parseInt(selectedRadio.value) : 1;

	let cart = JSON.parse(localStorage.getItem('cart') || '[]');

	const existing = cart.find(item => item.name === name);
	if (existing) return;

	cart.unshift({ img, name, priceNow, priceOld, size, qty });
	localStorage.setItem('cart', JSON.stringify(cart));
	outputCart();
}

function minusProduct(name) {
	let cart = JSON.parse(localStorage.getItem('cart') || '[]');
	cart = cart.map(item => {
		if (item.name === name && item.qty > 1) {
			item.qty--;
		}
		return item;
	});
	localStorage.setItem('cart', JSON.stringify(cart));
	outputCart();
}

function plusProduct(name) {
	let cart = JSON.parse(localStorage.getItem('cart') || '[]');
	cart = cart.map(item => {
		if (item.name === name && item.qty < 3) {
			item.qty++;
		}
		return item;
	});
	localStorage.setItem('cart', JSON.stringify(cart));
	outputCart();
}

function updateCartQtyFromRadio(qty) {
	const name = document.querySelector('.hero__title').textContent;
	let cart = JSON.parse(localStorage.getItem('cart') || '[]');
	cart = cart.map(item => {
		if (item.name === name) item.qty = qty;
		return item;
	});
	localStorage.setItem('cart', JSON.stringify(cart));
	outputCart();
}


function syncRadioWithQty(qty) {
	const radios = document.querySelectorAll('input[name="offer"]');
	const promoBtn = document.getElementById('submitForm');
	const offerValue = String(qty);

	radios.forEach(r => {
		const label = r.closest('label');

		r.checked = r.value === offerValue;

		if (r.checked) {
			label.classList.add('offer-option--selected');
		} else {
			label.classList.remove('offer-option--selected');
		}
	});

	let rabatText = '';
	let priceNow = '';
	let priceOld = '';

	switch (offerValue) {
		case '1':
			rabatText = 'Rabat 55%';
			priceNow = '219';
			priceOld = '509';
			break;
		case '2':
			rabatText = 'Rabat 65%';
			priceNow = '394,20';
			priceOld = '1018';
			break;
		case '3':
			rabatText = 'Rabat 70%';
			priceNow = '525';
			priceOld = '1527';
			break;
	}

	promoBtn.setAttribute('data-rabat', rabatText);
	promoBtn.querySelector('.order-form__price-now').textContent = priceNow;
	promoBtn.querySelector('.order-form__price-old span').textContent = priceOld;

	localStorage.setItem('selectedOffer', offerValue);
}

function outputCart() {
	const cartList = document.querySelector('.cart__list');
	cartList.innerHTML = '';

	const cart = JSON.parse(localStorage.getItem('cart') || '[]');
	cart.forEach(item => {
		const li = document.createElement('li');
		li.classList.add('cart__item');
		li.innerHTML = `
			<img src="${item.img}" alt="${item.name}" class="cart__item-img">
			<div class="cart__item-body">
				<h5 class="cart__item-title">${item.name}</h5>
				<div class="cart__item-info">
					<div class="cart__item-price">${item.priceNow} zł &nbsp; <span>${item.priceOld} zł</span></div>
					<div class="cart__item-size">${item.size} ml</div>
				</div>
				<div class="cart__item-amount">
					<button class="cart__item-minus">-</button>
					<div class="cart__item-count">
						<span class="cart__item-count-number">${item.qty}</span>
						&nbsp; szt
					</div>
					<button class="cart__item-plus">+</button>
				</div>
			</div>
		`;

		li.querySelector('.cart__item-minus').addEventListener('click', () => minusProduct(item.name));
		li.querySelector('.cart__item-plus').addEventListener('click', () => plusProduct(item.name));

		cartList.append(li);

		syncRadioWithQty(item.qty);
	});

	outputCartTotal();
}

function outputCartTotal() {
	const cart = JSON.parse(localStorage.getItem('cart') || '[]');
	let totalNow = 0;
	let totalOld = 0;

	cart.forEach(item => {
		totalNow += parseFloat(item.priceNow.replace(',', '.')) * item.qty;
		totalOld += parseFloat(item.priceOld.replace(',', '.')) * item.qty;
	});

	document.querySelector('.cart__total-price-now').textContent = totalNow.toFixed(2).replace('.', ',');
	document.querySelector('.cart__total-price-old span').textContent = totalOld.toFixed(2).replace('.', ',');
}

function initRadioEvents() {
	document.querySelectorAll('.offer-radio').forEach(radio => {
		radio.addEventListener('change', () => {
			const qty = parseInt(radio.value);
			updateCartQtyFromRadio(qty);
		});
	});
}

document.addEventListener('DOMContentLoaded', () => {
	outputCart();
	initRadioEvents();
});

function outputCartTotal() {
	const cartTotalPriceNow = document.querySelector('.cart__total-price-now');
	const cartTotalPriceOld = document.querySelector('.cart__total-price-old span');

	const formPriceNow = document.querySelector('.order-form__price-now');
	const formPriceOld = document.querySelector('.order-form__price-old span');

	const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

	const totalNow = cart.reduce((acc, item) => {
		acc += item.priceNow * item.qty
		return acc;
	}, 0);

	const totalOld = cart.reduce((acc, item) => {
		acc += item.priceOld * item.qty
		return acc;
	}, 0);

	cartTotalPriceNow.textContent = totalNow;
	cartTotalPriceOld.textContent = totalOld;

	formPriceNow.textContent = totalNow;
	formPriceOld.textContent = totalOld;
}

function addProductToCardFromCatalog() {
	const buttons = document.querySelectorAll('.catalog__card-btn');

	buttons.forEach(button => {
		button.addEventListener('click', function (e) {
			const catalogCard = e.target.closest('.catalog__card');
			//const catalogCard = this.closest('.catalog__card'); // не правильно, нужно получать через событие и target
			// и далее уже получать элементы из этого объекта!

			if (catalogCard) {
				const linkElement = catalogCard.querySelector('a');

				if (linkElement) {
					/*
								const href = linkElement.getAttribute('href');
								const img = document.querySelector('.catalog__card-img').src;
								const name = document.querySelector('.catalog__card-title').textContent;
								const size = 100;
								const priceNow = document.querySelector('.catalog__card-price--now').textContent;
								const priceOld = document.querySelector('.catalog__card-price--old').textContent;
								const qty = 1;
					*/
					const href = linkElement.getAttribute('href');
					const img = catalogCard.querySelector('.catalog__card-img').src;
					const name = catalogCard.querySelector('.catalog__card-title').getAttribute('data-name');
					const size = 100;
					const priceNow = catalogCard.querySelector('.catalog__card-price--now').textContent;
					const priceOld = catalogCard.querySelector('.catalog__card-price--old').textContent;
					const qty = 1;

					const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
					/*
												if (cart.some(item => item.name === name)) {
													return;
												}
					*/
					if (checkNameExists(cart, name)) {
						return
					}
					cart.push({ img, name, priceNow, priceOld, size, qty });
					localStorage.setItem('cart', JSON.stringify(cart));
					outputCart();
				}
			}
		});
	});
}
/*

Сейчас, на самом деле, будет работать и простой фильтр: if (cart.some(item => item.name === name))
 */
function checkNameExists(itemsArray, searchName) {
	if (!Array.isArray(itemsArray) || !searchName) return false;
	console.log('itemsArray ', JSON.stringify(itemsArray), ' seachName ', searchName);
	// Нормализация: приводим к базовой латинице, удаляем лишнее
	const normalize = (str) => {
		return str
			.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Удаляем акценты (например, ę → e)
			.toLowerCase()
			.replace(/[^\w\s]/g, ' ') // Заменяем все спецсимволы на пробелы
			.replace(/\b\d+\s*(ml|g|kg)\b/g, '') // Удаляем объемы
			.replace(/\s+/g, ' ') // Убираем двойные пробелы
			.trim();
	};

	const searchWords = normalize(searchName)
		.split(/\s+/)
		.filter(word => word.length > 2);

	if (searchWords.length === 0) return false;

	return itemsArray.some(item => {
		if (!item?.name) return false;
		const itemName = normalize(item.name);
		const similarity = (a, b) => {
			// Реализация алгоритма сравнения (например, Левенштейна)
			return a.includes(b) || b.includes(a); // Простейшая проверка
		};
		return searchWords.every(word =>
			itemName.split(/\s+/).some(itemWord => similarity(itemWord, word))
		);
	});
}

function refreshCountdown() {
	const now = new Date();
	const midnight = new Date();
	midnight.setHours(24, 0, 0, 0);
	const diff = midnight - now;

	const h = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0');
	const m = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
	const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

	document.getElementById('offer-timer').textContent = `${h}:${m}:${s}`;
}

refreshCountdown();
setInterval(refreshCountdown, 1000);

const form = document.getElementById('offer-form');
const labels = form.querySelectorAll('.offer-option');

labels.forEach(label => {
	const radio = label.querySelector('.offer-radio');
	radio.addEventListener('change', () => {
		labels.forEach(l => l.classList.remove('offer-option--selected'));
		if (radio.checked) {
			label.classList.add('offer-option--selected');
		}
	});
});

refreshCountdown();
setInterval(refreshCountdown, 1000);


function updateTimer() {
	const now = new Date();
	const midnight = new Date();
	midnight.setHours(24, 0, 0, 0);

	const diff = midnight - now;

	const hours = Math.floor(diff / 1000 / 60 / 60);
	const minutes = Math.floor((diff / 1000 / 60) % 60);
	const seconds = Math.floor((diff / 1000) % 60);

	const formatDigits = (num) => String(num).padStart(2, '0').split('');

	const [h1, h2] = formatDigits(hours);
	const [m1, m2] = formatDigits(minutes);
	const [s1, s2] = formatDigits(seconds);

	document.getElementById('hours').children[0].textContent = h1;
	document.getElementById('hours').children[1].textContent = h2;
	document.getElementById('minutes').children[0].textContent = m1;
	document.getElementById('minutes').children[1].textContent = m2;
	document.getElementById('seconds').children[0].textContent = s1;
	document.getElementById('seconds').children[1].textContent = s2;
}

updateTimer();
setInterval(updateTimer, 1000);
// first clean
function clean() {
	const path = window.location.pathname;
	const pageName = path.split('/').pop();
	console.log('page name: ', pageName);
	if (!pageName) {
		localStorage.removeItem('cart');
		console.log('cleaned');
	}
}
clean();



addProductToCard();
outputCart();
outputCartTotal();
addProductToCardFromCatalog()

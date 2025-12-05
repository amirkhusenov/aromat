document.addEventListener("DOMContentLoaded", (event) => {
	const backButton = document.querySelector('.back-button');

	// ===== ОПРЕДЕЛЕНИЕ ПРОДУКТА И ЦЕН =====
	const productPrices = {
		'sauvage': {
			1: { current: 209, old: 518 },
			2: { current: 388, old: 1036 },
			3: { current: 537, old: 1554 }
		},
		'1million': {
			1: { current: 199, old: 439 },
			2: { current: 368, old: 878 },
			3: { current: 507, old: 1317 }
		},
		'aventus': {
			1: { current: 649, old: 1299 },
			2: { current: 1168, old: 2598 },
			3: { current: 1560, old: 3897 }
		}
	};

	function detectProduct() {
		const title = document.querySelector('.hero__title')?.textContent?.toLowerCase() || '';
		const url = window.location.pathname.toLowerCase();

		if (title.includes('million') || url.includes('aromat4')) {
			return '1million';
		}
		if (title.includes('aventus') || title.includes('creed') || url.includes('aromat2')) {
			return 'aventus';
		}
		return 'sauvage'; // default
	}

	const currentProduct = detectProduct();
	const prices = productPrices[currentProduct];

	// ===== ИНИЦИАЛИЗАЦИЯ ЦЕН ИЗ JS =====
	function initPricesFromJS() {
		if (!prices) return;

		const heroPriceNow = document.querySelector('.hero__price-now span');
		const heroPriceOld = document.querySelector('.hero__price-old span');
		if (heroPriceNow) heroPriceNow.textContent = prices[1].current;
		if (heroPriceOld) heroPriceOld.textContent = prices[1].old;

		const heroBtn = document.querySelector('.hero__btn.hero__btn--promocja');
		if (heroBtn) {
			heroBtn.innerHTML = `Kup teraz za ${prices[1].current} zł &nbsp;<span>${prices[1].old} zł</span>`;
		}

		const offerLabels = document.querySelectorAll('.offer-option');
		offerLabels.forEach(label => {
			const radio = label.querySelector('.offer-radio');
			if (!radio) return;

			const qty = parseInt(radio.value);
			const price = prices[qty];
			if (!price) return;

			const saved = price.old - price.current;
			const pricePerItem = qty > 1 ? Math.round(price.current / qty) : null;

			const discountEl = label.querySelector('.offer-discount');
			const currentEl = label.querySelector('.offer-price-current');
			const oldEl = label.querySelector('.offer-price-old');
			const subtextEl = label.querySelector('.offer-subtext');

			if (discountEl) discountEl.textContent = `Oszczędź ${saved} zł`;
			if (currentEl) currentEl.textContent = `${price.current} zł`;
			if (oldEl) oldEl.textContent = `${price.old} zł`;
			if (subtextEl && pricePerItem) subtextEl.textContent = `${pricePerItem} zł za sztukę`;
		});

		const cartTotalNow = document.querySelector('.cart__total-price-now');
		const cartTotalOld = document.querySelector('.cart__total-price-old span');
		if (cartTotalNow) cartTotalNow.textContent = prices[1].current;
		if (cartTotalOld) cartTotalOld.textContent = prices[1].old;

		const formPriceNow = document.querySelector('.order-form__price-now');
		const formPriceOld = document.querySelector('.order-form__price-old span');
		if (formPriceNow) formPriceNow.textContent = prices[1].current;
		if (formPriceOld) formPriceOld.textContent = prices[1].old;
	}

	// ===== SWIPER =====
	function updateBackButtonVisibility(index) {
		if (backButton) {
			backButton.style.display = index > 0 ? 'block' : 'none';
		}
	}

	const swiper = new Swiper('.clients__splide', {
		slidesPerView: 1.5,
		spaceBetween: 10,
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
			swiper.slideTo(index);
		});
	});

	if (backButton) {
		backButton.addEventListener('click', function () {
			if (swiper.activeIndex > 0) {
				swiper.slideTo(swiper.activeIndex - 1);
			}
		});
	}

	// ===== МАСКА ТЕЛЕФОНА =====
	function setCursorPosition(pos, elem) {
		elem.focus();
		if (elem.setSelectionRange) elem.setSelectionRange(pos, pos);
		else if (elem.createTextRange) {
			const range = elem.createTextRange();
			range.collapse(true);
			range.moveEnd("character", pos);
			range.moveStart("character", pos);
			range.select();
		}
	}

	function mask(event) {
		let matrix = "+48 ___ ___ ___",
			i = 0,
			def = matrix.replace(/\D/g, ""),
			val = this.value.replace(/\D/g, "");
		if (def.length >= val.length) val = def;
		this.value = matrix.replace(/./g, function (a) {
			return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a;
		});
		if (event.type === "blur") {
			if (this.value.length === 2) this.value = "";
		} else setCursorPosition(this.value.length, this);
	}

	const telInput = document.querySelector("#tel");
	if (telInput) {
		telInput.addEventListener("input", mask, false);
		telInput.addEventListener("focus", mask, false);
		telInput.addEventListener("blur", mask, false);
	}

	// ===== ВАЛИДАЦИЯ ФОРМЫ =====
	const form_ = document.querySelector('#order_form');
	const formButton = document.querySelector('#submitForm');
	const json = document.querySelector('#cartJson');
	const patternAdr = /[a-zA-Z0-9\s,.'-]+/;

	if (formButton && form_) {
		const phone = form_.querySelector("#tel");
		const adr = form_.querySelector("input[name='address']");

		formButton.addEventListener('click', function (e) {
			if (json) json.value = localStorage.getItem('cart');

			if (adr && !patternAdr.test(adr.value)) {
				adr.setCustomValidity('Proszę podać adres w formacie: ulica, dom i mieszkanie (jeśli istnieje).');
				adr.reportValidity();
				e.preventDefault();
			} else if (adr) {
				adr.setCustomValidity('');
			}

			if (phone) {
				let phoneValue = phone.value.replace(/\D/g, "");
				if (phoneValue.length < 11) {
					phone.setCustomValidity('Proszę wprowadzić prawidłowy numer telefonu.');
					phone.reportValidity();
					e.preventDefault();
				} else {
					phone.setCustomValidity('');
				}
			}
		});
	}

	// ===== РАСЧЕТ ДАТ ДОСТАВКИ =====
	const months = {
		0: 'stycznia',
		1: 'lutego',
		2: 'marca',
		3: 'kwietnia',
		4: 'maja',
		5: 'czerwca',
		6: 'lipca',
		7: 'sierpnia',
		8: 'września',
		9: 'października',
		10: 'listopada',
		11: 'grudnia',
	};

	function addDayToCurrentDate(days, today) {
		const currentDate = structuredClone(today);
		return new Date(currentDate.setDate(currentDate.getDate() + days));
	}

	function updateDeliveryDates() {
		const date_current = document.getElementById('date_current');
		const date_sent = document.getElementById('date_sent');
		const date_delivery = document.getElementById('date_delivery');

		if (!date_current || !date_sent || !date_delivery) return;

		const local = (new Date().toLocaleTimeString('us-US', { timeZone: "Europe/Warsaw" })).split(':')[0];
		const offset = local - (new Date().toTimeString()).split(':')[0];
		const today = new Date();
		const month_t = today.getMonth();
		const date_t = today.getDate();
		const day_week_t = today.getDay();
		const hours_t = today.getHours() + offset;
		const month_t_pl = months[month_t];
		const day_plus_1 = addDayToCurrentDate(1, today);
		const day_plus_2 = addDayToCurrentDate(2, today);
		const day_plus_3 = addDayToCurrentDate(3, today);
		const day_plus_4 = addDayToCurrentDate(4, today);
		const day_plus_5 = addDayToCurrentDate(5, today);

		date_current.innerHTML = date_t + ' ' + month_t_pl;

		if (hours_t < 17 && (day_week_t !== 6 && day_week_t !== 0)) {
			date_sent.innerHTML = date_t + ' ' + month_t_pl;
		}
		if (hours_t >= 17 && (day_week_t !== 6 && day_week_t !== 0 && day_week_t !== 5)) {
			date_sent.innerHTML = day_plus_1.getDate() + ' ' + months[day_plus_1.getMonth()];
		}
		if (hours_t >= 17 && (day_week_t === 5)) {
			date_sent.innerHTML = day_plus_3.getDate() + ' ' + months[day_plus_3.getMonth()];
			date_delivery.innerHTML = day_plus_4.getDate() + ' ' + (months[day_plus_4.getMonth()]).slice(0, 3) + ' - ' + day_plus_5.getDate() + ' ' + (months[day_plus_5.getMonth()]).slice(0, 3);
		}
		if (day_week_t === 6) {
			date_sent.innerHTML = day_plus_2.getDate() + ' ' + months[day_plus_2.getMonth()];
			date_delivery.innerHTML = day_plus_3.getDate() + ' ' + (months[day_plus_3.getMonth()]).slice(0, 3) + ' - ' + day_plus_4.getDate() + ' ' + (months[day_plus_4.getMonth()]).slice(0, 3);
		}
		if (day_week_t === 0) {
			date_sent.innerHTML = day_plus_1.getDate() + ' ' + months[day_plus_1.getMonth()];
			date_delivery.innerHTML = day_plus_2.getDate() + ' ' + (months[day_plus_2.getMonth()]).slice(0, 3) + ' - ' + day_plus_3.getDate() + ' ' + (months[day_plus_3.getMonth()]).slice(0, 3);
		}
		if (hours_t < 17 && day_week_t === 4) {
			date_delivery.innerHTML = day_plus_1.getDate() + ' ' + (months[day_plus_1.getMonth()]).slice(0, 3) + ' - ' + day_plus_4.getDate() + ' ' + (months[day_plus_4.getMonth()]).slice(0, 3);
		}
		if (hours_t >= 17 && day_week_t === 4) {
			date_delivery.innerHTML = day_plus_4.getDate() + ' ' + (months[day_plus_4.getMonth()]).slice(0, 3) + ' - ' + day_plus_5.getDate() + ' ' + (months[day_plus_5.getMonth()]).slice(0, 3);
		}
		if (hours_t < 17 && day_week_t !== 4 && day_week_t !== 5 && day_week_t !== 6 && day_week_t !== 0) {
			date_delivery.innerHTML = day_plus_1.getDate() + ' ' + (months[day_plus_1.getMonth()]).slice(0, 3) + ' - ' + day_plus_2.getDate() + ' ' + (months[day_plus_2.getMonth()]).slice(0, 3);
		}
		if (hours_t < 17 && (day_week_t === 5)) {
			date_delivery.innerHTML = day_plus_3.getDate() + ' ' + (months[day_plus_3.getMonth()]).slice(0, 3) + ' - ' + day_plus_4.getDate() + ' ' + (months[day_plus_4.getMonth()]).slice(0, 3);
		}
		if (hours_t >= 17 && (day_week_t === 1 || day_week_t === 2 || day_week_t === 3)) {
			date_delivery.innerHTML = day_plus_2.getDate() + ' ' + (months[day_plus_2.getMonth()]).slice(0, 3) + ' - ' + day_plus_3.getDate() + ' ' + (months[day_plus_3.getMonth()]).slice(0, 3);
		}
	}

	updateDeliveryDates();

	// ===== КОРЗИНА =====
	function addProductToCard() {
		const img = document.querySelector('.hero__img')?.src;
		const name = document.querySelector('.hero__title')?.textContent;
		const priceNow = document.querySelector('.hero__price-now span')?.textContent;
		const priceOld = document.querySelector('.hero__price-old span')?.textContent;
		const size = 100;
		const qty = 1;

		if (!img || !name) return;

		const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

		if (checkNameExists(cart, name)) {
			return;
		}

		cart.unshift({ img, name, priceNow, priceOld, size, qty });
		localStorage.setItem('cart', JSON.stringify(cart));
		outputCart();
	}

	function addProductToCart() {
		const img = document.querySelector('.hero__img')?.src;
		const name = document.querySelector('.hero__title')?.textContent;
		const priceNow = document.querySelector('.hero__price-now span')?.textContent;
		const priceOld = document.querySelector('.hero__price-old span')?.textContent;
		const size = 100;

		if (!img || !name) return;

		const selectedRadio = document.querySelector('.offer-radio:checked');
		const qty = selectedRadio ? parseInt(selectedRadio.value) : 1;

		let cart = JSON.parse(localStorage.getItem('cart') || '[]');

		const existing = cart.find(item => item.name === name);
		if (existing) return;

		cart.unshift({ img, name, priceNow, priceOld, size, qty });
		localStorage.setItem('cart', JSON.stringify(cart));
		outputCart();
	}

	function plusProduct(name) {
		const cart = JSON.parse(localStorage.getItem('cart') || '[]');

		const item = cart.find(i => i.name === name);
		if (item && item.qty < 3) {
			item.qty += 1;
			localStorage.setItem('cart', JSON.stringify(cart));
			outputCart();
		}
	}

	function minusProduct(name) {
		const cart = JSON.parse(localStorage.getItem('cart') || '[]');

		const item = cart.find(i => i.name === name);
		if (item && item.qty > 1) {
			item.qty -= 1;
			localStorage.setItem('cart', JSON.stringify(cart));
			outputCart();
		}
	}

	function updateCartQtyFromRadio(qty) {
		const name = document.querySelector('.hero__title')?.textContent;
		if (!name) return;

		let cart = JSON.parse(localStorage.getItem('cart') || '[]');
		cart = cart.map(item => {
			if (item.name === name) item.qty = qty;
			return item;
		});
		localStorage.setItem('cart', JSON.stringify(cart));
		outputCart();
	}

	function updateOfferUI(qty) {
		const radios = document.querySelectorAll('input[name="offer"]');
		const promoBtn = document.getElementById('submitForm');
		const offerValue = String(qty);

		const cartOldPrice = document.getElementById('cartOldPrice');
		const cartNewPrice = document.getElementById('cartNewPrice');
		const cartQuantity = document.getElementById('cartQuantity');
		const __cartName = document.querySelector('.hero__title')?.textContent;
		const cartName = document.getElementById('cartName');

		radios.forEach(r => {
			const label = r.closest('label');
			r.checked = r.value === offerValue;
			if (label) label.classList.toggle('offer-option--selected', r.checked);
		});

		const price = prices[qty];
		if (!price) return;

		const priceNow = String(price.current);
		const priceOld = String(price.old);
		const saved = price.old - price.current;
		const rabatText = `oszczędź ${saved} zł`;

		if (cartNewPrice) cartNewPrice.value = priceNow;
		if (cartOldPrice) cartOldPrice.value = priceOld;
		if (cartQuantity) cartQuantity.value = qty;
		if (cartName && __cartName) cartName.value = __cartName;

		if (promoBtn) {
			promoBtn.setAttribute('data-rabat', rabatText);
			const priceNowEl = promoBtn.querySelector('.order-form__price-now');
			const priceOldEl = promoBtn.querySelector('.order-form__price-old span');
			if (priceNowEl) priceNowEl.textContent = priceNow;
			if (priceOldEl) priceOldEl.textContent = priceOld;
		}
	}

	function outputCart() {
		const cartList = document.querySelector('.cart__list');
		if (!cartList) return;

		cartList.innerHTML = '';

		const cart = JSON.parse(localStorage.getItem('cart') || '[]');

		let totalNow = 0;
		let totalOld = 0;

		cart.forEach(item => {
			const qty = item.qty || 1;
			const price = prices[qty];

			let priceNow = price ? price.current : prices[1].current;
			let priceOld = price ? price.old : prices[1].old;

			totalNow += priceNow;
			totalOld += priceOld;

			const li = document.createElement('li');
			li.classList.add('cart__item');
			li.innerHTML = `
			<img src="${item.img}" alt="${item.name}" class="cart__item-img">
			<div class="cart__item-body">
				<h5 class="cart__item-title">${item.name}</h5>
				<div class="cart__item-info">
					<div class="cart__item-price">${priceNow} zł &nbsp; <span>${priceOld} zł</span></div>
					<div class="cart__item-size">${item.size} ml</div>
				</div>
				<div class="cart__item-amount">
					<button class="cart__item-minus">-</button>
					<div class="cart__item-count">
						<span class="cart__item-count-number">${qty}</span>
						&nbsp; szt
					</div>
					<button class="cart__item-plus">+</button>
				</div>
			</div>
		`;

			li.querySelector('.cart__item-minus').addEventListener('click', () => minusProduct(item.name));
			li.querySelector('.cart__item-plus').addEventListener('click', () => plusProduct(item.name));

			cartList.append(li);
			updateOfferUI(qty);
		});

		const cartTotalNow = document.querySelector('.cart__total-price-now');
		const cartTotalOld = document.querySelector('.cart__total-price-old span');
		if (cartTotalNow) cartTotalNow.textContent = totalNow;
		if (cartTotalOld) cartTotalOld.textContent = totalOld;
	}

	function initRadioEvents() {
		const radios = document.querySelectorAll('.offer-radio');
		const labels = document.querySelectorAll('.offer-option');

		// Обработка клика на label
		labels.forEach(label => {
			label.addEventListener('click', (e) => {
				const radio = label.querySelector('.offer-radio');
				if (radio && !radio.checked) {
					radio.checked = true;
					radio.dispatchEvent(new Event('change', { bubbles: true }));
				}
			});
		});

		// Обработка изменения radio
		radios.forEach(radio => {
			radio.addEventListener('change', () => {
				const selectedQty = parseInt(radio.value);

				labels.forEach(label => label.classList.remove('offer-option--selected'));

				const label = radio.closest('label');
				if (label) label.classList.add('offer-option--selected');

				updateCartQtyFromRadio(selectedQty);
				updateOfferUI(selectedQty);
			});
		});
	}

	function outputCartTotal() {
		const cartTotalPriceNow = document.querySelector('.cart__total-price-now');
		const cartTotalPriceOld = document.querySelector('.cart__total-price-old span');
		const formPriceNow = document.querySelector('.order-form__price-now');
		const formPriceOld = document.querySelector('.order-form__price-old span');

		const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

		let totalNow = 0;
		let totalOld = 0;

		cart.forEach(item => {
			const qty = item.qty || 1;
			const price = prices[qty];
			if (price) {
				totalNow += price.current;
				totalOld += price.old;
			}
		});

		if (cartTotalPriceNow) cartTotalPriceNow.textContent = totalNow;
		if (cartTotalPriceOld) cartTotalPriceOld.textContent = totalOld;
		if (formPriceNow) formPriceNow.textContent = totalNow;
		if (formPriceOld) formPriceOld.textContent = totalOld;
	}

	function addProductToCardFromCatalog() {
		const buttons = document.querySelectorAll('.catalog__card-btn');

		buttons.forEach(button => {
			button.addEventListener('click', function (e) {
				const catalogCard = e.target.closest('.catalog__card');

				if (catalogCard) {
					const linkElement = catalogCard.querySelector('a');

					if (linkElement) {
						const href = linkElement.getAttribute('href');
						const img = catalogCard.querySelector('.catalog__card-img')?.src;
						const name = catalogCard.querySelector('.catalog__card-title')?.getAttribute('data-name');
						const size = 100;
						const priceNow = catalogCard.querySelector('.catalog__card-price--now')?.textContent;
						const priceOld = catalogCard.querySelector('.catalog__card-price--old')?.textContent;
						const qty = 1;

						const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

						if (checkNameExists(cart, name)) {
							return;
						}
						cart.push({ img, name, priceNow, priceOld, size, qty });
						localStorage.setItem('cart', JSON.stringify(cart));
						outputCart();
					}
				}
			});
		});
	}

	function checkNameExists(itemsArray, searchName) {
		if (!Array.isArray(itemsArray) || !searchName) return false;

		const normalize = (str) => {
			return str
				.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
				.toLowerCase()
				.replace(/[^\w\s]/g, ' ')
				.replace(/\b\d+\s*(ml|g|kg)\b/g, '')
				.replace(/\s+/g, ' ')
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
				return a.includes(b) || b.includes(a);
			};
			return searchWords.every(word =>
				itemName.split(/\s+/).some(itemWord => similarity(itemWord, word))
			);
		});
	}

	// ===== ТАЙМЕРЫ =====
	function refreshCountdown() {
		const offerTimer = document.getElementById('offer-timer');
		if (!offerTimer) return;

		const now = new Date();
		const midnight = new Date();
		midnight.setHours(24, 0, 0, 0);
		const diff = midnight - now;

		const h = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0');
		const m = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
		const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

		offerTimer.textContent = `${h}:${m}:${s}`;
	}

	function updateTimer() {
		const hoursEl = document.getElementById('hours');
		const minutesEl = document.getElementById('minutes');
		const secondsEl = document.getElementById('seconds');

		if (!hoursEl || !minutesEl || !secondsEl) return;

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

		if (hoursEl.children[0]) hoursEl.children[0].textContent = h1;
		if (hoursEl.children[1]) hoursEl.children[1].textContent = h2;
		if (minutesEl.children[0]) minutesEl.children[0].textContent = m1;
		if (minutesEl.children[1]) minutesEl.children[1].textContent = m2;
		if (secondsEl.children[0]) secondsEl.children[0].textContent = s1;
		if (secondsEl.children[1]) secondsEl.children[1].textContent = s2;
	}

	refreshCountdown();
	setInterval(refreshCountdown, 1000);

	updateTimer();
	setInterval(updateTimer, 1000);

	// ===== ОЧИСТКА КОРЗИНЫ =====
	function clean() {
		const path = window.location.pathname;
		const pageName = path.split('/').pop();
		if (!pageName) {
			localStorage.removeItem('cart');
		}
	}
	clean();

	// ===== ИНИЦИАЛИЗАЦИЯ =====
	initPricesFromJS();
	addProductToCard();
	outputCart();
	outputCartTotal();
	addProductToCardFromCatalog();
	initRadioEvents();
});

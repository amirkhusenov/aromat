// function syncRadioWithQty(qty) {
// 	const radios = document.querySelectorAll('input[name="offer"]');
// 	const promoBtn = document.getElementById('submitForm');
// 	const offerValue = String(qty);

// 	radios.forEach(r => {
// 		const label = r.closest('label');

// 		r.checked = r.value === offerValue;

// 		if (r.checked) {
// 			label.classList.add('offer-option--selected');
// 		} else {
// 			label.classList.remove('offer-option--selected');
// 		}
// 	});

// 	let rabatText = '';
// 	let priceNow = '';
// 	let priceOld = '';

// 	switch (offerValue) {
// 		case '1':
// 			rabatText = 'oszczędź 270 zł';
// 			priceNow = '239';
// 			priceOld = '509';
// 			break;
// 		case '2':
// 			rabatText = 'oszczędź 570 zł';
// 			priceNow = '438';
// 			priceOld = '1018';
// 			break;
// 		case '3':
// 			rabatText = 'oszczędź 930 zł';
// 			priceNow = '597';
// 			priceOld = '1527';
// 			break;
// 		default:
// 			return;
// 	}

// 	promoBtn.setAttribute('data-rabat', rabatText);
// 	promoBtn.querySelector('.order-form__price-now').textContent = priceNow;
// 	promoBtn.querySelector('.order-form__price-old span').textContent = priceOld;

// 	localStorage.setItem('selectedOffer', offerValue);
// }


// function outputCart() {
// 	const cartList = document.querySelector('.cart__list');
// 	cartList.innerHTML = '';

// 	const cart = JSON.parse(localStorage.getItem('cart') || '[]');

// 	cart.forEach(item => {
// 		const priceNow = item.priceNow;
// 		const priceOld = item.priceOld;

// 		const li = document.createElement('li');
// 		li.classList.add('cart__item');
// 		li.innerHTML = `
// 		<img src="${item.img}" alt="${item.name}" class="cart__item-img">
// 		<div class="cart__item-body">
// 			<h5 class="cart__item-title">${item.name}</h5>
// 			<div class="cart__item-info">
// 				<div class="cart__item-price">${priceNow} zł &nbsp; <span>${priceOld} zł</span></div>
// 				<div class="cart__item-size">${item.size} ml</div>
// 			</div>
// 			<div class="cart__item-amount">
// 				<button class="cart__item-minus">-</button>
// 				<div class="cart__item-count">
// 					<span class="cart__item-count-number">${item.qty}</span>
// 					&nbsp; szt
// 				</div>
// 				<button class="cart__item-plus">+</button>
// 			</div>
// 		</div>
// 	`;

// 		li.querySelector('.cart__item-minus').addEventListener('click', () => minusProduct(item.name));
// 		li.querySelector('.cart__item-plus').addEventListener('click', () => plusProduct(item.name));

// 		cartList.append(li);

// 		syncRadioWithQty(item.qty);
// 	});

// 	outputCartTotal();
// }


// function outputCart() {
// 	const cartList = document.querySelector('.cart__list');
// 	cartList.innerHTML = '';

// 	const cart = JSON.parse(localStorage.getItem('cart') || '[]');
// 	cart.forEach(item => {
// 		let priceNow = 0;
// 		let priceOld = 0;

// 		if (item.qty === 1) {
// 			priceNow = 239;
// 			priceOld = 509;
// 		} else if (item.qty === 2) {
// 			priceNow = 219 * 2;
// 			priceOld = 509 * 2;
// 		} else if (item.qty === 3) {
// 			priceNow = 199 * 3;
// 			priceOld = 509 * 3;
// 		}

// 		const li = document.createElement('li');
// 		li.classList.add('cart__item');
// 		li.innerHTML = `
// 		<img src="${item.img}" alt="${item.name}" class="cart__item-img">
// 		<div class="cart__item-body">
// 			<h5 class="cart__item-title">${item.name}</h5>
// 			<div class="cart__item-info">
// 				<div class="cart__item-price">${priceNow} zł &nbsp; <span>${priceOld} zł</span></div>
// 				<div class="cart__item-size">${item.size} ml</div>
// 			</div>
// 			<div class="cart__item-amount">
// 				<button class="cart__item-minus">-</button>
// 				<div class="cart__item-count">
// 					<span class="cart__item-count-number">${item.qty}</span>
// 					&nbsp; szt
// 				</div>
// 				<button class="cart__item-plus">+</button>
// 			</div>
// 		</div>
// 	`;

// 		li.querySelector('.cart__item-minus').addEventListener('click', () => minusProduct(item.name));
// 		li.querySelector('.cart__item-plus').addEventListener('click', () => plusProduct(item.name));

// 		cartList.append(li);

// 		syncRadioWithQty(item.qty);
// 	});

// 	outputCartTotal();
// }

// function outputCartTotal() {
// 	const cart = JSON.parse(localStorage.getItem('cart') || '[]');
// 	let totalNow = 0;
// 	let totalOld = 0;

// 	cart.forEach(item => {
// 		totalNow += parseFloat(item.priceNow.replace(',', '.')) * item.qty;
// 		totalOld += parseFloat(item.priceOld.replace(',', '.')) * item.qty;
// 	});

// 	document.querySelector('.cart__total-price-now').textContent = totalNow.toFixed(2).replace('.', ',');
// 	document.querySelector('.cart__total-price-old span').textContent = totalOld.toFixed(2).replace('.', ',');
// }
// function outputCart() {
// 	const cartList = document.querySelector('.cart__list');
// 	cartList.innerHTML = '';

// 	const cart = JSON.parse(localStorage.getItem('cart') || '[]');

// 	cart.forEach(item => {
// 		let priceNow = 0;
// 		let priceOld = 0;

// 		if (item.qty === 1) {
// 			priceNow = 239;
// 			priceOld = 509;
// 		} else if (item.qty === 2) {
// 			priceNow = 219 * 2;
// 			priceOld = 509 * 2;
// 		} else if (item.qty === 3) {
// 			priceNow = 199 * 3;
// 			priceOld = 509 * 3;
// 		}

// 		const li = document.createElement('li');
// 		li.classList.add('cart__item');
// 		li.innerHTML = `
// 		<img src="${item.img}" alt="${item.name}" class="cart__item-img">
// 		<div class="cart__item-body">
// 			<h5 class="cart__item-title">${item.name}</h5>
// 			<div class="cart__item-info">
// 				<div class="cart__item-price">${priceNow} zł &nbsp; <span>${priceOld} zł</span></div>
// 				<div class="cart__item-size">${item.size} ml</div>
// 			</div>
// 			<div class="cart__item-amount">
// 				<button class="cart__item-minus">-</button>
// 				<div class="cart__item-count">
// 					<span class="cart__item-count-number">${item.qty}</span>
// 					&nbsp; szt
// 				</div>
// 				<button class="cart__item-plus">+</button>
// 			</div>
// 		</div>
// 	`;

// 		li.querySelector('.cart__item-minus').addEventListener('click', () => minusProduct(item.name));
// 		li.querySelector('.cart__item-plus').addEventListener('click', () => plusProduct(item.name));

// 		cartList.append(li);

// 		syncRadioWithQty(item.qty);
// 	});

// 	outputCartTotal();
// }


// function outputCartTotal() {
// 	const cart = JSON.parse(localStorage.getItem('cart') || '[]');
// 	let totalNow = 0;
// 	let totalOld = 0;

// 	cart.forEach(item => {
// 		totalNow += item.priceNow;
// 		totalOld += item.priceOld;
// 	});

// 	document.querySelector('.cart__total-price-now').textContent = totalNow + ' zł';
// 	document.querySelector('.cart__total-price-old span').textContent = totalOld + ' zł';
// }
// function outputCartTotal() {
// 	const cart = JSON.parse(localStorage.getItem('cart') || '[]');

// 	cart.forEach(item => {
// 		let priceNow = 0;
// 		let priceOld = 0;

// 		if (item.qty === 1) {
// 			priceNow = 239;
// 			priceOld = 509;
// 		} else if (item.qty === 2) {
// 			priceNow = 219 * 2;
// 			priceOld = 509 * 2;
// 		} else if (item.qty === 3) {
// 			priceNow = 199 * 3;
// 			priceOld = 509 * 3;
// 		}

// 		totalNow += priceNow;
// 		totalOld += priceOld;
// 	});

// 	document.querySelector('.cart__total-price-now').textContent = priceNow + ' zł';
// 	document.querySelector('.cart__total-price-old span').textContent = priceOld + ' zł';
// }
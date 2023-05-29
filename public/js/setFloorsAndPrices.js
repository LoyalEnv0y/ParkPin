const createElement = (name, classes, attributes, innerText = '') => {
	element = document.createElement(`${name}`);

	classes.forEach(cls => {
		element.classList.add(`${cls}`);
	});

	for (const [key, value] of Object.entries(attributes)) {
		element.setAttribute(`${key}`, `${value}`);
	}

	if (innerText) element.innerText = innerText;

	return element;
}

// FLOORS

const floorSlotArea = document.querySelector('.floor-slot-area');
const addFloorBtn = document.querySelector('#add-floor-btn');
let floorSets = document.querySelectorAll('.floor-set');

floorSlotArea.addEventListener('click', e => {
	if (e.target.classList.contains('delete-btn')) {

		const deleteBtn = e.target;
		const floorContainer = deleteBtn.closest('.floor-set');

		floorContainer.remove();

		floorSets = document.querySelectorAll('.floor-set');
		updateFloorNumbers(floorSets);
	}
});

addFloorBtn.addEventListener('click', () => {
	floorSets = document.querySelectorAll('.floor-set');

	// Last slotInput's index
	const lastReference = updateFloorNumbers(floorSets);

	const newFloorDiv = createElement(
		'div',
		['floor-set'],
		{ id: `floor-${lastReference}` }
	);

	const newFloorLabel = createElement(
		'label',
		['form-label'],
		{ for: `floor-input-${lastReference}` },
		`${lastReference + 1}. Floor:`
	);

	const newInputGroup = createElement(
		'div',
		['input-group', 'mb-3'],
		{},
	);

	const newSlotText = createElement(
		'span',
		['input-group-text'],
		{},
		'Number of Slots:'
	);

	const newSlotInput = createElement(
		'input',
		['form-control', 'slot-input'],
		{
			type: 'number',
			name: `parkingLot[floors][]`,
			id: `floor-input-${lastReference}`
		},
	);
	newSlotInput.required = true;

	const closeBtn = createElement(
		'button',
		['btn', 'btn-danger', 'delete-btn'],
		{ type: 'button', 'data-close': `floor-${lastReference}` },
		'X'
	);

	newInputGroup.append(newSlotText);
	newInputGroup.append(newSlotInput);
	newInputGroup.append(closeBtn);

	newFloorDiv.append(newFloorLabel);
	newFloorDiv.append(newInputGroup);

	addFloorBtn.before(newFloorDiv)
});

const updateFloorNumbers = (floorSets) => {
	let lastReference = 0;

	for (let i = 0; i < floorSets.length; i++) {
		const currFloor = floorSets[i];
		currFloor.setAttribute('id', `floor-${i}`);

		const label = currFloor.querySelector('label');
		label.setAttribute('for', `floor-input-${i}`);
		label.innerText = `${i + 1}. Floor:`

		const slotInput = currFloor.querySelector('.slot-input');
		slotInput.setAttribute('id', `floor-input-${i}`);

		const deleteBtn = currFloor.querySelector('.delete-btn');
		deleteBtn.setAttribute('data-close', `floor-${i}`);

		lastReference++;
	}

	return lastReference;
}

// Prices

const pricePairArea = document.querySelector('.price-pair-area');
const addPriceBtn = document.querySelector('#add-price-btn');
let priceSets = document.querySelectorAll('.price-set');

pricePairArea.addEventListener('click', e => {
	if (e.target.classList.contains('delete-btn')) {

		const deleteBtn = e.target;
		const priceContainer = deleteBtn.closest('.price-set');

		priceContainer.remove();

		priceSets = document.querySelectorAll('.price-set');
		updatePriceNumbers(priceSets);
	}
});

addPriceBtn.addEventListener('click', () => {
	priceSets = document.querySelectorAll('.price-set');

	// Last slotInput's index
	const lastReference = updatePriceNumbers(priceSets);

	const newPriceDiv = createElement(
		'div',
		['price-set'],
		{ id: `price-${lastReference}` }
	);

	const newLabel = createElement(
		'label',
		['form-label'],
		{ for: `price-input-${lastReference}` },
		`${lastReference + 1}. Price Pair:`
	);

	const newInputGroup = createElement(
		'div',
		['input-group', 'mb-3'],
		{}
	);

	const newStartText = createElement(
		'span',
		['input-group-text'],
		{},
		'Starting Hour:'
	);

	const newStartInput = createElement(
		'input',
		['form-control', 'price-start-input'],
		{
			type: 'number',
			name: `parkingLot[startHours][]`,
			id: `price-input-${lastReference}`
		}
	);
	newStartInput.required = true;

	const newEndText = createElement(
		'span',
		['input-group-text'],
		{},
		'Ending Hour:'
	);

	const newEndInput = createElement(
		'input',
		['form-control', 'price-end-input'],
		{ type: 'number', name: `parkingLot[endHours][]` },
	);
	newEndInput.required = true;

	const newPriceText = createElement(
		'span',
		['input-group-text'],
		{},
		'Price:'
	);

	const newPriceInput = createElement(
		'input',
		['form-control', 'price-input'],
		{ type: 'number', name: `parkingLot[prices][]` },
	);
	newPriceInput.required = true;

	const closeBtn = createElement(
		'button',
		['btn', 'btn-danger', 'delete-btn'],
		{ type: 'button', 'data-close': `price-${lastReference}` },
		'X'
	);

	newInputGroup.append(newStartText);
	newInputGroup.append(newStartInput);
	newInputGroup.append(newEndText);
	newInputGroup.append(newEndInput);
	newInputGroup.append(newPriceText);
	newInputGroup.append(newPriceInput);
	newInputGroup.append(closeBtn);

	newPriceDiv.append(newLabel);
	newPriceDiv.append(newInputGroup);

	addPriceBtn.before(newPriceDiv)
});

const updatePriceNumbers = (priceSets) => {
	let lastReference = 0;

	for (let i = 0; i < priceSets.length; i++) {
		const currPrice = priceSets[i];
		currPrice.setAttribute('id', `price-${i}`);

		const label = currPrice.querySelector('label');
		label.setAttribute('for', `price-input-${i}`);
		label.innerText = `${i + 1}. Price Pair:`

		const startInput = currPrice.querySelector('.price-start-input');
		startInput.setAttribute('id', `price-input-${i}`);

		const deleteBtn = currPrice.querySelector('.delete-btn');
		deleteBtn.setAttribute('data-close', `price-${i}`);

		lastReference++;
	}

	return lastReference;
}
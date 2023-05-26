const slotsDisplay = document.querySelector('.slots-display');

const floorButtons = document.querySelectorAll('.floor-button');
let slotButtons = document.querySelectorAll('.slot-button');

let reserveForm = document.querySelector('#reserve-form');

let selectedSlotId = '';
let selectedFloorId = '';

reserveForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const additionalInput = document.createElement("input");
    additionalInput.setAttribute("type", "hidden");
    additionalInput.setAttribute("name", "reservation[slotId]");
    additionalInput.setAttribute("value", selectedSlotId);

	reserveForm.appendChild(additionalInput);

	reserveForm.submit();
});

const setSlotButtons = () => {
	slotButtons = document.querySelectorAll('.slot-button');

	slotButtons.forEach((btn) => {
		btn.addEventListener('click', () => {
			selectedSlotId = btn.getAttribute('data-slot-id');
		})
	})
}
setSlotButtons();

floorButtons.forEach(btn => {
	btn.addEventListener('click', async () => {
		const newFloorId = btn.getAttribute('data-floor-id');
		if (selectedFloorId == newFloorId) return;

		selectedFloorId = btn.getAttribute('data-floor-id');

		const selectedFloor = await findFloor()
		renderSelectedFloor(selectedFloor);
		setSlotButtons();
	});
});

const findFloor = async () => {
	try {
		const URL = `http://localhost:3000/data/findFloorById/${selectedFloorId}`;
		const resp = await fetch(URL);
		const floor = await resp.json();

		if (!resp.ok) {
			console.log('Error catching floor data');
			return;
		}

		return floor;
	} catch (err) {
		console.log(err);
	}
}

const renderSelectedFloor = (selectedFloor) => {
	const newSlots = selectedFloor.slots;

	for (let i = 0; i < newSlots.length; i++) {
		const curSlot = newSlots[i];
		slotButtons.forEach(button => button.remove());

		const newLotButton = document.createElement('button');
		newLotButton.classList.add('slot-button');
		newLotButton.setAttribute('type', 'button');
		newLotButton.setAttribute('data-slot-id', curSlot._id);
		newLotButton.disabled = curSlot.isFull

		const newSlotDiv = document.createElement('div');
		newSlotDiv.classList
			.add('slot', (curSlot.isFull) ? 'unavailable' : 'available')

		const newSlotNumSpan = document.createElement('span');
		newSlotNumSpan.classList.add('slot-num');
		newSlotNumSpan.innerText = (i + 1);

		newSlotDiv.appendChild(newSlotNumSpan);
		newLotButton.appendChild(newSlotDiv);
		slotsDisplay.appendChild(newLotButton);
	}
}
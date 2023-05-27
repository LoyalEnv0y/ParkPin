const slotsDisplay = document.querySelector('.slots-display');

let slotButtons = document.querySelectorAll('.slot-button');
const floorButtons = document.querySelectorAll('.floor-button');

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
			slotButtons.forEach((btn) => {
				btn.classList.remove('selected-button');
			});
		
			selectedSlotId = btn.getAttribute('data-slot-id');
			btn.classList.add('selected-button');
		})
	})
}
setSlotButtons();

floorButtons.forEach(btn => {
	btn.addEventListener('click', async () => {
		floorButtons.forEach((btn) => {
			btn.classList.remove('selected-button');
		});
		btn.classList.add('selected-button');

		const newFloorId = btn.getAttribute('data-floor-id');
		if (selectedFloorId == newFloorId) return;

		selectedFloorId = newFloorId;
		
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
		newLotButton.classList.add(
			'slot-button',
			'slot', (curSlot.isFull) ? 'unavailable' : 'available'
		);
		newLotButton.setAttribute('type', 'button');
		newLotButton.setAttribute('data-slot-id', curSlot._id);
		newLotButton.disabled = curSlot.isFull
		newLotButton.innerText = (i + 1);

		slotsDisplay.appendChild(newLotButton);
	}
}
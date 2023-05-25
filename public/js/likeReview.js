// Attach event listener to all like buttons
const likeButtons = document.querySelectorAll('.like-button');

likeButtons.forEach(button => {
	button.addEventListener('click', () => {
		const parkingLotId = button.getAttribute('data-parkingLot-id');
		const reviewId = button.getAttribute('data-review-id');
		const userId = button.getAttribute('data-user-id');

		likeReview(parkingLotId, userId, reviewId);
	});
});

// Function to send like request and update UI
const likeReview = async (parkingLotId, userId, reviewId) => {
	const isLiked = await checkAlreadyLiked(userId, reviewId);

	const URL = `/parkingLots/${parkingLotId}/reviews/${reviewId}/like`;
	const reqOpts = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			userId,
			liked: isLiked
		})
	};

	try {
		const resp = await fetch(URL, reqOpts);

		if (resp.ok) {
			const likeCount = document.querySelector(`.review-${reviewId}`)
				.querySelector('span');

			const currentLikes = parseInt(likeCount.textContent);

			if (isLiked) {
				likeCount.textContent = currentLikes - 1;
			} else {
				likeCount.textContent = currentLikes + 1;
			}

		} else {
			console.error('Like request failed.');
		}
	} catch (err) {
		console.error('Error in like request:', err);
	}
}

const checkAlreadyLiked = async (userId, reviewId) => {
	const URL = `http://localhost:3000/data/reviewLikeCheck`;
	const reqOpts = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			userId, reviewId
		})
	}

	try {
		const reviewIsLikedRaw = await fetch(URL, reqOpts);
		const reviewIsLiked = await reviewIsLikedRaw.json();

		return reviewIsLiked.liked;
	} catch (err) {
		console.error('Error in isLiked check:', err);
	}
}
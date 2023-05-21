module.exports.renderIndex = (req, res) => {
	res.render('cars/index', { title: 'ParkPin | Your Cars' });
}

module.exports.renderNew = (req, res) => {
	res.render('cars/new', { title: 'ParkPin | Add a Car' })
}
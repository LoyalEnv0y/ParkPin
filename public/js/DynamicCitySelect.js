console.log("Test");
fetch('https://parkpin-roq4.onrender.com/data/citiesAndProvinces')
    .then(data => data.json())
    .then(data => listProvinces(data))
    .catch(err => console.log('Error', err))

const citySelect = document.querySelector('#city');
const provinceSelect = document.querySelector('#province');

const listProvinces = data => {
    citySelect.addEventListener('change', () => {
        provinceSelect.innerHTML = "";
        const selectedCity = citySelect.value;

        data[selectedCity].forEach(province => {
            const newOption = document.createElement('option')
            newOption.value = province;
            newOption.innerHTML = province;

            provinceSelect.add(newOption)
        });
    });
}
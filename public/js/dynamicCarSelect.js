fetch('/carBrandsAndModels')
    .then(data => data.json())
    .then(data => listProvinces(data))
    .catch(err => console.log('Error', err))

const brandSelect = document.querySelector('#brand');
const modelSelect = document.querySelector('#model');

const listProvinces = data => {
    brandSelect.addEventListener('change', () => {
        modelSelect.innerHTML = "";
        const selectedBrand = brandSelect.value;

        data[selectedBrand].forEach(model => {
            const newOption = document.createElement('option')
            newOption.value = model;
            newOption.innerHTML = model;

            modelSelect.add(newOption)
        });
    });
}


/*
I cannot import the CitiesAndProvinces.json file from the seeds directory to
here. I have tried doing it with fetch, and import. I have tried to making
the json file a js file and importing the object but none of them have worked. 

When I try to access anything outside of this file it tries to access it inside
the URL. For example when I write fetch('../../seeds/CitiesAndProvinces.json')
it throws an error inside the browser saying;
GET http://localhost:3000/seeds/CitiesAndProvinces.json 404 (Not Found)
I just don't know how to tell the JS file to look inside the seeds folder
rather then the server so I had to bring a copy of that object to this file.

If you see this and know how to fix it Please help me.
*/


fetch('/citiesAndProvinces')
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


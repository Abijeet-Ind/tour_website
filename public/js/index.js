/* eslint-disable */
import '@babel/polyfill';
import { login } from './login';
// import { displayMap } from './mapbox';

// DOM element
// const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');

// // Delegation
// if (mapBox) {
//   const location = JSON.parse(mapBox.dataset.locations);
//   displayMap(location);
// }

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // this will protect page from re-loading site

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

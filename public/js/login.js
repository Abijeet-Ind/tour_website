import axios from 'axios';
import { showAlert } from './alert';

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  login(email, password)

})



const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'sucess') {
      alert( 'logged in sucessfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    // showAlert('error', err.response.data.message);
    console.log('error', err);

  }
};

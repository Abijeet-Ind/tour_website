export const hideAlert = () => {
  const el = docuement.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}"> ${msg} </div>`;
  document.querySelector('body').insertAdjacentElement('afterBegin', markup);
  window.setTimeout(hideAlert, 5000);
};

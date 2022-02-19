
const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    const productElement = btn.closest('article');

    fetch('/admin/product/' + prodId, {
        method: 'delete',
        headers: {
            'csrf-token': csrf
        }
    })
        .then(response => {
            return response.json();
        })
        .then(result => {
            console.log(result);
            productElement.parentNode.removeChild(productElement);
        })
        .catch()
}

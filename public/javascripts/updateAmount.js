const amount = document.querySelectorAll('#amount');
const amountForm = document.querySelectorAll('#amount-form');
for(let i = 0 ; i < amount.length ; i++){
    amount[i].addEventListener('change', () => {
        amountForm[i].submit();
    })
}
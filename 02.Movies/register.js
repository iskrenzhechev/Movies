// initialization
// - find relevent section

import { showView } from "./dom.js";
import { updateNav } from "./src/app.js";
import { showHome } from "./home.js"; 


// - detach section from DOM
let section = document.getElementById("form-sign-up"); 
const form = section.querySelector('form');
form.addEventListener('submit', onRegister);
section.remove();

// display logic
export function showRegister() {
    showView(section);
}

async function onRegister(event){
    event.preventDefault();
    const formData = new FormData(form); 
 
    const email = formData.get('email').trim();
    const password = formData.get('password').trim();
    const repeatPassword = formData.get('repeatPassword').trim();
    try {
        if(password !== repeatPassword){
            throw new Error('Don\'t match password!');
        }
        const res = await fetch('http://localhost:3030/users/register', {
            method: 'post',
            headers: {
                'Content-type' : 'application/json'
            }, 
            body: JSON.stringify({email, password, repeatPassword})
        }); 
        if(res.ok == false){
            const error = await res.json();
            throw new Error(error.message);
        }
        const data = await res.json(); 
        sessionStorage.setItem('userData', JSON.stringify({
            email: data.email,
            id: data._id, 
            token: data.accessToken
        })); 
        form.reset();
 
        updateNav();
        showHome();
    } catch (err){
        alert(err.message);
    }
 
}
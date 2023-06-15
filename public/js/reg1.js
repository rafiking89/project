
const user = document.querySelector("#user");
const email = document.querySelector("#email");
const pass1 = document.querySelector("#pass1");
const pass2 = document.querySelector("#pass2");
// aaaaaA!1
const formSubmit = (action) => {
	let valid;
	switch (action){
		case 'register':
			valid = isValidForm({
				user: null,
				email: null,
				pass1: null,
				pass2: null,
				success: true
			});
			if(valid.success){
				sendData("/users/register", {
					params:{
						user: user.value,
						email: email.value,
						password: pass1.value,
						repassword: pass2.value
					}
				});
			} else {
				renderErrors(valid);
			}
			break;
		case 'login':
			valid = isValidForm({
				email: null,
				pass1: null,
				success: true
			});
			if(valid.success){
				sendData("/users/login", {
					params:{
						email: email.value,
						password: pass1.value,
					}
				});
			} else {
				renderErrors(valid);
			}
			break;
	}
};

const sendData = (url, params) => {
	axios.post(url,params)
	.then(response => {
		if(response.data.success){

		} else {
				renderErrors(response.data);
		}
        console.log(response.data);
    })
    .catch(error => {
        console.log(error);
    });
};

function renderErrors(valid){
	for(key in valid){
		if(key != "success"){
			const tmp = document.querySelector("#" + key);
			tmp.classList.remove("hide");
			tmp.classList.add("hide");
			if(valid[key]){
				tmp.classList.toggle("hide");
				tmp.innerHTML = valid[key];
			}
		}
	}
}

function ValidateEmail(input) {
  let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return input.match(validRegex);
}

function ValidatePass(input) {
  let validRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;
  return input.match(validRegex);
}	

const isValidForm = (ret) => {
	if(ret.hasOwnProperty("eemail") && !ValidateEmail(email.value)){
    ret.email = "Email not valid";
    ret.success = false;
	}
  if(ret.hasOwnProperty("euser") && (user.value.length < 4 || user.value.length > 30)){
    ret.user = "User name must between 4-30 characters";
    ret.success = false;
	}
  if(ret.hasOwnProperty("epass1") && !ValidatePass(pass1.value)){
    ret.pass1 = "Password not valid";
    ret.success = false;
	}
  if(ret.hasOwnProperty("epass2") && (!ValidatePass(pass2.value) || pass2.value != pass1.value)){
    ret.pass2 = "Validation password not valid";
    ret.success = false;
	}
	return ret;
};




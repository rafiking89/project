const eemail = document.querySelector("#email");
const ppassword = document.querySelector("#password");
const rrepassword = document.querySelector("#repassword");
const uuser = document.querySelector("#user");
const err = document.querySelector(".err");
const usererr = document.querySelector("#usererr");
const emailerr= document.querySelector("#emailerr");
const passworderr = document.querySelector("#passworderr");
const repassworderr = document.querySelector("#repassworderr");
const inputshidden = document.querySelector("#inputshidden");
const title = document.querySelector(".title");




function register(user,email,password,repassword){
	var flag = true;
	var registerflag=true;
	err.style.visibility = "hidden";
	console.log(email.length);
	if(user.length < 1){
		
		usererr.style.visibility = 'visible';
		flag = false;
	}
	else{
		usererr.style.visibility = 'hidden';
	}

	if(email.length < 1){
		emailerr.style.visibility = 'visible';
		flag = false;
	}
	else{
		emailerr.style.visibility = 'hidden';
	}


	if(password.length <1){
		passworderr.style.visibility = 'visible';
		flag = false;
	}
	else{
		passworderr.style.visibility = 'hidden';
	}

	if(repassword.length <1){
		repassworderr.style.visibility = 'visible';
		flag = false;
	}
	else{
		repassworderr.style.visibility = 'hidden';
	}

	if(flag){
		fetch("http://localhost:7000/users/register", {
			method: "post",
			headers: {
			  'Accept': 'application/json',
			  'Content-Type': 'application/json'
			},
			body: JSON.stringify({
			  params:{user:user,
				email: email,
				password: password,
				repassword: repassword}
			  
			})
		  })
		  .then( (response) =>response.json()).then((data) => {
			if(data["eemail"]!=null){
				emailerr.innerHTML =data["eemail"];
				emailerr.style.visibility = "visible";
				registerflag = false;
			}
			if(data["euser"]!=null){
				usererr.innerHTML = data["euser"];
				usererr.style.visibility = "visible";
				registerflag = false;
			}
			if(data["epass1"]!=null){
				passworderr.innerHTML = "Password not valid";
				passworderr.style.visibility = "visible";
				registerflag = false;
			}
			if(data["epass2"]!=null){
				repassworderr.innerHTML = "Repassword not valid";
				repassworderr.style.visibility = "visible";
				registerflag = false;
			}
			if (registerflag) {
				
				document.body.style.backgroundColor = "black";
				title.innerHTML = "REGISTER COMPLETED";
				inputshidden.style.visibility = "hidden";



			}
			
		  });
	}
   
}
   
function loginSub(){
    register(uuser.value,eemail.value,ppassword.value,rrepassword.value);
}

const eemail = document.querySelector("#email");
const ppassword = document.querySelector("#password");


function login(em,ps){
    fetch("http://localhost:7000/users/login", {
        method: "post",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      
        //make sure to serialize your JSON body
        body: JSON.stringify({
          params:{email: em,
              password: ps}
          
        })
      })
      .then( (response) =>response.json()).then((data) => {
        if(data ===true){
            
        }
        else{
            alert("wrong pass or user");
        }
      });
}
   
function loginSub(){
    login(eemail.value,ppassword.value);
}
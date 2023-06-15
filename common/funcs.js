function ValidateEmail(input) {
  let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  console.log("in func", input);
  return input.match(validRegex);
}

function ValidatePass(input) {
  let validRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;
  return input.match(validRegex);
}
//

module.exports = {ValidateEmail, ValidatePass};

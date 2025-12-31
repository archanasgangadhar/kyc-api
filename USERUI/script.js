let count = 0;
let countNominee = 0;
function addChild() {
  count++;
  const div = document.createElement("div");
  div.innerHTML = `
    <h3>Child ${count}</h3>
    <label for="childName${count}">Child Name</label><input id="childName${count}" name="childName${count}" placeholder="Enter child name">
    <label for="childDob${count}">Date of Birth</label><input id="childDob${count}" name="childDob${count}" type="date">
    <label>Aadhaar Front</label><input type="file" name="childAadhaarFront${count}">
    <label>Aadhaar Back</label><input type="file" name="childAadhaarBack${count}">
    <label>Passport Front</label><input type="file" name="childPassportFront${count}">
    <label>Passport Back</label><input type="file" name="childPassportBack${count}">
    <label>Passport Size Photo</label><input type="file" name="childPassportPhoto${count}">
    <hr>
  `;
  document.getElementById("children").appendChild(div);
}
function addNominee() {
  countNominee++;
  const div = document.createElement("div");
  div.innerHTML = `
    <h3>Nominee ${countNominee}</h3>
    <label for="nomineeName${countNominee}">Nominee Name</label><input id="nomineeName${countNominee}" name="nomineeName${countNominee}" placeholder="Enter nominee name">
    <label for="nomineeRelationship${countNominee}">Relationship</label><input id="nomineeRelationship${countNominee}" name="nomineeRelationship${countNominee}" placeholder="Enter relationship">
    <label for="nomineeShare${countNominee}">Percentage Share</label><input id="nomineeShare${countNominee}" name="nomineeShare${countNominee}" placeholder="Enter percentage share">
    <hr>
  `;
  document.getElementById("nominees").appendChild(div);
}


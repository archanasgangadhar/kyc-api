function downloadZip() {
  const employeeId = document.getElementById("employeeId").value;
  const status = document.getElementById("status");

  if (!employeeId) {
    status.textContent = "Please enter Employee ID";
    return;
  }

  status.textContent = "Preparing ZIP, please wait...";

  // Trigger browser download
  window.location.href = `http://localhost:5000/api/employees/employee/${employeeId}/zip`;

  setTimeout(() => {
    status.textContent = "";
  }, 3000);
}

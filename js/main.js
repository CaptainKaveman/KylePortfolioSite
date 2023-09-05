const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav__link");

//const nav = document.querySelector(".nav");
// nav.style = "transform: translateX(0%);";

navToggle.addEventListener("click", () => {
  document.body.classList.toggle("nav-open");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
  });
});


let yearBorn = 1989;
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
//let currentDay = new Date().getDate();
let currentAge;

if (currentMonth < 8) {
  currentAge = currentYear - yearBorn - 1
} else {
  currentAge = currentYear - yearBorn
}

document.getElementById("age").innerHTML = currentAge;
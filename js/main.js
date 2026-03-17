const navToggle = document.querySelector(".nav-toggle");
if (navToggle) {
    navToggle.addEventListener("click", () => {
        document.body.classList.toggle("nav-open");
    });
}

const navLinks = document.querySelectorAll(".nav__link");
navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
    });
});

const ageElement = document.getElementById("age");
if (ageElement) {
    let yearBorn = 1989;
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth() + 1;
    let currentAge;
    if (currentMonth < 8) {
        currentAge = currentYear - yearBorn - 1;
    } else {
        currentAge = currentYear - yearBorn;
    }
    ageElement.innerHTML = currentAge;
}

const copyrightYear = document.getElementById('copyrightYear');
if (copyrightYear) {
    copyrightYear.innerHTML = new Date().getFullYear();
}
function reset() {
  const radio = document.getElementsByName("rating");
  for (let i = 0; i < radio.length; i++) {
    radio[i].checked = false;
  }
}

function results() {
  const radio = document.getElementsByName("rating");
  const span = document.querySelector("span");
  const remove = document.getElementById("card2").classList.remove("hidden");
  const add = document.getElementById("card1").classList.add("hidden");
  for (let i = 0; i <= radio.length; i++) {
    if (radio[i].checked === true) {
      span.textContent = i + 1;
      return remove, add;
    }
  }
}

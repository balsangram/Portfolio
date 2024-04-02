const Responsive = document.querySelector(".responsive");
const Nav = document.querySelector("nav");
const Page = document.querySelector(".page");
const navUl = document.querySelector("nav ul");
let flag = true;

function navChange() {
  if (flag) {
    Responsive.style.top = "-49px";
    Nav.style.height = "70vh";
    Page.style.height = "100vh";
    navUl.style.display = "block";
    console.log("Moved up");
    flag = false;
  } else {
    Responsive.style.top = "0px";
    Nav.style.height = "7vh";
    Page.style.height = "0vh";
    navUl.style.display = "none";
    console.log("Moved down");
    flag = true;
  }
}

// ============================ loder =========
const loader = document.querySelector("#loader");
function showAlert() {
  loader.style.top = "-100%";
}

setTimeout(showAlert, 4000);

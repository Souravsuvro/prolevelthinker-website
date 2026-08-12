const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");

function closeMenu() {
    if (!navLinks || !menuButton) return;
    navLinks.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
}

if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });

    navItems.forEach((item) => item.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });
}

const revealElements = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach((element) => observer.observe(element));
}

const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");

if (filterButtons.length && projectCards.length) {
    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const selected = button.dataset.filter;

            filterButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
            button.setAttribute("aria-pressed", "true");

            projectCards.forEach((card) => {
                const visible = selected === "all" || card.dataset.category === selected;
                card.hidden = !visible;
            });
        });
    });
}

const projectForm = document.querySelector("#project-form");
const formStatus = document.querySelector("#form-status");

if (projectForm && formStatus) {
    projectForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!projectForm.checkValidity()) {
            formStatus.textContent = "Please complete all required fields before sending your inquiry.";
            formStatus.className = "form-status error";
            projectForm.reportValidity();
            return;
        }

        formStatus.textContent = "Thank you. Your inquiry is ready to be sent. Connect this form to your secure backend, CRM, or email service before publishing.";
        formStatus.className = "form-status success";
        projectForm.reset();
    });
}

const yearEl = document.querySelector("#year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

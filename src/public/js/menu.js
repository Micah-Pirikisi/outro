// public/js/menu.js
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.querySelector("nav.site-nav");
  const links = document.getElementById("nav-links");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    document.documentElement.classList.toggle("nav-open");
  });

  // close when clicking a link
  links?.addEventListener("click", () =>
    document.documentElement.classList.remove("nav-open")
  );

  // close on outside click
  document.addEventListener("click", (ev) => {
    const target = ev.target;
    if (!nav.contains(target))
      document.documentElement.classList.remove("nav-open");
  });
});

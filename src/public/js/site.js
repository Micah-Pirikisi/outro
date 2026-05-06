// public/js/site.js
document.addEventListener("submit", async (e) => {
  if (e.target && e.target.id === "comment-form") {
    e.preventDefault();
    const form = e.target;
    const postId = window.location.pathname.split("/post/")[1];
    const data = {
      author: form.author.value,
      email: form.email.value,
      body: form.body.value,
    };
    const res = await fetch(`/api/v1/comments/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      alert("Comment submitted for moderation");
      form.reset();
    } else {
      const err = await res.json();
      alert("Error: " + (err.error || JSON.stringify(err)));
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const wheel = document.getElementById("story-wheel");
  if (!wheel) return;

  const slides = Array.from(wheel.querySelectorAll(".story-slide"));
  const currentSlideNode = wheel.querySelector("[data-current-slide]");
  if (slides.length <= 1) return;

  let currentIndex = slides.findIndex((slide) =>
    slide.classList.contains("is-active"),
  );
  if (currentIndex < 0) currentIndex = 0;

  let isSwitching = false;
  let autoTimer;
  let touchStartY = 0;

  const setActiveSlide = (nextIndex) => {
    slides[currentIndex].classList.remove("is-active");
    slides[currentIndex].setAttribute("aria-hidden", "true");

    currentIndex = (nextIndex + slides.length) % slides.length;

    slides[currentIndex].classList.add("is-active");
    slides[currentIndex].setAttribute("aria-hidden", "false");

    if (currentSlideNode) currentSlideNode.textContent = String(currentIndex + 1);
  };

  const rotate = (direction) => {
    if (isSwitching) return;
    isSwitching = true;
    setActiveSlide(currentIndex + direction);
    setTimeout(() => {
      isSwitching = false;
    }, 680);
  };

  const restartAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => rotate(1), 8500);
  };

  wheel.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      if (Math.abs(event.deltaY) < 8) return;
      rotate(event.deltaY > 0 ? 1 : -1);
      restartAuto();
    },
    { passive: false },
  );

  wheel.addEventListener("touchstart", (event) => {
    touchStartY = event.changedTouches[0].clientY;
  });

  wheel.addEventListener("touchend", (event) => {
    const delta = touchStartY - event.changedTouches[0].clientY;
    if (Math.abs(delta) < 25) return;
    rotate(delta > 0 ? 1 : -1);
    restartAuto();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      rotate(1);
      restartAuto();
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      rotate(-1);
      restartAuto();
    }
  });

  restartAuto();
});

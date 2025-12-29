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

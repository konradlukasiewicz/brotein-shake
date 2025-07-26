const bar = document.getElementById("tag-bar");

bar.querySelectorAll(".tag-btn").forEach((btn, i) => {
  btn.dataset.index = i;
  btn.style.order = i;
});

let pickCount = 0;

bar.addEventListener("click", (e) => {
  const btn = e.target.closest(".tag-btn");
  if (!btn) return;

  if (e.target.classList.contains("close")) {
    btn.classList.remove("selected");
    btn.style.order = btn.dataset.index;
    e.target.remove();
    return;
  }

  if (!btn.classList.contains("selected")) {
    btn.classList.add("selected");
    btn.style.order = -++pickCount;

    if (!btn.querySelector(".close")) {
      const close = document.createElement("span");
      close.textContent = "×";
      close.className = "close";
      btn.appendChild(close);
    }
  }
});

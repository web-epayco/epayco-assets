(function () {
  const params = new URLSearchParams(window.location.search);
  const visibleItemsDesktop = 4;
  const visibleItemsMobile = 2;
  const defaultBranch = params.get("branch") || "main";
  const refreshMinutes = Number(params.get("refresh")) || 10;

  const inferRepoFromGithubPages = () => {
    const host = window.location.hostname;
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    if (!host.endsWith(".github.io") || pathParts.length === 0) {
      return null;
    }
    return {
      owner: host.replace(".github.io", ""),
      repo: pathParts[0],
    };
  };

  const inferred = inferRepoFromGithubPages();
  const owner = params.get("owner") || (inferred && inferred.owner) || "web-epayco";
  const repo = params.get("repo") || (inferred && inferred.repo);

  const sources = {
    light: params.get("lightPath") || "carousel/logos/light",
    dark: params.get("darkPath") || "carousel/logos/dark",
  };

  const applyViewFilter = () => {
    const view = params.get("view") || "both";
    const light = document.getElementById("block-light");
    const dark = document.getElementById("block-dark");
    if (view === "light" && dark) {
      dark.remove();
    }
    if (view === "dark" && light) {
      light.remove();
    }
  };

  const fetchLogosFromGitHub = async (path) => {
    if (!owner || !repo) {
      return [];
    }
    const normalizedPath = path
      .split("/")
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${normalizedPath}?ref=${encodeURIComponent(defaultBranch)}`;
    const response = await fetch(apiUrl, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data
      .filter((item) => item.type === "file" && /\.(svg|png|jpe?g|webp)$/i.test(item.name))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => item.download_url)
      .filter(Boolean);
  };

  const getVisibleItems = () => {
    return window.matchMedia("(max-width: 640px)").matches ? visibleItemsMobile : visibleItemsDesktop;
  };

  const renderEmpty = (carousel, message) => {
    const track = carousel.querySelector(".ep-carousel__track");
    const navButtons = carousel.querySelectorAll(".ep-carousel__nav");
    if (!track) {
      return;
    }
    track.innerHTML = `<li class="ep-carousel__item"><p class="ep-carousel__empty">${message}</p></li>`;
    navButtons.forEach((button) => {
      button.style.visibility = "hidden";
      button.disabled = true;
    });
  };

  const createItem = (src) => {
    const item = document.createElement("li");
    item.className = "ep-carousel__item";
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Medio de pago";
    img.loading = "lazy";
    item.appendChild(img);
    return item;
  };

  const setupCarousel = (root, logos) => {
    if (typeof root._epStop === "function") {
      root._epStop();
    }

    const track = root.querySelector(".ep-carousel__track");
    const prevButton = root.querySelector('[data-dir="prev"]');
    const nextButton = root.querySelector('[data-dir="next"]');
    if (!track || !prevButton || !nextButton) {
      return;
    }

    track.innerHTML = "";
    [prevButton, nextButton].forEach((button) => {
      button.style.visibility = "visible";
      button.disabled = false;
    });
    logos.forEach((logo) => track.appendChild(createItem(logo)));

    const visibleItems = getVisibleItems();
    const stepPercent = 100 / visibleItems;
    let timer = null;
    let isAnimating = false;

    const slide = (dir) => {
      if (isAnimating || track.children.length <= visibleItems) {
        return;
      }
      isAnimating = true;
      const direction = dir === "prev" ? 1 : -1;
      track.style.transition = "transform 380ms ease";
      track.style.transform = `translateX(${direction * stepPercent}%)`;

      const onTransitionEnd = () => {
        track.removeEventListener("transitionend", onTransitionEnd);
        if (dir === "next") {
          track.append(track.firstElementChild);
        } else {
          track.prepend(track.lastElementChild);
        }
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        void track.offsetWidth;
        isAnimating = false;
      };

      track.addEventListener("transitionend", onTransitionEnd, { once: true });
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      stop();
      if (track.children.length > visibleItems) {
        timer = setInterval(() => slide("next"), 2200);
      }
    };

    prevButton.onclick = () => {
      slide("prev");
      start();
    };
    nextButton.onclick = () => {
      slide("next");
      start();
    };
    root._epStop = stop;
    root.onmouseenter = stop;
    root.onmouseleave = start;
    start();
  };

  const mount = async (root) => {
    const type = root.getAttribute("data-source-type");
    const path = sources[type];
    if (!path) {
      renderEmpty(root, "Ruta de logos no configurada.");
      return;
    }

    const logos = await fetchLogosFromGitHub(path);
    if (!logos || logos.length === 0) {
      renderEmpty(root, "No se pudieron cargar logos desde GitHub. Verifica owner/repo/branch y rutas.");
      return;
    }
    setupCarousel(root, logos);
  };

  const reloadAll = async () => {
    const carousels = document.querySelectorAll("[data-carousel]");
    await Promise.all(Array.from(carousels).map((carousel) => mount(carousel)));
  };

  applyViewFilter();
  reloadAll();

  if (refreshMinutes > 0) {
    setInterval(reloadAll, refreshMinutes * 60 * 1000);
  }
})();

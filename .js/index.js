{
  const API_URL = " http://localhost:3024/";

  // Функция throttle будет принимать 2 аргумента:
  // - callee, функция, которую надо вызывать;
  // - timeout, интервал в мс, с которым следует пропускать вызовы.
  const throttle = (callee, timeout) => {
    // Таймер будет определять,
    // надо ли нам пропускать текущий вызов.
    let timer = null;

    // Как результат возвращаем другую функцию.
    // Это нужно, чтобы мы могли не менять другие части кода,
    // чуть позже мы увидим, как это помогает.
    return function perform(...args) {
      // Если таймер есть, то функция уже была вызвана,
      // и значит новый вызов следует пропустить.
      if (timer) return;

      // Если таймера нет, значит мы можем вызвать функцию:
      timer = setTimeout(() => {
        // Аргументы передаём неизменными в функцию-аргумент:
        callee(...args);

        // По окончании очищаем таймер:
        clearTimeout(timer);
        timer = null;
      }, timeout);
    };
  };

  let dataMusic = [];

  let playlist = [];

  const favoriteList = localStorage.getItem("favorite")
    ? JSON.parse(localStorage.getItem("favorite"))
    : [];

  const audio = new Audio();

  const headerLogo = document.querySelector(".header__logo");
  const favoriteBtn = document.querySelector(".header__favorite-btn");
  const tracksCard = document.getElementsByClassName("track");
  const catalogContainer = document.querySelector(".catalog__container");
  const player = document.querySelector(".player");
  const pauseBtn = document.querySelector(".player__controller-pause");
  const stopBtn = document.querySelector(".player__controller-stop");
  const prevBtn = document.querySelector(".player__controller-prev");
  const nextBtn = document.querySelector(".player__controller-next");
  const likeBtn = document.querySelector(".player__controller-like");
  const muteBtn = document.querySelector(".player__controller-mute");
  const playerVolumeInput = document.querySelector(".player__volume-input");
  const playerProgressInput = document.querySelector(".player__progress-input");

  const trackTitle = document.querySelector(".track-info__title");
  const trackArtist = document.querySelector(".track-info__artist");

  const playerTimePassed = document.querySelector(".player__time-passed");
  const playerTimeTotal = document.querySelector(".player__time-total");

  const search = document.querySelector(".search");

  const pausePlayer = () => {
    const trackActive = document.querySelector(".track_active");

    if (audio.paused) {
      audio.play();
      pauseBtn.classList.remove("player__icon_play");
      trackActive.classList.remove("track_pause");
    } else {
      audio.pause();
      pauseBtn.classList.add("player__icon_play");
      trackActive.classList.add("track_pause");
    }
  };

  const playMusic = (event) => {
    // убираю стандартное поведение ( сейчас был бы переход на страницу
    // в адресной строке ( ркуа тэга а "!#""))
    event.preventDefault();
    const trackActive = event.currentTarget;

    if (trackActive.classList.contains("track_active")) {
      pausePlayer();
      return;
    }
    let i = 0;
    const id = trackActive.dataset.idTrack;

    const index = favoriteList.indexOf(id);
    if (index !== -1) {
      likeBtn.classList.add("player__icon_like_active");
    } else {
      likeBtn.classList.remove("player__icon_like_active");
    }

    const track = playlist.find((item, index) => {
      i = index;
      return id === item.id;
    });

    audio.src = `${API_URL}${track.mp3}`;
    trackTitle.textContent = track.track;
    trackArtist.textContent = track.artist;

    audio.play();

    pauseBtn.classList.remove("player__icon_play");
    player.classList.add("player_active");
    player.dataset.idTrack = id;

    const prevTrack = i === 0 ? playlist.length - 1 : i - 1;
    const nextTrack = i + 1 === playlist.length ? 0 : i + 1;
    prevBtn.dataset.idTrack = playlist[prevTrack].id;
    nextBtn.dataset.idTrack = playlist[nextTrack].id;

    likeBtn.dataset.idTrack = id;

    for (let i = 0; i < tracksCard.length; i++) {
      if (id === tracksCard[i].dataset.idTrack) {
        tracksCard[i].classList.add("track_active");
      } else {
        tracksCard[i].classList.remove("track_active");
      }
    }
  };

  const addHandlerTrack = () => {
    for (let i = 0; i < tracksCard.length; i++) {
      tracksCard[i].addEventListener("click", playMusic);
    }
  };

  const createCard = (data) => {
    const card = document.createElement("a");
    card.href = "!#";
    card.classList.add("catalog__item", "track");
    if (player.dataset.idTrack === data.id) {
      card.classList.add("track_active");
      if (audio.paused) {
        card.classList.add("track_pause");
      }
    }
    card.dataset.idTrack = data.id;

    card.innerHTML = `
    <div class="track__img-wrap">
      <img class="track__poster" src="${API_URL}${data.poster}" alt="${data.artist} ${data.track}" width="180" height="180">
    </div>
    <div class="track__info track-info">
      <p class="track-info__title">${data.track}</p>
      <p class="track-info__artist">${data.artist}</p>
    </div>
  `;
    return card;
  };

  const renderCatalog = (dataList) => {
    playlist = [...dataList];
    if (!playlist.length) {
      catalogContainer.innerHTML = `
      <p class="search__nothing">No results found</p>
      `;
      return;
    }
    // сначала очищаю все потому что инога будет поиск срабатывать. переход в избранное и тд)
    catalogContainer.textContent = "";
    const listCards = dataList.map(createCard);
    catalogContainer.append(...listCards);
    addHandlerTrack();
    const catalogAddBtn = createCatalogBtn();
    checkCount(catalogAddBtn);
  };
  // проверка для выводатолько 2 строк трэков
  const checkCount = (catalogAddBtn, i = 1) => {
    if (catalogContainer.clientHeight + 20 > tracksCard[0].clientHeight * 3) {
      tracksCard[tracksCard.length - i].style.display = "none";
      return checkCount(catalogAddBtn, i + 1);
    }

    if (i != 1) {
      catalogContainer.append(catalogAddBtn);
    }
  };

  const updateTime = () => {
    const duration = audio.duration;
    const currentTime = audio.currentTime;
    const progress = (currentTime / duration) * playerProgressInput.max;

    playerProgressInput.value = progress ? progress : 0;

    const minutesPassed = Math.floor(currentTime / 60) || "0";
    const secundsPassed = Math.floor(currentTime % 60) || "0";

    const minutesDuration = Math.floor(duration / 60) || "0";
    const secundsDuration = Math.floor(duration % 60) || "0";

    playerTimePassed.textContent = `${minutesPassed}:${
      secundsPassed < 10 ? "0" + secundsPassed : secundsPassed
    }`;
    playerTimeTotal.textContent = `${minutesDuration}:${
      secundsDuration < 10 ? "0" + secundsDuration : secundsDuration
    }`;
  };

  const createCatalogBtn = () => {
    const catalogAddBtn = document.createElement("button");
    catalogAddBtn.classList.add("catalog__btn-add");
    catalogAddBtn.innerHTML = `
  <span>See all</span>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" />
  </svg>
  `;

    catalogAddBtn.addEventListener("click", () => {
      [...tracksCard].forEach((element) => {
        element.style.display = "";
        catalogAddBtn.remove();
      });
    });

    return catalogAddBtn;
  };

  const addEventListener = () => {
    prevBtn.addEventListener("click", playMusic);
    nextBtn.addEventListener("click", playMusic);

    audio.addEventListener("ended", () => {
      nextBtn.click();
      // тоже самое, но сложнее
      // nextBtn.dispatchEvent(new Event("click", { bubbles: true }));
    });

    const updateTimeThrottle = throttle(updateTime, 500);

    audio.addEventListener("timeupdate", updateTimeThrottle);

    playerProgressInput.addEventListener("change", () => {
      const progress = playerProgressInput.value;
      audio.currentTime = (progress / playerProgressInput.max) * audio.duration;
    });

    favoriteBtn.addEventListener("click", () => {
      const data = dataMusic.filter((item) => favoriteList.includes(item.id));
      renderCatalog(data);
    });

    headerLogo.addEventListener("click", () => {
      renderCatalog(dataMusic);
    });

    likeBtn.addEventListener("click", () => {
      const index = favoriteList.indexOf(likeBtn.dataset.idTrack);
      if (index === -1) {
        favoriteList.push(likeBtn.dataset.idTrack);
        likeBtn.classList.add("player__icon_like_active");
      } else {
        favoriteList.splice(index, 1);
        likeBtn.classList.remove("player__icon_like_active");
      }

      localStorage.setItem("favorite", JSON.stringify(favoriteList));
    });

    playerVolumeInput.addEventListener("input", () => {
      const value = playerVolumeInput.value;
      audio.volume = value / 100;
    });

    muteBtn.addEventListener("click", () => {
      if (audio.volume) {
        localStorage.setItem("volume", audio.volume);
        audio.volume = 0;
        muteBtn.classList.add("player__icon_mute-off");
        playerVolumeInput.value = 0;
      } else {
        audio.volume = localStorage.getItem("volume");
        muteBtn.classList.remove("player__icon_mute-off");
        playerVolumeInput.value = audio.volume * 100;
      }
    });

    pauseBtn.addEventListener("click", pausePlayer);

    stopBtn.addEventListener("click", () => {
      audio.src = "";
      player.classList.remove("player_active");

      document.querySelector(".track_active").classList.remove("track_active");
    });

    search.addEventListener("submit", (event) => {
      event.preventDefault();
      fetch(`${API_URL}api/music?search=${search.search.value}`)
        .then((data) => data.json())
        .then(renderCatalog);
    });
  };

  const init = async () => {
    audio.volume = localStorage.getItem("volume") || 1;
    playerVolumeInput.value = audio.volume * 100;

    dataMusic = await fetch(`${API_URL}api/music`).then((data) => data.json());

    renderCatalog(dataMusic);

    addEventListener();
  };

  init();
}

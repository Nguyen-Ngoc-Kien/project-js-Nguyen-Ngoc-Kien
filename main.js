class MusicPlayer {
  constructor() {
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isRandom = false;
    this.isRepeat = false;
    this.config = {};
    this.songs = [
      {
        name: "Tấm Lòng Son",
        singer: "H-Kray",
        path: "./music/TamLongSon.mp3",
        image: "https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg"
      },
      {
        name: "Thời Không Sai Lệch",
        singer: "Ngải Thần",
        path: "./music/ThoiKhongSaiLech-NgaiThan.mp3",
        image: "./image/TKSL.jpg"
      },
      {
        name: "Lemon",
        singer: "Yonezu Kenshi",
        path: "./music/Lemon.mp4",
        image: "./image/Lemon.jfif"
      },
      {
        name: "Kim Giờ Kim Phút",
        singer: "Song performed by: HURRYKNG, HIEUTHUHAI, NEGAV, Pháp Kiều, Isaac",
        path: "./music/kim-gio-kim-phut.mp4",
        image: "./image/kim-gio-kim-phut.jfif"
      },
      {
        name: "Cẩm Tú Cầu",
        singer: "Huỳnh Văn",
        path: "./music/cam-tu-cau.mp3",
        image: "./image/cam-tu-cau.jfif"
      },
      {
        name: "Piano",
        singer: "None",
        path: "./music/NightOfThePiano.mp3",
        image: "./image/piano.jfif"
      },
    ];

    this.$player = document.querySelector(".player");
    this.$cd = document.querySelector(".cd");
    this.$heading = document.querySelector("header h2");
    this.$cdThumb = document.querySelector(".cd-thumb");
    this.$audio = document.getElementById("audio");
    this.$playBtn = document.querySelector(".btn-toggle-play");
    this.$progress = document.getElementById("progress");
    this.$prevBtn = document.querySelector(".btn-prev");
    this.$nextBtn = document.querySelector(".btn-next");
    this.$randomBtn = document.querySelector(".btn-random");
    this.$repeatBtn = document.querySelector(".btn-repeat");
    this.$playlist = document.querySelector(".playlist");

    this.loadConfig();
    this.defineProperties();
    this.handleEvents();
    this.loadCurrentSong();
    this.render();
    this.updateButtonStates();
  }

  setConfig(key, value) {
    this.config[key] = value;
  }

  render() {
    const htmls = this.songs.map((song, index) => `
      <div class="song ${index === this.currentIndex ? "active" : ""}" data-index="${index}">
        <div class="thumb" style="background-image: url('${song.image}')"></div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
      </div>
    `);
    this.$playlist.innerHTML = htmls.join("");
  }

  defineProperties() {
    Object.defineProperty(this, "currentSong", {
      get: () => this.songs[this.currentIndex],
    });
  }

  handleEvents() {
    const cdWidth = this.$cd.offsetWidth;

    const cdThumbAnimate = this.$cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    document.onscroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      this.$cd.style.width = newCdWidth > 0 ? `${newCdWidth}px` : 0;
      this.$cd.style.opacity = newCdWidth / cdWidth;
    };

    this.$playBtn.onclick = () => {
      this.isPlaying ? this.$audio.pause() : this.$audio.play();
    };

    this.$audio.onplay = () => {
      this.isPlaying = true;
      this.$player.classList.add("playing");
      cdThumbAnimate.play();
    };

    this.$audio.onpause = () => {
      this.isPlaying = false;
      this.$player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    this.$audio.ontimeupdate = () => {
      if (this.$audio.duration) {
        const progressPercent = Math.floor((this.$audio.currentTime / this.$audio.duration) * 100);
        this.$progress.value = progressPercent;
      }
    };

    this.$progress.onchange = (e) => {
      const seekTime = (this.$audio.duration / 100) * e.target.value;
      this.$audio.currentTime = seekTime;
    };

    this.$nextBtn.onclick = () => {
      this.isRandom ? this.playRandomSong() : this.nextSong();
      this.$audio.play();
      this.render();
      this.scrollToActiveSong();
    };

    this.$prevBtn.onclick = () => {
      this.isRandom ? this.playRandomSong() : this.prevSong();
      this.$audio.play();
      this.render();
      this.scrollToActiveSong();
    };

    this.$randomBtn.onclick = () => {
      this.isRandom = !this.isRandom;
      this.setConfig("isRandom", this.isRandom);
      this.$randomBtn.classList.toggle("active", this.isRandom);
    };

    this.$repeatBtn.onclick = () => {
      this.isRepeat = !this.isRepeat;
      this.setConfig("isRepeat", this.isRepeat);
      this.$repeatBtn.classList.toggle("active", this.isRepeat);
    };

    this.$audio.onended = () => {
      if (this.isRepeat) {
        this.$audio.play();
      } else {
        this.$nextBtn.click();
      }
    };

    this.$playlist.onclick = (e) => {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode) {
        this.currentIndex = Number(songNode.dataset.index);
        this.loadCurrentSong();
        this.render();
        this.$audio.play();
      }
    };
  }

  scrollToActiveSong() {
    setTimeout(() => {
      document.querySelector(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  }

  loadCurrentSong() {
    this.$heading.textContent = this.currentSong.name;
    this.$cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    this.$audio.src = this.currentSong.path;
  }

  loadConfig() {
    this.isRandom = this.config.isRandom || false;
    this.isRepeat = this.config.isRepeat || false;
  }

  nextSong() {
    this.currentIndex = (this.currentIndex + 1) % this.songs.length;
    this.loadCurrentSong();
  }

  prevSong() {
    this.currentIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
    this.loadCurrentSong();
  }

  playRandomSong() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  }

  updateButtonStates() {
    this.$randomBtn.classList.toggle("active", this.isRandom);
    this.$repeatBtn.classList.toggle("active", this.isRepeat);
  }
}

// Initialize the music player
const musicPlayer = new MusicPlayer();
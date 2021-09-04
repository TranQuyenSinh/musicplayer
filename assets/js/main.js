/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / Pause / Seek
 * 4. CD rotate
 * 5. Next / Previous
 * 6. Random
 * 7. Next / Repeat when end
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */
var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);
const player = $('.app');
const title = $('header h2');
const cd = $('.cd');
const cdImg = $('.cd-img');
const audio = $('#audio');
const progress = $('#progress');
const playBtn = $('.btn-toggle-play');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
  currentIndex: 5,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  songs: [{
      name: 'Dịu dàng em đến',
      singer: 'ERIK, NinjaZ',
      path: './assets/song/song1.mp3',
      image: './assets/img/song1.jpg'
    },
    {
      name: 'Ái Nộ',
      singer: 'Masew, Khôi Vũ',
      path: './assets/song/song2.mp3',
      image: './assets/img/song2.jpg'
    },
    {
      name: 'Em Hát Ai Nghe',
      singer: 'Orange',
      path: './assets/song/song3.mp3',
      image: './assets/img/song3.jpg'
    },
    {
      name: 'Sai Lầm Của Chúng Ta',
      singer: 'NQP',
      path: './assets/song/song4.mp3',
      image: './assets/img/song4.jpg'
    },
    {
      name: 'Tới Công Chuyện',
      singer: 'Phương NP',
      path: './assets/song/song5.mp3',
      image: './assets/img/song5.jpg'
    },
    {
      name: 'Cố Lên Sài Gòn',
      singer: 'Dilan Vũ, Trần Vũ',
      path: './assets/song/song6.mp3',
      image: './assets/img/song6.jpg'
    },
    {
      name: 'Tớ Yêu Cậu',
      singer: 'Phạm Đình Thái Ngân',
      path: './assets/song/song7.mp3',
      image: './assets/img/song7.jpg'
    }
  ],
  definedProperties() {
    Object.defineProperty(this, 'currentSong', {
      get() {
        return this.songs[this.currentIndex];
      }
    })
  },
  renderSong() {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="playlist-item ${index == this.currentIndex? 'active' : ''}" data-index="${index}">
        <div class="thumb" style="background-image: url(${song.image});"></div>
        <div class="info">
          <h4 class="title">${song.name}</h4>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>
      `
    })
    $('.playlist').innerHTML = htmls.join('');
  },
  handleEvents() {
    const _this = this;

    // Xử lý rotate CD 
    const cdImgAnimate = cdImg.animate([{
      "transform": "rotate(360deg)"
    }], {
      duration: 10000,
      iterations: Infinity
    });
    cdImgAnimate.pause(); // mới chạy ứng dụng thì nhạc sẽ ko phát => cd ko cần quay

    // Xử lý phóng to / thu nhỏ CD
    const cdWidth = cd.offsetWidth;
    document.onscroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      $('.cd').style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
      $('.cd').style.opacity = newCdWidth / cdWidth;
    }

    // Xử lý khi click play/pause
    playBtn.onclick = () => {
      if (_this.isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
    }

    // Khi song đang play
    audio.onplay = () => {
      _this.isPlaying = true;
      player.classList.add('playing');
      cdImgAnimate.play();
    }

    // Khi song đang Pause
    audio.onpause = () => {
      _this.isPlaying = false;
      player.classList.remove('playing');
      cdImgAnimate.pause();
    }

    // Xử lý thanh progress khi song đang play
    audio.ontimeupdate = () => {
      const currentPercent = Math.floor(audio.currentTime / audio.duration * 100);
      if (currentPercent)
        progress.value = currentPercent;
    }

    // Xử lý tua song
    progress.onchange = () => {
      const seekTime = audio.duration * progress.value / 100;
      audio.currentTime = seekTime;
    }

    // Xử lý khi end song
    audio.onended = () => {
      if (_this.isRepeat) {
        audio.play()
      } else {
        nextBtn.click()
      }
    }

    // Xử lý click random
    randomBtn.onclick = () => {
      _this.isRandom = !_this.isRandom;
      randomBtn.classList.toggle('active', _this.isRandom);
    }

    // Xử lý click repeat
    repeatBtn.onclick = () => {
      _this.isRepeat = !_this.isRepeat;
      repeatBtn.classList.toggle('active', _this.isRepeat);
    }

    // Xử lý click next / prev
    nextBtn.onclick = () => {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.renderSong();
      _this.scrollToActiveSong();
    }
    prevBtn.onclick = () => {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.renderSong();
      _this.scrollToActiveSong();
    }

    // Xử lý click playList
    playList.onclick = (e) => {
      // closest(selector) => tổ tiên gần nhất (cha) có selector
      const playListItem = e.target.closest('.playlist-item:not(.active)');
      if (playListItem) {
        if (e.target.closest('.option')) {
          // Xử lý khi click option
        } else {
          // Xử lý click vào playlist-item
          _this.currentIndex = playListItem.dataset.index;
          _this.loadCurrentSong();
          _this.renderSong();
          audio.play();
        }
      }
    }
  },
  loadCurrentSong() {
    title.textContent = this.currentSong.name;
    cdImg.style.backgroundImage = `url(${this.currentSong.image})`;
    audio.src = this.currentSong.path;
  },
  nextSong() {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong() {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong() {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * this.songs.length);
    } while (randomIndex == this.currentIndex);
    this.currentIndex = randomIndex;
    this.loadCurrentSong();
  },
  scrollToActiveSong() {
    let block;
    if (this.currentIndex < 2) {
      block = 'center';
    } else {
      block = 'nearest';
    }
    $('.playlist-item.active').scrollIntoView({
      behavior: 'smooth',
      block: block
    })
  },
  start() {
    // Định nghĩa thuộc tính cho object
    this.definedProperties()

    // Lắng nghe / Xử lý sự kiện (DOM event)
    this.handleEvents()

    // Render playlist
    this.renderSong()

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong()
  }
}

app.start()
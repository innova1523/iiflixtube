const TMDB_KEY = '603b75fddf9facc67e581c1fa74d3d8f';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BG_URL = 'https://image.tmdb.org/t/p/original';

document.addEventListener("DOMContentLoaded", () => {
  const rowsContainer = document.getElementById('rows');
  const hero = document.getElementById('hero');
  const heroTitle = document.getElementById('heroTitle');
  const heroDesc = document.getElementById('heroDesc');
  const searchInput = document.getElementById('searchInput');
  const modal = document.getElementById('modal');
  const closeModalBtn = document.getElementById('closeModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalTrailer = document.getElementById('modalTrailer');

  const categories = [
    { title: 'Trending Now', endpoint: 'trending/movie/week' },
    { title: 'Top Rated', endpoint: 'movie/top_rated' },
    { title: 'Action', endpoint: 'discover/movie?with_genres=28' },
    { title: 'Comedy', endpoint: 'discover/movie?with_genres=35' },
    { title: 'Horror', endpoint: 'discover/movie?with_genres=27' }
  ];

  async function fetchTMDB(url){
    const res = await fetch(`https://api.themoviedb.org/3/${url}&api_key=${TMDB_KEY}`);
    return res.json();
  }

  async function loadHero(){
    const data = await fetchTMDB('movie/popular?language=en-US&page=1');
    const movie = data.results[Math.floor(Math.random()*data.results.length)];
    if(movie.backdrop_path) hero.style.backgroundImage = `url(${BG_URL+movie.backdrop_path})`;
    heroTitle.textContent = movie.title || 'Untitled';
    heroDesc.textContent = movie.overview ? movie.overview.substring(0,180)+'...' : '';
  }

  async function loadRows(){
    rowsContainer.innerHTML = '';
    for(let cat of categories){
      const data = await fetchTMDB(`${cat.endpoint}&language=en-US&page=1`);
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('row');
      const h2 = document.createElement('h2');
      h2.textContent = cat.title;
      rowDiv.appendChild(h2);

      const movieRow = document.createElement('div');
      movieRow.classList.add('movie-row');

      data.results.forEach(m=>{
        if(!m.poster_path) return;
        const movieDiv = document.createElement('div');
        movieDiv.classList.add('movie');
        movieDiv.style.backgroundImage = `url(${IMG_URL + m.poster_path})`;
        movieDiv.title = m.title;
        movieDiv.addEventListener('click', ()=>openModal(m.id));
        movieRow.appendChild(movieDiv);
      });

      // arrows
      const leftArrow = document.createElement('button');
      leftArrow.className = 'arrow arrow-left';
      leftArrow.innerHTML = '&#10094;';
      leftArrow.onclick = () => movieRow.scrollBy({left:-300,behavior:'smooth'});
      const rightArrow = document.createElement('button');
      rightArrow.className = 'arrow arrow-right';
      rightArrow.innerHTML = '&#10095;';
      rightArrow.onclick = () => movieRow.scrollBy({left:300,behavior:'smooth'});

      rowDiv.appendChild(leftArrow);
      rowDiv.appendChild(rightArrow);
      rowDiv.appendChild(movieRow);
      rowsContainer.appendChild(rowDiv);
    }
  }

  async function openModal(movieId){
    const movie = await fetchTMDB(`movie/${movieId}?language=en-US`);
    modalTitle.textContent = movie.title || 'Untitled';
    modalDesc.textContent = movie.overview || 'No description.';
    const videos = await fetchTMDB(`movie/${movieId}/videos`);
    const yt = videos.results.find(v => v.site==='YouTube' && v.type==='Trailer');
    modalTrailer.innerHTML = yt ? `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${yt.key}" frameborder="0" allowfullscreen></iframe>` : "<p>No trailer available</p>";
    modal.style.display='block';
  }

  closeModalBtn.onclick = () => { modal.style.display='none'; modalTrailer.innerHTML=''; };
  window.onclick = e => { if(e.target==modal){ modal.style.display='none'; modalTrailer.innerHTML=''; } };

  searchInput.addEventListener('keypress', async e=>{
    if(e.key==='Enter'){
      const q = searchInput.value.trim();
      if(!q) return;
      const data = await fetchTMDB(`search/movie?query=${encodeURIComponent(q)}&language=en-US&page=1`);
      rowsContainer.innerHTML = '';
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('row');
      const h2 = document.createElement('h2');
      h2.textContent = 'Search Results';
      rowDiv.appendChild(h2);
      const movieRow = document.createElement('div');
      movieRow.classList.add('movie-row');
      data.results.forEach(m=>{
        if(!m.poster_path) return;
        const movieDiv = document.createElement('div');
        movieDiv.classList.add('movie');
        movieDiv.style.backgroundImage = `url(${IMG_URL + m.poster_path})`;
        movieDiv.title = m.title;
        movieDiv.addEventListener('click', ()=>openModal(m.id));
        movieRow.appendChild(movieDiv);
      });
      rowDiv.appendChild(movieRow);
      rowsContainer.appendChild(rowDiv);
    }
  });

  loadHero();
  loadRows();
});

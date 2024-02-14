// Importujemy Axios i Notiflix
import axios from 'axios';
import Notiflix from 'notiflix';

// Definiujemy klucz API oraz URL do API Pixabay
const API_KEY = 'YOUR_API_KEY'; // Tutaj wpisz swój klucz
const API_URL = 'https://pixabay.com/api/';
const FORM = document.querySelector('#search-form');
const GALLERY = document.querySelector('#gallery');
const LOAD_MORE_BUTTON = document.querySelector('#load-more');

let currentPage = 1;
let searchQuery = '';

// Funkcja do wykonywania zapytań do Pixabay API
async function fetchImages(searchQuery, page) {
  try {
    const response = await axios.get(
      `${API_URL}?key=${API_KEY}&q=${encodeURIComponent(
        searchQuery
      )}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}

// Funkcja do renderowania galerii obrazów
function renderGallery(images) {
  const markup = images
    .map(
      image => `
        <div class="photo-card">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
            <div class="info">
                <p class="info-item">
                    <b>Likes</b> ${image.likes}
                </p>
                <p class="info-item">
                    <b>Views</b> ${image.views}
                </p>
                <p class="info-item">
                    <b>Comments</b> ${image.comments}
                </p>
                <p class="info-item">
                    <b>Downloads</b> ${image.downloads}
                </p>
            </div>
        </div>
    `
    )
    .join('');

  GALLERY.insertAdjacentHTML('beforeend', markup);
}

// Funkcja do czyszczenia galerii
function clearGallery() {}

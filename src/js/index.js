// Importowanie wymaganych modułów
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// Konfiguracja API
const API_KEY = '4899584-ce1a6fbdd7631a82a87f71a0e';
const BASE_URL = 'https://pixabay.com/api/';

// Elementy DOM
const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('#gallery');
const loadMoreButton = document.querySelector('#load-more');

// Stan aplikacji
let currentPage = 1;
let searchQuery = '';
let totalHits = 0;
let lightbox = null;

// Słuchacze zdarzeń
searchForm.addEventListener('submit', handleSearch);
loadMoreButton.addEventListener('click', fetchImages);

// Obsługa wysłania formularza wyszukiwania
async function handleSearch(event) {
  event.preventDefault();
  searchQuery = event.currentTarget.elements.searchQuery.value.trim();

  if (!searchQuery) {
    Notiflix.Notify.failure('Proszę wprowadzić frazę wyszukiwania.');
    return;
  }

  clearGallery();
  currentPage = 1;
  fetchImages();
}

// Pobieranie obrazów z Pixabay
async function fetchImages() {
  loadMoreButton.hidden = true;

  const params = new URLSearchParams({
    key: API_KEY,
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: currentPage,
    per_page: 40,
  });

  try {
    const response = await axios.get(`${BASE_URL}?${params}`);
    const data = response.data;
    totalHits = data.totalHits;
    const hits = data.hits;

    loadMoreButton.classList.toggle(
      'show',
      (currentPage - 1) * 40 + hits.length < totalHits
    );

    if (hits.length === 0) {
      Notiflix.Notify.failure('Brak zdjęć odpowiadających zapytaniu.');
      return;
    }

    appendImagesMarkup(hits);
    loadMoreButton.hidden = !(currentPage * 40 < totalHits);

    if (currentPage === 1 && totalHits > 0) {
      Notiflix.Notify.success(`Hura! Znaleziono ${totalHits} obrazów.`);
    }

    currentPage++;
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Nie udało się pobrać zdjęć. Spróbuj ponownie.');
  }
}

// Czyszczenie zawartości galerii
function clearGallery() {
  gallery.innerHTML = '';
  totalHits = 0;
}

// Dodawanie obrazów do galerii
function appendImagesMarkup(images) {
  const markup = images
    .map(
      image => `
            <a href="${image.largeImageURL}" class="photo-card" data-lightbox="image-set">
                <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
                <div class="info">
                    <p class="info-item"><b>Lubię to</b> <span>${image.likes}</span></p>
                    <p class="info-item"><b>Odsłony</b> <span>${image.views}</span></p>
                    <p class="info-item"><b>Komentarze</b> <span>${image.comments}</span></p>
                    <p class="info-item"><b>Pobrania</b> <span>${image.downloads}</span></p>
                </div>
            </a>
        `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);

  // Inicjalizacja SimpleLightbox dla nowo dodanych elementów
  if (!lightbox) {
    lightbox = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    });
  } else {
    lightbox.refresh();
  }

  // Logika dla przycisku "Load more"
  if ((currentPage - 1) * 40 + images.length < totalHits) {
    loadMoreButton.hidden = false;
  } else {
    loadMoreButton.hidden = true;
    if (currentPage !== 1) {
      Notiflix.Notify.info(
        'Przykro nam, ale dotarłeś do końca wyników wyszukiwania.'
      );
    }
  }
}

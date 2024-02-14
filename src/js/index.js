// Importowanie wymaganych modułów
import axios from 'axios';
import Notiflix from 'notiflix';

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

  currentPage = 1;
  clearGallery();
  fetchImages();
}

// Pobieranie obrazów z Pixabay
async function fetchImages() {
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
    const { hits, totalHits } = response.data;

    // Logika dla wyświetlenia przycisku "Load more"
    loadMoreButton.hidden = !(
      hits.length > 0 && (currentPage - 1) * 40 + hits.length < totalHits
    );

    if (hits.length === 0 && currentPage === 1) {
      Notiflix.Notify.failure(
        'Niestety, nie znaleziono obrazów pasujących do zapytania. Proszę wpisać inną frazę lub spróbować ponownie.'
      );
      return;
    }

    // Odświeżanie galerii tylko przy pierwszej stronie wyników
    if (currentPage === 1) {
      clearGallery();
      Notiflix.Notify.success(`Hura! Znaleziono ${totalHits} obrazów.`);
    }

    appendImagesMarkup(hits, totalHits);

    currentPage += 1;

    // Jeśli wszystkie obrazy zostały załadowane, ukryj przycisk "Load more"
    if ((currentPage - 1) * 40 + hits.length >= totalHits) {
      loadMoreButton.hidden = true;
      if (currentPage > 1) {
        Notiflix.Notify.info(
          'Przykro nam, ale dotarłeś do końca wyników wyszukiwania.'
        );
      }
    }
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure(
      'Ups, coś poszło nie tak. Proszę spróbować później.'
    );
  }
}

// Czyszczenie zawartości galerii
function clearGallery() {
  gallery.innerHTML = '';
  loadMoreButton.hidden = true;
}

// Dodawanie obrazów do galerii i aktualizacja logiki przycisku "Load more"
function appendImagesMarkup(images, totalHits) {
  const markup = images
    .map(
      image => `
          <div class="photo-card">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
            <div class="info">
              <p class="info-item">
                <b>Lubię to</b>
                <span>${image.likes}</span>
              </p>
              <p class="info-item">
                <b>Odsłony</b>
                <span>${image.views}</span>
              </p>
              <p class="info-item">
                <b>Komentarze</b>
                <span>${image.comments}</span>
              </p>
              <p class="info-item">
                <b>Pobrania</b>
                <span>${image.downloads}</span>
              </p>
            </div>
          </div>
        `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}


(() => {
  'use strict';

  const list = document.getElementById('reviewsList');
  const form = document.getElementById('reviewForm');
  const message = document.getElementById('reviewMessage');

  if (!list || !form || !message) return;

  const config = window.LETWELVE_CONFIG || {};
  const projectUrl = String(config.SUPABASE_URL || '')
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1$/i, '');

  const apiKey = String(config.SUPABASE_ANON_KEY || '').trim();

  const configured =
    /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(projectUrl) &&
    /^(sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9._-]+)$/.test(apiKey);

  const endpoint = configured
    ? `${projectUrl}/rest/v1/reviews`
    : '';

  function headers(extra = {}) {
    const result = { apikey: apiKey, ...extra };

    if (apiKey.startsWith('eyJ')) {
      result.Authorization = `Bearer ${apiKey}`;
    }

    return result;
  }

  async function getError(response) {
    let detail = '';

    try {
      const data = await response.json();
      detail = data.message || data.msg || JSON.stringify(data);
    } catch (_) {}

    return new Error(`Error ${response.status}: ${detail}`);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  async function loadReviews() {
    if (!configured) {
      list.textContent = 'Comprueba la configuración de Supabase.';
      return;
    }

    try {
      const response = await fetch(
        `${endpoint}?select=name,rating,review,created_at&approved=eq.true&order=created_at.desc`,
        { headers: headers() }
      );

      if (!response.ok) throw await getError(response);

      const reviews = await response.json();

      list.innerHTML = reviews.length
        ? reviews.map(item => `
          <article class="review-card">
            <b>${escapeHTML(item.name)}</b>
            <div class="review-stars">
              ${'★'.repeat(Number(item.rating))}${'☆'.repeat(5 - Number(item.rating))}
            </div>
            <p>${escapeHTML(item.review)}</p>
          </article>
        `).join('')
        : '<p>Todavía no hay reseñas publicadas.</p>';

    } catch (error) {
      console.error(error);
      list.textContent = 'Error cargando reseñas: ' + error.message;
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (!configured) {
      message.textContent = 'Revisa la URL y la clave de Supabase.';
      return;
    }

    const data = new FormData(form);

    if (!data.get('consent')) {
      message.textContent = 'Debes aceptar el consentimiento.';
      return;
    }

    const payload = {
      name: String(data.get('name') || '').trim(),
      rating: Number(data.get('rating')),
      review: String(data.get('review') || '').trim(),
      approved: true
    };

    if (
      !payload.name ||
      !payload.review ||
      !Number.isInteger(payload.rating) ||
      payload.rating < 1 ||
      payload.rating > 5
    ) {
      message.textContent = 'Comprueba los datos de la reseña.';
      return;
    }

    const button = form.querySelector('button[type="submit"]');

    if (button) button.disabled = true;
    message.textContent = 'Enviando reseña…';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers({
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        }),
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw await getError(response);

      message.textContent =
        '¡Gracias! Tu reseña se ha guardado y está pendiente de aprobación.';

      form.reset();

    } catch (error) {
      console.error('Error guardando reseña:', error);
      message.textContent =
        'No se ha podido guardar: ' + error.message;

    } finally {
      if (button) button.disabled = false;
    }
  });

  loadReviews();
})();

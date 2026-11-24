(() => {
  const cfg = window.LETWELVE_CONFIG || {};
  const url = String(cfg.SUPABASE_URL || '').trim();
  const key = String(cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_PUBLISHABLE_KEY || '').trim();
  const forms = document.getElementById('authForms');
  const signed = document.getElementById('signedInPanel');
  const form = document.getElementById('accountForm');
  const msg = document.getElementById('accountMsg');
  const submit = document.getElementById('accountSubmit');
  let mode = 'login';
  let client = null;
  const say = (text) => { if (msg) msg.textContent = text; };
  const friendly = (error) => {
    const m = String(error?.message || 'No se ha podido completar la operación.');
    if (/invalid login credentials/i.test(m)) return 'El correo o la contraseña no son correctos.';
    if (/email not confirmed/i.test(m)) return 'Confirma tu correo electrónico antes de iniciar sesión.';
    if (/password should be at least/i.test(m)) return 'La contraseña debe tener al menos 8 caracteres.';
    if (/user already registered/i.test(m)) return 'Este correo ya tiene una cuenta. Prueba a iniciar sesión.';
    return m;
  };
  function showUser(user) {
    if (!user) { forms.hidden = false; signed.hidden = true; return; }
    forms.hidden = true; signed.hidden = false;
    document.getElementById('welcomeUser').textContent = `¡Hola${user.user_metadata?.full_name ? ', ' + user.user_metadata.full_name : ''}!`;
    document.getElementById('signedInEmail').textContent = user.email || '';
  }
  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.tab;
    document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b === button));
    document.getElementById('nameWrap').hidden = mode !== 'register';
    form.elements.password.autocomplete = mode === 'register' ? 'new-password' : 'current-password';
    submit.textContent = mode === 'register' ? 'CREAR CUENTA' : 'INICIAR SESIÓN';
    say(mode === 'register' ? 'Crea tu cuenta con tu nombre, correo y contraseña.' : 'Introduce tu correo y contraseña para acceder.');
  }));
  if (!url.startsWith('https://') || !key || /PON_AQUI|YOUR_|PLACEHOLDER/i.test(url + key)) {
    say('Falta configurar la URL de Supabase y su clave pública en js/config.js. No introduzcas claves secretas aquí.');
    submit.disabled = true;
    return;
  }
  if (!window.supabase?.createClient) { say('No se ha podido cargar el servicio de autenticación. Recarga la página.'); return; }
  client = window.supabase.createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  client.auth.getSession().then(({data,error}) => { if(error) say(friendly(error)); showUser(data?.session?.user || null); });
  client.auth.onAuthStateChange((_event, session) => showUser(session?.user || null));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = String(form.elements.email.value || '').trim().toLowerCase();
    const password = String(form.elements.password.value || '');
    const name = String(form.elements.name?.value || '').trim();
    if (mode === 'register' && !name) { say('Escribe tu nombre para crear la cuenta.'); return; }
    submit.disabled = true; submit.textContent = mode === 'register' ? 'CREANDO…' : 'ENTRANDO…';
    try {
      if (mode === 'register') {
        const {data,error} = await client.auth.signUp({ email, password, options: {
          data: { full_name: name },
          emailRedirectTo: `${location.origin}${location.pathname}`
        }});
        if (error) throw error;
        if (data.session) { showUser(data.user); say('Tu cuenta se ha creado correctamente.'); }
        else say('Te hemos enviado un correo para confirmar tu cuenta. Confirma el email y después inicia sesión.');
      } else {
        const {data,error} = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showUser(data.user); say('Has iniciado sesión correctamente.');
      }
    } catch (error) { say(friendly(error)); }
    finally { submit.disabled = false; submit.textContent = mode === 'register' ? 'CREAR CUENTA' : 'INICIAR SESIÓN'; }
  });
  document.getElementById('forgotPassword').addEventListener('click', async () => {
    const email = String(form.elements.email.value || '').trim().toLowerCase();
    if (!email) { say('Escribe primero tu correo electrónico y vuelve a pulsar aquí.'); return; }
    try {
      const {error} = await client.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}${location.pathname}` });
      if (error) throw error;
      say('Si el correo está registrado, recibirás un enlace para restablecer la contraseña.');
    } catch (error) { say(friendly(error)); }
  });
  document.getElementById('signOut').addEventListener('click', async () => {
    const {error} = await client.auth.signOut();
    if (error) say(friendly(error)); else { showUser(null); say('Has cerrado sesión.'); }
  });
})();

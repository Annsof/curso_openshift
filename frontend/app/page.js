import os from 'os';

// Fuerza render dinámico: cada visita llama a la API (no se cachea).
// Así, al escalar la API, ves cambiar el pod que responde.
export const dynamic = 'force-dynamic';

// La URL de la API llega por variable de entorno (ConfigMap).
// Por defecto usamos el nombre del Service interno de OpenShift.
const API_URL = process.env.API_URL || 'http://capybara-api:8080';

async function getData() {
  const res = await fetch(`${API_URL}/api/capybaras`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`La API respondió ${res.status}`);
  return res.json();
}

export default async function Home() {
  const webPod = os.hostname();
  let data = null;
  let error = null;

  try {
    data = await getData();
  } catch (e) {
    error = e.message;
  }

  return (
    <main className="wrap">
      <header className="hero">
        <img className="foto" src="/capybara.png" alt="Capybara" />
        <h1>Capybara App 🦫</h1>
        <p>Frontend Next.js + API interna, desplegado en OpenShift</p>
      </header>

      <section className="pods">
        <div className="pod">
          <span className="label">Pod del frontend</span>
          <code>{webPod}</code>
        </div>
        <div className="pod">
          <span className="label">Pod de la API</span>
          <code>{data ? data.pod : '—'}</code>
        </div>
      </section>

      {error && (
        <div className="error">
          <strong>No pude hablar con la API.</strong>
          <p>{error}</p>
          <p>
            Revisa que el Service <code>capybara-api</code> esté arriba y que{' '}
            <code>API_URL</code> apunte a él.
          </p>
        </div>
      )}

      {data && (
        <>
          <div className="mensaje">{data.mensaje}</div>
          <p className="secreto">
            Secreto cargado desde el Secret:{' '}
            <strong>{data.secretoCargado ? 'sí ✅' : 'no ❌'}</strong>
          </p>

          <h2>Datos curiosos de capybaras</h2>
          <ul className="cards">
            {data.capybaras.map((c, i) => (
              <li key={i} className="card">
                <span className="num">{i + 1}</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <footer>
        <p>
          Recarga la página tras escalar la API (<code>oc scale</code>) y verás
          cómo cambia el pod que responde.
        </p>
      </footer>
    </main>
  );
}

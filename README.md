# Capybara App 🦫 — práctica de OpenShift

App para practicar OpenShift de punta a punta: un **frontend** (Next.js) que llama a una
**API interna** (Node + Express). Pensada para el **Developer Sandbox**.

## Arquitectura

```
Cliente  →  Route  →  Service capybara-web  →  Deployment web (Next.js)
                                                      │  (desde el pod, por DNS interno)
                                                      ▼
                                   Service capybara-api (ClusterIP)  →  Deployment API
```

- El **frontend** es el único expuesto al exterior (Route).
- La **API** solo es accesible dentro del cluster (ClusterIP). El frontend la llama
  por su nombre de Service: `http://capybara-api:8080`.

## Qué practicas con esta app

- Despliegue en **tres modos**: S2I, Dockerfile y YAML.
- **Service interno (ClusterIP)** y comunicación pod-a-pod por DNS.
- **Route** (acceso externo por URL).
- **ConfigMap** y **Secret** como variables de entorno.
- **Escalado** y balanceo (ves qué pod responde).
- **Liveness / Readiness probes**.

## Estructura

```
curso_openshift/
├── backend/      API Express (puerto 8080)
├── frontend/     Next.js (puerto 8080)
└── openshift/    Manifiestos YAML (ConfigMap, Secret, Deployment, Service, Route)
```

## Requisitos

- Cuenta en el **Developer Sandbox** y sesión iniciada con `oc` (usa *Copy login command* desde la consola).
- Este repo subido a GitHub: `https://github.com/Annsof/curso_openshift.git`
- El cliente `oc` instalado.

> En el Sandbox solo tienes permisos de **developer**: todos estos pasos funcionan sin admin.
> Las imágenes usan puerto 8080 y usuario no-root, así que **no** hace falta el comando `oc adm` del curso.

---

## Paso 0 — Subir el código a GitHub

```bash
git init
git add .
git commit -m "feat: capybara app para practicar OpenShift"
git branch -M main
git remote add origin https://github.com/Annsof/curso_openshift.git
git push -u origin main
```

---

## Opción A — Despliegue rápido con S2I (recomendada en el Sandbox)

S2I construye la imagen a partir de tu código + un *builder* de Node.

```bash
# 1) La API (builder de Node, carpeta backend)
oc new-app nodejs~https://github.com/Annsof/curso_openshift.git \
  --context-dir=backend --name=capybara-api

# 2) El frontend (carpeta frontend)
oc new-app nodejs~https://github.com/Annsof/curso_openshift.git \
  --context-dir=frontend --name=capybara-web

# Seguir los builds
oc get builds
oc logs -f bc/capybara-api
oc logs -f bc/capybara-web
```

Cada `oc new-app` crea **ImageStream + Deployment + Service**.

### Configuración y secreto de la API

```bash
oc create configmap capybara-api-config \
  --from-literal=APP_MENSAJE="¡Hola capybaras desde OpenShift! 🦫"

oc create secret generic capybara-api-secret \
  --from-literal=API_SECRETO="token-super-secreto"

# Inyectarlos como variables de entorno en el Deployment de la API
oc set env deploy/capybara-api --from=configmap/capybara-api-config
oc set env deploy/capybara-api --from=secret/capybara-api-secret
```

### Conectar el frontend con la API

```bash
oc set env deploy/capybara-web API_URL=http://capybara-api:8080
```

`capybara-api` es el nombre del **Service**; dentro del cluster se resuelve por DNS.

### Exponer SOLO el frontend

```bash
oc expose svc/capybara-web
oc get route capybara-web      # copia el HOST
```

Ábrelo en el navegador con `http://` delante. ¡Deberías ver los capybaras! 🦫

---

## Opción B — Desde Dockerfile

Cada carpeta trae su `Dockerfile` (imágenes UBI de Red Hat, no-root):

```bash
oc new-app https://github.com/Annsof/curso_openshift.git \
  --context-dir=backend --strategy=docker --name=capybara-api

oc new-app https://github.com/Annsof/curso_openshift.git \
  --context-dir=frontend --strategy=docker --name=capybara-web
```

Luego repite los pasos de ConfigMap/Secret, `API_URL` y `oc expose` de la Opción A.

---

## Opción C — Declarativo con YAML

Cuando S2I (o Dockerfile) ya haya construido las imágenes, tienes los ImageStreams en el
registro interno. Ahora puedes desplegar con tus propios manifiestos:

```bash
oc project -q        # te dice el nombre de tu proyecto

# Edita openshift/capybara-api.yaml y openshift/capybara-web.yaml
# y reemplaza TU-PROYECTO por ese nombre. Luego:
oc apply -f openshift/capybara-api.yaml
oc apply -f openshift/capybara-web.yaml
```

Los YAML ya incluyen el ConfigMap, el Secret, las probes y la Route.

---

## Probar el escalado y el balanceo

```bash
oc scale deploy/capybara-api --replicas=3
oc get pods
```

Recarga la web varias veces: el **"Pod de la API"** que aparece va cambiando, porque el
Service reparte el tráfico entre las réplicas.

## Probar las probes

```bash
oc get pods          # mira la columna READY
oc describe deploy/capybara-api   # verás Liveness y Readiness
```

- API: `/health` (liveness), `/ready` (readiness).
- Web: `/api/health`, `/api/ready`.

## Limpiar todo

```bash
oc delete all -l app=capybara-api
oc delete all -l app=capybara-web
oc delete configmap/capybara-api-config configmap/capybara-web-config
oc delete secret/capybara-api-secret
```

---

## Notas del Developer Sandbox

- Solo permisos de **developer**; nada de esto necesita admin.
- Los pods **se duermen** por inactividad: la primera carga tras un rato puede tardar.
- No usamos almacenamiento persistente (PVC) para no gastar los *storage claims*.
- El entorno se borra a los 30 días; puedes pedir otro trial.

## Correr en local (opcional, sin OpenShift)

```bash
# Terminal 1
cd backend && npm install && npm start      # API en http://localhost:8080

# Terminal 2
cd frontend && npm install \
  && API_URL=http://localhost:8080 npm run dev   # web en http://localhost:8080
```

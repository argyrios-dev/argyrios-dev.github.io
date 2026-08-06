# argyrios-dev — Portafolio de proyectos

Portafolio estático y manual para los proyectos públicos de
[`argyrios-dev`](https://github.com/argyrios-dev).

La web presenta actualmente:

- [BridgeLock](https://github.com/argyrios-dev/BridgeLock)
- [AirControll](https://github.com/argyrios-dev/AirControll)

## Por qué esta versión es manual

La web no consulta la API de GitHub y no necesita GitHub Actions.

Esto evita:

- Límites de la API.
- Errores por peticiones anónimas.
- Dependencias de JavaScript remoto.
- Tarjetas incompletas por metadatos inesperados.
- Cambios automáticos en la presentación.

Cada proyecto se añade de forma manual para controlar:

- Miniatura.
- Icono.
- Descripción.
- Etiquetas.
- Enlace a la web.
- Enlace al código.
- Enlace a releases.

## Archivos

```text
argyrios-dev.github.io/
├── index.html
└── README.md
```

No necesita CSS, JavaScript, Node.js ni dependencias adicionales. Los estilos y
el pequeño script de animación están incluidos dentro de `index.html`.

## Publicar con GitHub Pages

Crea o utiliza el repositorio:

```text
argyrios-dev.github.io
```

Coloca `index.html` y `README.md` en la raíz de la rama `main`.

Después abre:

```text
Settings → Pages
```

Selecciona:

```text
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

La web se publicará en:

```text
https://argyrios-dev.github.io/
```

## Subir desde Terminal

```zsh
cd ~/Downloads
unzip -o argyrios-dev-proyectos-manual.zip
cd argyrios-dev-proyectos-manual

git init
git branch -M main
git add index.html README.md
git commit -m "Create manual projects portfolio"
git remote add origin https://github.com/argyrios-dev/argyrios-dev.github.io.git
git push -u origin main
```

Cuando el repositorio ya está clonado:

```zsh
cp ~/Downloads/argyrios-dev-proyectos-manual/index.html \
  ~/Downloads/argyrios-dev.github.io/index.html

cp ~/Downloads/argyrios-dev-proyectos-manual/README.md \
  ~/Downloads/argyrios-dev.github.io/README.md

cd ~/Downloads/argyrios-dev.github.io
git add index.html README.md
git commit -m "Use manual BridgeLock and AirControll portfolio"
git push
```

## Miniaturas utilizadas

BridgeLock:

```text
https://raw.githubusercontent.com/argyrios-dev/BridgeLock/main/IntroREADME.png
```

AirControll:

```text
https://raw.githubusercontent.com/argyrios-dev/AirControll/main/IntroREADME.png
```

Los iconos también se cargan directamente desde cada repositorio.

## Añadir otro proyecto manualmente

En `index.html`, busca:

```html
<div class="projects-grid">
```

Copia uno de los bloques completos:

```html
<article class="project-card reveal">
  ...
</article>
```

Después cambia:

- Nombre del proyecto.
- Descripción.
- URL de la miniatura.
- URL del icono.
- Enlace de la web.
- Enlace del repositorio.
- Enlace de releases.
- Etiquetas.

Actualiza también este contador del hero:

```html
<strong>2</strong>
```

Por ejemplo, al añadir el tercer proyecto:

```html
<strong>3</strong>
```

## Dependencias

Ninguna.

La web utiliza exclusivamente:

- HTML.
- CSS nativo.
- JavaScript nativo.
- Imágenes públicas alojadas en los repositorios.

## Privacidad

La web no contiene:

- Analytics.
- Cookies.
- API de GitHub.
- Tokens.
- Seguimiento.
- Formularios.
- Peticiones a servicios de terceros, salvo las imágenes públicas de GitHub.

## Personalización

Los colores principales se encuentran al principio de `index.html`:

```css
:root {
  --bg: #05070d;
  --violet: #9b8cff;
  --cyan: #72dbff;
  --green: #67e6a3;
}
```

El favicon actual utiliza la imagen de perfil de `argyrios-dev`. Puede cambiarse
modificando:

```html
<link
  rel="icon"
  type="image/png"
  href="https://github.com/argyrios-dev.png"
>
```

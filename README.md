# Wrigley Wind

A lightweight static website that shows whether the wind is blowing in, out, or across Wrigley Field right now, plus the next few hours.

## What it does

- Pulls current and hourly weather from Open-Meteo
- Uses Wrigley Field coordinates
- Converts wind direction from “coming from” to “blowing toward”
- Compares wind direction against a configurable center-field bearing
- Shows:
  - Current wind label
  - Wind speed and gusts
  - Effective out-to-CF component
  - Next 12 hourly forecast cards
  - Simple field graphic with wind arrow

## Run locally

Open `index.html` in your browser.

For the most realistic local test, run a tiny local server:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Publish on GitHub Pages

1. Create a new GitHub repository, for example `wrigley-wind`.
2. Upload these files to the root of the repo:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
3. In GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, choose:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/root**
5. Save.
6. GitHub will publish the site at a URL like:

```text
https://YOUR-USERNAME.github.io/wrigley-wind/
```

## Configuration

In `app.js`, you can adjust this value:

```js
centerFieldBearing: 50
```

That bearing controls how the app decides whether wind is blowing out to center field or in from center field. Increase or decrease it slightly if you want to tune the direction against a satellite view or your preferred definition of Wrigley’s center-field orientation.

## Notes

Weather APIs generally report the direction the wind is coming from. Baseball fans usually care where the wind is going. This app converts the weather API direction like this:

```js
const windTo = (windFrom + 180) % 360;
```

Then it calculates the component of that wind blowing toward center field.

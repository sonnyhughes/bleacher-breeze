# Bleacher Breeze

A lightweight static website for GitHub Pages that shows whether the wind is blowing in, out, or across Wrigley Field right now, plus forecast trends for the next 12 hours.

## What's included

- Modern, refined weather-app layout with a 1914 Club / Chicago Athletic Association feel
- Larger Wrigley Field visual as the main focal point
- Current Wrigley Field wind direction
- Wind speed, gusts, temperature, and sky conditions
- Short carry / crosswind summaries
- Vintage-color Wrigley Field artwork with a Cubs-blue arrow treatment
- Minimal 12-hour forecast graphs:
  - Temperature
  - Wind speed
  - Wind gusts

## Files

- `index.html`
- `styles.css`
- `app.js`
- `wrigley-vintage-color.png`
- `README.md`

## Publish on GitHub Pages

1. Create a new GitHub repository, for example `bleacher-breeze`.
2. Upload all files from this folder to the root of the repo.
3. In GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, choose:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/root**
5. Save.

Your site should publish at:

`https://YOUR-USERNAME.github.io/bleacher-breeze/`

## Configuration

In `app.js`, you can adjust:

```js
centerFieldBearing: 50
```

That value controls how the app decides whether the wind is blowing out to center field or in from center field.

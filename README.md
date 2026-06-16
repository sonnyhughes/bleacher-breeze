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


## Estimated feet

This version keeps the last working weather-loading code and only updates the carry / crosswind labels to estimated feet.

The app uses this simple fan-facing rule of thumb:

```js
const FEET_PER_MPH_CARRY = 3.8;
```

That means:
- `Carry: +23 ft` means the wind may add roughly 23 feet to a well-hit fly ball toward center field.
- `Carry: −23 ft` means the wind may knock off roughly 23 feet.
- `Side drift: ~10 ft R → L` means the wind may push the ball sideways about 10 feet from right to left.

This is intentionally approximate. Actual batted-ball distance depends on exit velocity, launch angle, spin, spray angle, temperature, humidity, air density, and how wind behaves above the field.


## Auto-refresh

The page auto-updates every 10 minutes using:

```js
setInterval(loadWeather, REFRESH_INTERVAL_MS);
```

The refresh button remains available for manual updates.


## Chart label placement

The chart labels intentionally skip the first plotted point so the value label does not crowd the y-axis labels. The first visible value label appears around the 4th plotted hour instead.


## Scrollable mobile charts

On small screens, each forecast chart uses a wider internal SVG and horizontal scrolling. This keeps roughly the next 4–6 hours visible at once, while allowing the user to scroll sideways to see the full 12-hour trend.

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


## Fixed chart indicator placement

Forecast chart value labels are shown at consistent positions across all three graphs:
- 4th plotted point
- 8th plotted point
- final plotted point


## Gold SVG arrow

This version replaces the map arrow with a thinner modern SVG line arrow in muted gold. It fits the club-like look a bit better than a bright white arrow or a text-style Unicode glyph.


## Slightly larger gold arrow

This version keeps the same thin modern gold SVG arrow, but scales it up slightly so it reads a bit more clearly over the field image.


## Lighter gold arrow
This version keeps the same larger thin SVG arrow, but uses a lighter champagne-gold tone.


## Heavier lighter gold arrow

This version keeps the lighter champagne-gold arrow, but adds a little more weight so it reads more clearly over the field image.


## Shorter shaft, bigger overall arrow

This version shortens the arrow shaft by about 25% while making the arrow feel larger overall with a heavier stroke and a bigger arrowhead.


## Current card layout

The wind direction headline now sits above the Wrigley image, while the updated time and refresh button sit below the metrics cards.


## Friendly wind direction copy

The main wind readout now uses a friendlier two-line format:

- **Blowing Out** / Toward center field
- **Blowing In** / Toward home plate
- **Left to Right** / Across the field
- **Right to Left** / Across the field

The headline above the Wrigley image is left-aligned in landscape layouts, and the arrow neck now connects cleanly into the arrowhead.


## Landscape layout swap

On wider screens, the wind headline and Wrigley map now appear on the left, while the metrics cards and refresh controls appear on the right.


## Portrait order fix

On portrait / narrow screens, the current card now flows in this order:
1. hero and map
2. metrics cards
3. updated time and refresh button

On wider landscape layouts, the map remains on the left and the metrics remain on the right.


## Air Feel metric

The app keeps **Carry** and **Side Drift** as the primary wind-impact cards. The former **Sky** card is now **Air Feel**, a simple secondary context indicator based on temperature, dew point, and surface pressure:

- **Slight carry**: warmer and/or lower-pressure air
- **Neutral**: mixed or ordinary conditions
- **Heavy air**: colder and/or higher-pressure air

This is intentionally a fan-facing context label, not a precise physics model. Wind-based **Carry** and **Side Drift** remain the primary batted-ball indicators.


## Conservative carry estimates and Air Density

Carry and Side Drift now use a more conservative estimate of **2 feet per mph** of wind component, rounded to the nearest 5 feet and displayed with `~` to make it clear these are directional estimates.

The former **Air Feel** card is now **Air Density**. It is intentionally independent from wind and uses only temperature, dew point, and surface pressure:

- **Slight carry**: warmer and/or lower-pressure air
- **Neutral**: mixed or ordinary conditions
- **Heavy air**: colder and/or higher-pressure air

This avoids double-counting wind: **Carry** remains the wind-based estimate, while **Air Density** is the non-wind atmosphere context.


## Carry display cleanup

The carry and side-drift estimates still use the conservative 2 feet per mph factor and round to the nearest 5 feet, but the `~` prefix has been removed for a cleaner card display.

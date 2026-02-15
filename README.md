**Two 12 by 12 Game Boards**

- Make **two** square grids, each with 12 rows and 12 columns of small tiles.
- One grid shows **your ships** (your own board).
- The other grid shows **where you attack the opponent** (the firing/target board).
- Space the tiles evenly in each grid so they line up perfectly in rows and columns.
- **Use Flex or Grid depending on which group you were assigned to.**
- Place the two grids side by side or one above the other (your choice on layout).
- Center everything nicely on the page.
- On your ships grid: Color some tiles (e.g., dark gray or navy) to show example ship positions.
- On the firing grid: Color a few tiles (e.g., bright red) to show example hits on the opponent.
- **Apply SCSS use variables, mixins and operators**
- **Add a dark theme and light theme option**
- (Extra if you want: Use a different color or a simple “X” on some tiles in either grid to show misses or empty water.)

**Navigation Bar**

- Add a simple bar with two links: “Game” and “Match History”.
- Put the bar wherever you like (top, bottom, side—your choice).
- Game” can stay on the same page for now.
- “Match History” can link to a blank section or second page that says “Match history coming soon…”.

**New Changes** 6 FEB

- Use NPM Registry to check for possible cool packages that can help spice up your battleship game.
- Separate your project into modules where you think it makes sense, if it is needed..
- your app should be Mobile first design
- build a js service file with placeholders for different http calls
- Implement vite into your project
- make use of Higher order functions, arrow functions and Anonymous functions where it makes sense
- Implement Eslint & prettier into your project
- X-axis (columns): Letters A through L (12 columns)
- Y-axis (rows): Numbers 1 through 12 (12 rows)
- Examples of Valid Coordinates
- A1 - Top-left corner
- L12 - Bottom-right corner
- F6 - Middle of the board
- K2 - Column K, row 2
- COORDINATES ARE VERY IMPORTANT FOR BACKEND USE.

**Expectation before features**

- Make sure before implementing a new feature or tool, make sure your project is working!
- Remember to branch off of your branch for each new feature and commit! Merge that branch into your main branch.
- Styling is important but functionality takes priority
- Extra time left?
- Play around with animations (CSS or JS)
- Implement some Shadow or Virtual DOM functionality

Levels of finding a solution for your problem

- Modify code and try to understand it
- Google the problem
- prompt AI on the topic (Ask for explanations not copy and paste code)
- Ask Seniors advice

# Project Setup

## Setup

> Credit: https://www.geeksforgeeks.org/javascript/how-to-set-up-vite-with-eslint-and-prettier/

### 1. Create a Vite App

```bash
npm create vite@latest my-vite-app
cd my-vite-app
npm install
```

### 2. Install ESLint and Prettier

```bash
npm install eslint prettier eslint-config-prettier eslint-plugin-prettier --save-dev
```

### 3. Configure ESLint

Create an `.eslintrc.json` file in the project root:

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "prettier/prettier": [
      "error",
      {
        "singleQuote": true,
        "semi": false
      }
    ]
  }
}
```

### 4. Configure Prettier

Create a `.prettierrc` file in the project root:

```json
{
  "singleQuote": true,
  "semi": false
}
```

### 5. Add NPM Scripts

Update your `package.json` with the following scripts:

```json
"scripts": {
  "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
  "format": "prettier --write ."
}
```

### 6. Run Linting and Formatting

```bash
npm run lint
npm run format
```

---

## Project structure and conventions

Multipage app kept for now (index.html, lobby.html, history.html). Source code is organized by concern.

````text
.
├── docs/
│   └── server.md
├── public/                  # static files copied as-is
├── scripts/
│   └── mockServer.js        # local mock WebSocket server
├── src/
│   ├── app/
│   │   └── main.js          # game bootstrap and gameplay wiring
│   ├── components/          # web components
│   │   ├── active-players.js
│   │   ├── login-screen.js
│   │   └── ship-selector.js
│   ├── game/                # domain logic
│   │   ├── boardLogic.js
│   │   └── shipLogic.js
│   ├── network/             # networking
│   │   ├── websocketClient.js
│   │   └── wsSession.js
│   ├── pages/               # page-specific logic
│   │   └── lobby.js
│   ├── assets/              # images/fonts imported from JS/CSS
│   └── styles/              # SCSS entry + partials (see below)
│       ├── style.scss       # entry that composes partials
│       ├── _variables.scss
│       ├── _mixins.scss
│       ├── base/_root.scss
│       ├── layout/_nav.scss
│       ├── components/_buttons.scss
│       ├── components/_board.scss
│       ├── components/_login-overlay.scss
│       ├── components/_players.scss
│       └── pages/(_game.scss, _lobby.scss)
├── index.html               # routes: #game, #lobby, #history
├── lobby.html               # kept for now (alternative entry)
├── history.html             # kept for now (alternative entry)
└── dist/                    # build output (ignored)
````

### Styles (SCSS)
- style.scss is the single entry and composes modules using Sass `@use`.
- Partials live under src/styles; import tokens as needed:

````scss
/* Example usage inside a partial */
@use '../variables' as *;
@use '../mixins' as *;

.button { @include button-base; }
````

Add new partials under components/, layout/, pages/, etc., and reference them from style.scss with `@use './path/to/partial';`.

### Mock server
- Toggle mock mode with either `?mock=1` in the URL or `localStorage.setItem('mock','1')`.
- When enabled, `src/network/wsSession.js` instantiates `scripts/mockServer.js` instead of a real WebSocket.

### Theming
- `data-theme` attribute is set on `<html>` and persisted to localStorage. The toggle button `#theme-toggle` flips between dark/light.
- Theme token `--bg` is defined in base/_root.scss.

### Assets
- Put files you import from JS/CSS in `src/assets/` so Vite can fingerprint and bundle them.
- Use `public/` for files that must keep their exact path/name and are not imported by code (e.g., favicon, robots.txt).

### Next steps (optional)
- If you want lobby.html and history.html emitted as separate HTML files in production, add a Vite multi-page input config. Otherwise, index.html with hash routes is sufficient.

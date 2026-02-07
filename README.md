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

Levels of  finding a solution for your problem
- Modify code and try to understand it
- Google the problem
- prompt AI on the topic (Ask for explanations not copy and paste code)
- Ask Seniors advice
 
Setup

Vite
```
npm create vite@latest my-vite-app
   cd my-vite-app
   npm install
```


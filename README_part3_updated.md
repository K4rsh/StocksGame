## A repository for CS3100 term project

### Project Part-3: Client-side implementation with updated unit tests

#### Stock Trading Game - Front End

Link to the video: <video controls src="https://www.dropbox.com/scl/fi/41bi2hqywtugi5hhpedkn/stock-trading_game-final-copy.mp4?rlkey=nisztu4q5z3pveum9huo34cbk&dl=0" title="Stock-Trading-Game"></video>

I've uploaded the video to dropbox and made sure everyone is able to access the video. Just in case there is any access issue, pl contact me at my email: uupreti@mun.ca or utkarshupretixvi@gmail.com

This is a simple stock trading game implemented in HTML, CSS, and JavaScript. The game allows users to register, login, create games, buy and sell stocks, and view their portfolio, declaring the winner at the end based on the total value of their portfolio and remaining purse amount.

## File Structure

The project consists of a single HTML file (`index.html`), a CSS file (`styles.css`), and uses the `page.js` library for routing.

## HTML Structure (`index.html`)

The HTML file is structured as follows:

- A `head` section that includes the title of the page, a link to the CSS stylesheet, and a script tag to include the `page.js` library.
- A `body` section that includes:
  - A header displaying the title of the game.
  - A registration form where users can enter their username and password, and specify whether they are an admin.
  - A login form where users can enter their username and password to login.
  - A form to create a new game, which includes a field for entering player usernames separated by commas.
  - A form to search for a player by their username.
  - A section to display the user's portfolio, which includes information about their stocks and purse.
  - A form to buy or sell stocks, which includes fields for the stock symbol and quantity.
  - A logout button.

## CSS Styling (`styles.css`)

The CSS file includes styles for the body, headers, forms, and buttons. It also includes styles for specific elements such as the portfolio section and the winner message. I experimented with several styling themes but finally went for a simple black-yellow contrast theme, as the color contrast stands out a lot, making sure the color of the buttons changes to a more lighter/darker shade of the color when hovering or clicking on the button.

## JavaScript Functionality

The JavaScript code in the HTML file provides the functionality for the game. It includes event listeners for form submissions and button clicks, functions to update the portfolio and fetch stock prices, and routing for different pages.

## Routes

The game includes the following routes:

- `/register`: Registers a new user.
- `/login`: Logs in a user.
- `/games`: Creates a new game.
- `/profile`: Fetches a user's profile.
- `/games/:gameId/buy`: Buys stocks.
- `/games/:gameId/sell`: Sells stocks.
- `/games/:gameId/winner`: Declares the winner of a game.
- `/stock-price`: Fetches the price of a stock, along with other basic stock information returned by the StockAPI calls.

## Usage

To use the game, open, go to http://localhost:3000 in your web browser. You can register as a new user, login, create a game, buy and sell stocks, and view your portfolio; while the admin can create a new game, selecting the desired users as players; and declares the winner of the game.

### Project Part-2: Server-side implementation with client-side test cases

The server provides several routes (updated):

* /register: This route allows users to register. It creates a new User document and returns a JWT token for authentication.

* /login: This route allows users to login. It checks the User document for the provided username and password, and if they match, it returns a JWT token which confirms the identity of the player with the server and redirects them to the appropriate Player or Admin form.

* /games: This route allows admins to start a new game. It creates a new Game document with the specified players and returns the game. Only the admin has the power to create a new game.

* /profile: This route allows users to view a player's profile. It returns the Player document for the specified player ID.

* /games/:gameId/buy: This route allows players to buy stocks. It updates the player's cash and portfolio and returns the updated game.

* /games/:gameId/sell: This route allows players to sell stocks. It updates the player's cash and portfolio and returns the updated game.

* /games/:gameId/portfolio: This route allows users to view a player's portfolio. It returns the player's portfolio.

* /games/:gameId/winner: This route allows users to view the winner of a game. It calculates the total value of each player's portfolio and returns the player with the highest total value.

* The code also includes a getStockPrice function that fetches the current price of a stock from the Alpha Vantage API. The key for the API is included within the server app.mjs itself. In case there are some issues with the key, you can always get a new key for the API calls from online at no additional cost.

For any reason the given API key does not work, a new one is readily available at their websitefor free: https://www.alphavantage.co/support/

Then there is the Test.mjs file under the Tests file. 
Command used to start the tests: npx mocha --require esm tests/test.mjs


* Test the /register route: This test case checks if the /register route correctly creates a new user and returns a token. It tests this for both an admin user and two player users. Once again, Make sure the database is empty and ther are no previous username

* Test the /games route: This test case checks if the /games route correctly creates a new game when provided with valid input. It checks if the response has the correct status code, properties, and structure.

* Test the /profile route: This test case checks if the /profile route correctly returns a player object when provided with a valid player ID, along with a valid portfolio object and cash object of the player.

* Test the /games/:gameId/buy route: This test case checks if the /games/:gameId/buy route correctly updates a game when a player buys stocks. It checks if the response has the correct status code and properties.

* Test the /games/:gameId/sell route: This test case checks if the /games/:gameId/sell route correctly updates a game when a player sells stocks. It checks if the response has the correct status code and properties.

* Test the /games/:gameId/portfolio route: This test case checks if the /games/:gameId/portfolio route correctly returns a portfolio object when provided with a valid game ID and token.

* Test the /games/:gameId/winner route: This test case checks if the /games/:gameId/winner route correctly returns a winner object when provided with a valid game ID.

NOTE:
1. Make sure the databases are empty before the testing is done!: IF there are any users with similar usernames, they may clash in the /register and further /games route, causing the tests to fail. You can even delete the database if needed as mongo will automatically create a new one and this avoids confusion too. I have also added error detection in the /register method to prevent registering for players with the same usernames. 

2. The only decent StockAPI I found was Alpha Vantage and it does a decent job of getting the stock prices with all the information. The free service only provides global qutoes which send the stock information for the previous open day. To get real-time access you need to pay for the premium service. On top of that, The free API key only allows upto 25 API calls in a day. So for any reason, The API key does not work and we do not get the expected output, I have console.logged the response from the stock API calls just to be sure if the received response from the api calls is correct or not.



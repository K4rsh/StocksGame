import express, { response } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import axios from 'axios';
import jwt from 'jsonwebtoken';

// Your dedicated access key for Alpha Vantage StockAPI is: XM6EAT8Y2HBCKKKG
//For any reason this key does not work, a new one is readily available at their website, link in the README.md file.
async function getStockPrice(symbol) {
  console.log('Getting stock price for the symbol: ', symbol);
  try {
    const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=XM6EAT8Y2HBCKKKG`);
    console.log(response.data);
    if (response.data['Global Quote']) {
      return response.data['Global Quote']['05. price'];
    } else {
      throw new Error('Failed to get stock price.');
    }
  } catch (error) {
    console.log(error);
    throw new Error('Failed to get stock price.');
  }
}

const port = 3000;
const app = express();
app.use(express.static('public'));

mongoose.connect('mongodb://localhost/stock-trading-game');
app.use(bodyParser.json());

// Models
const Player = mongoose.model('Player', new mongoose.Schema({
  name: String,
  cash: Number,
  portfolio: {type: Object, default: {}},
}));

const Game = mongoose.model('Game', new mongoose.Schema({
  players: [Player.schema],
  winner: Player.schema,
}));

const User = mongoose.model('User', new mongoose.Schema({
  username: {type: String, unique:true},
  password: String,
  isAdmin: Boolean,
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: false },
  token: String,
}, {versionKey: false}));


//NOTE: Make sure the database is empty before running the tests to avoid same username conflicts. This may lead to the /register and /games route tests to fail.
app.post('/register', async (req, res) => {
  try {
    const user = new User({ username: req.body.username, password: req.body.password, isAdmin: req.body.isAdmin });

    await user.save();

    const token = jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, 'YOUR_SECRET_KEY');

    user.token = token;
    await user.save();
    res.send({ token });

  } catch (error) {
    console.log('Error in /register:', error);
    if (error.code === 11000) {
      res.status(400).send('Username already exists. Please clear out the database and try again.');
    } else {
      res.status(500).send('Internal server error.');
    }
    throw error; // Re-throw the error to cause the test to fail
  }
});

app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || user.password !== req.body.password) {
      return res.status(401).send('Invalid username or password.');
    }

    const token = jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, 'YOUR_SECRET_KEY');
    res.send({ token });
  } catch (error) {
    console.log('Error in /login:', error);
    res.status(500).send('Internal server error.');
  }
});

// Get current user route
app.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const data = jwt.verify(token, 'YOUR_SECRET_KEY');
    const user = await User.findById(data._id);
    res.send(user);
  } catch (error) {
    console.log('Error in /me:', error);
    res.status(500).send('Internal server error.');
  }
});

// Games route
app.post('/games', async (req, res) => {
  try {
    // Verify the token and get the user ID
    const token = req.header('Authorization').replace('Bearer ', '');
    const data = jwt.verify(token, 'YOUR_SECRET_KEY');
    const userId = data._id;

    // Find the user
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).send('Only admins can start a new game.');
    }

    // Find the players
    const playerUsernames = req.body.players;
    const users = await User.find({ 'username': { $in: playerUsernames } });
    if (users.length !== playerUsernames.length) {
      return res.status(400).send('Some players not found.');
    }

    // Create Player documents for the users
    const players = users.map(user => new Player({ name: user.username, cash: 10000, portfolio: {} }));

    // Save the Player documents and update the corresponding User documents
    for (let i = 0; i < users.length; i++) {
      await players[i].save();
      users[i].player = players[i]._id;
      await users[i].save();
    }

    // Create a new game with the players
    const game = new Game({ players });

    // Save the game and the players
    await Promise.all(players.map(player => player.save()));
    await game.save();

    res.send(game);
  } catch (error) {
    res.status(500).send('Internal server error.');
    console.log(error);
    throw error;
  }
});

app.get('/profile', async (req, res) => {

  try {
    // Find the player
    const playerId = req.query.playerId;

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).send('Player not found.');
    }
    res.send(player);
  } catch (error) {
    res.status(500).send('Internal server error.');
  }
});

app.post('/games/:gameId/buy', async (req, res) => {
  
  const token = req.header('Authorization').replace('Bearer ', '');
  const data = jwt.verify(token, 'YOUR_SECRET_KEY');
  const userId = data._id;

  const user = await User.findById(userId).populate('player');
  let game = await Game.findById(req.params.gameId).populate('players');
  if (!user || !game) {
    return res.status(404).send('User not found.');
  }

  //To check if the user is a player in the game
  let player = game.players.id(user.player._id);
  if (!player) {
    return res.status(403).send('User is not a player in this game.');
  }

  const symbol = req.body.symbol;
  const shares = req.body.shares;

  if (!player || !player.portfolio) {
    return res.status(400).send('Player or player portfolio not found.');
  }

  const price = await getStockPrice(symbol);
  const cost = shares * price;

  
  if (player.cash < cost) {
    return res.status(400).send('Insufficient funds to make the purchase.');
  }

  await Player.updateOne(
    { _id: player._id },
    {
      $inc: {
        cash: -cost,
        [`portfolio.${symbol}`]: shares,
      },
    }
  );

  // Update the Player subdocument in the Game document
  await Game.updateOne(
    { _id: game._id, 'players._id': player._id },
    {
      $inc: {
        'players.$.cash': -cost,
        [`players.$.portfolio.${symbol}`]: shares,
      },
    }
  );

  // Fetch the game object from the database again
  game = await Game.findById(req.params.gameId).populate('players');



  await game.save();
  res.send(game);
});


app.post('/games/:gameId/sell', async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  const data = jwt.verify(token, 'YOUR_SECRET_KEY');
  const userId = data._id;

  const user = await User.findById(userId).populate('player');
  let game = await Game.findById(req.params.gameId).populate('players');
  if (!user || !game) {
    return res.status(404).send('User not found.');
  }

  //To check if the user is a player in the game
  let player = game.players.id(user.player._id);
  if (!player) {
    return res.status(403).send('User is not a player in this game.');
  }

  const symbol = req.body.symbol;
  const shares = req.body.shares;
  const price = await getStockPrice(symbol);
  const cost = shares * price;

  //To verify whether the player has enough shares to sell
  if (!player.portfolio[symbol] || player.portfolio[symbol] < shares) {
    return res.status(400).send('Not enough shares to sell.');
  }

  await Player.updateOne(
    { _id: player._id },
    {
      $inc: {
        cash: +cost,
        [`portfolio.${symbol}`]: -shares,
      },
    }
  );

  // Update the Player subdocument in the Game document
  await Game.updateOne(
    { _id: game._id, 'players._id': player._id },
    {
      $inc: {
        'players.$.cash': +cost,
        [`players.$.portfolio.${symbol}`]: -shares,
      },
    }
  );

  // Fetch the game object from the database again
  game = await Game.findById(req.params.gameId).populate('players');


  await game.save();
  res.send(game);
});

app.get('/games/:gameId/portfolio', async (req, res) => {
  
  const token = req.header('Authorization').replace('Bearer ', '');
  const data = jwt.verify(token, 'YOUR_SECRET_KEY');
  const userId = data._id;

  const user = await User.findById(userId);
  const game = await Game.findById(req.params.gameId);
  if (!user || !game) {
    return res.status(404).send('User or game not found.');
  }

  // Check if the user has a player field
  if (!user.player && !user.isAdmin) {
    return res.status(400).send('User does not have a player field or is not an admin.');
  }

  let player;
  if (user.isAdmin) {
    // If the user is an admin, they can view any player's portfolio
    const playerName = req.body.playerName;
    player = game.players.find(p => p.name === playerName);
    if (!player) {
      return res.status(404).send('Player not found.');
    }
  } else {
    // If the user is not an admin, they can only view their own portfolio
    player = game.players.id(user.player._id);
    if (!player) {
      return res.status(403).send('User is not a player in this game.');
    }
  }

  // Send the player's portfolio as the response
  res.send(player.portfolio);
});

app.get('/games/:gameId/winner', async (req, res) => {
  // Find the game
  const game = await Game.findById(req.params.gameId);
  if (!game) {
    return res.status(404).send('Game not found.');
  }

  // If there are no players in the game
  if (game.players.length === 0) {
    return res.status(400).send('No players in the game.');
  }

  // Calculate the total value of each player's portfolio
  const playerValues = await Promise.all(game.players.map(async player => {
    let totalValue = player.cash;
    for (const [symbol, shares] of Object.entries(player.portfolio)) {
      const price = await getStockPrice(symbol); // getStockPrice function gets the current price of a stock
      totalValue += price * shares;
    }
    return { name: player.name, totalValue };
  }));

  // Find the player(s) with the highest total value
  const maxTotalValue = Math.max(...playerValues.map(player => player.totalValue));
  const winners = playerValues.filter(player => player.totalValue === maxTotalValue);

  // If there's a draw
  if (winners.length > 1) {
    return res.send({ message: 'There is a draw.', winners });
  }

  // Send the winner as the response
  res.send(winners[0]);
});

app.listen(port, () => {
  console.log(`Server running on port ${port} at http://localhost:${port}/`);
});

export default app;

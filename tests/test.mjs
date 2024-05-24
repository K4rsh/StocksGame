import request from 'supertest';
import app from '../app.mjs';
import { expect } from 'chai';

let tokenAdmin;// To record the Admin token for Game creation
let tokenP1;// To record the Player1 token for performing buy and sell actions
let tokenP2;// To record the Player2 token for performing buy and sell actions
let playerId;//Array to store the playerId's of the players required to access the profile method
let gameId;//To store the gameId of the game created, to be supplied to the corresponding buy and sell and profile methods

describe('Test the /register route', () => {
  it('It should respond with a token for valid input', async () => {
    const response = await request(app)
      .post('/register')
      .send({ username: 'testAdmin', password: 'test', isAdmin: true });
    expect(response.statusCode).to.equal(200);
    expect(response.body).to.have.property('token');
    tokenAdmin = response.body.token;

  });
  //create player1 and player2
  it('It should respond with a token for valid input', async () => {
    const response = await request(app)
      .post('/register')
      .send({ username: 'player1', password: 'test', isAdmin: false });
    expect(response.statusCode).to.equal(200);
    expect(response.body).to.have.property('token');
    tokenP1 = response.body.token;

  });
  it('It should respond with a token for valid input', async () => {
    const response = await request(app)
      .post('/register')
      .send({ username: 'player2', password: 'test', isAdmin: false });
    expect(response.statusCode).to.equal(200);
    expect(response.body).to.have.property('token');
    tokenP2 = response.body.token;

  });
});

describe('Test the /games route', () => {
  it('It should respond with a game object for valid input', async () => {
    try {

      expect(typeof tokenAdmin).to.equal('string');
      if (typeof tokenAdmin === 'string') {
        const response = await request(app)
          .post('/games')
          .set('Authorization', 'Bearer ' + tokenAdmin)
          .send({ players: ['player1', 'player2'] });
        console.log(response.body);
        expect(response.statusCode).to.equal(200);//make sure there are no users with the same username.
        console.log("Cleared the status code test");
        expect(response.body).to.have.property('players');
        console.log("Cleared the players test");
        expect(response.body.players).to.be.an('array');
        console.log("Cleared the array test");
        response.body.players.forEach(player => {
          expect(player).to.have.property('name');
          expect(player).to.have.property('cash');
          expect(player).to.have.property('_id');
        });
        console.log("Cleared the forEach property test");
        playerId = response.body.players.map(player => player._id);//save the player id
        console.log("Player ID:",playerId);

        gameId = response.body._id; //save the game id
        console.log("Game ID:",gameId);
      } else {
        // Handle the case where token is not a string
        console.log('Token is not a string');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }
  });
});


describe('Test the /games/:gameId/buy route', () => {
  it('It should respond with a game object for valid input', async () => {
    const response = await request(app)
      .post('/games/' + gameId + '/buy') // replace gameId with a valid gameId
      .set('Authorization', 'Bearer ' + tokenP1) // replace token with a valid token
      .send({ symbol: 'AAPL', shares: 2 });
    console.log(response.body);
    expect(response.statusCode).to.equal(200);
    expect(response.body).to.have.property('players');
  });
});

describe('Test the /games/:gameId/sell route', () => {
  it('It should respond with a game object for valid input', async () => {
    const response = await request(app)
      .post('/games/' + gameId + '/sell') // replace gameId with a valid gameId
      .set('Authorization', 'Bearer ' + tokenP1) // replace token with a valid token
      .send({ symbol: 'AAPL', shares: 1 });
    console.log(response.body);
    expect(response.statusCode).to.equal(200);
    expect(response.body).to.have.property('players');
  });
});

describe('Test the /profile route', () => {
  it('It should respond with a player object for valid playerId', async () => {
    const response = await request(app)
      .get('/profile?username=player1'); // player ID of first player to get registered.
    console.log(response.body);
    expect(response.statusCode).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('portfolio');
  });
});

describe('Test the /games/:gameId/portfolio route', () => {
  it('It should respond with a portfolio object for valid input', async () => {
    const response = await request(app)
      .get('/games/' + gameId + '/portfolio') // replace gameId with a valid gameId
      .set('Authorization', 'Bearer ' + tokenP1); // replace token with a valid token
    expect(response.statusCode).to.equal(200);
    expect(response.body).to.have.property('AAPL');
  });
});

describe('Test the /games/:gameId/winner route', () => {
  it('It should respond with a winner object for valid input', async () => {
    const response = await request(app)
      .get('/games/' + gameId + '/winner'); // replace gameId with a valid gameId
    expect(response.statusCode).to.equal(200);
    if (response.body.message === 'There is a draw.') {
      expect(response.body).to.have.property('message');
    } else {
      expect(response.body).to.have.property('name');
    }
  });
});
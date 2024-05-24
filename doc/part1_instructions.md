# Project Overview

This semester's project will be implementation of a stock trading game as a web application with a server portion and an browser/HTML front end.  Players will compete to see whose pretend trading portfolio has the highest value at the end of the game/competition. You only have to support sell and buy actions, no other advanced trading actions are needed in the game.

Your server/application will have to support the following features:
* register players for the game
* provide all players a starting cash account in their portfolio
* allow player buy and sell actions at the current NYSE prices
* keep track of each player's portfolio and its value
* declare a winner at the end of the game
* maintain player login and profile information
* admin users that can create games

Your application will support additional features of your own choice, such as:
* optional viewing of competitor's portfolios
* optional costs to buy/sell transactions (fees)
* tracking all trades and activities of a player during the game
* time and starting amount game configuration
* and other features you should come up with

You should also consider any features you may not be able to implement, but would make good extensions to your app: for example, advanced charting and analysis of stock performance.

# Part I (due Feb 4, 2024)

In the project doc folder, create a project proposal called `proposal.md` which will outline your plans for design and implementing the term project.  Do not limit your proposal to things you already know how to do; we have to cover a lot of material in writing web apps in the course.  This plan is preliminary, so we expect it to change and be revised over time as your learn more and come up with additional ideas.

Your proposal should have the following sections:

## Description

One or two paragraphs describing the trading game overall from the player's perspective and the admins perspective.

### Screens



Two or more drawings/diagrams showing what the web GUI interface will look like for the players and possibly for the game admins as well. Put the drawings should be in a format to be incorporated as an image into the proposal markdown document. Label and explain the images.

## Features

List the features your application will have in a table like this:


|ID|Name|Access By|Short Description|Expected Implementation|Source of Idea|
|--|----|---------|-----------------|--------|
|01|Player registration|Player|players register for a specific game|Must implement|Project instructions|
|02|Game duration | Admin| Configure start/end of each game individually| Likely to be done|Lots of other games I know|
|03|Moving average|Player|An added feature to candlestick charts|Probably not unless its easy|Web sites like [investopedia](https://www.investopedia.com/terms/m/movingaveragechart.asp#:~:text=A%20moving%20average%20(MA)%20chart,data%20for%20each%20time%20period.)|

You should come up with 30 or more features. It's OK to use classmates as a source of feature ideas, but prepare your owb document. And do not forget to **include an attributions document** in your doc folder to acknowledge any substantial help you receive.

### Moving Average (03)

Any features that require a lengthy explanation you can add a long description section after the table.

## Implementation

### Tools and packages

List the tools and packages you expect to use. If you expect to need a tool or package you will find later, describe what you are looking for. Use a bullet list.

### App API

List the API calls you expect to support by your server with a brief description, for example

1. GET /portfolio?player=*playername*&game=*gameid*  
   responds with the current portfolio of the player

1. POST /sell?player=*playername*&game=*gameid*&stock=tickersymbol*&quant=*nnn*
    requests that a pretend sale is made within the game
    responds indicating stock sale success or not and the price

### Stock API

There are several open stock price APIs on the web. Research and find one or more you might use for the project. As in the previous section, show the API calls or calls you might use to get current stocks and their sell/buy prices. 







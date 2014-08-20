Jukebox
==============
**Jukebox** is a music web app using [Rdio api](http://www.rdio.com/developers/) on touch screen. It is using Rdio api, so everyone can add musics into Jukebox playlist, a public playlist on [Rdio.com](http://www.rdio.com/). Musics in the playlist will be rendered on this touch screen and can be played from touch screen. 

** Live Demo: **  [click here](http://jukebox.rgadev.com/)

**"demos-and-tests":** demos and test around this app.

**"music-app-rdio":** the main directory of Jukebox music web app.

##How to use
**Before you run the app**


1. Install the node modules,

        cd music-app-rdio
        npm install

2. Install the library packages,

        cd music-app-rdio 
        cd public
        bower install

3. Get the credentials.

	1) Go to ["developer.rdio.com"](https://secure.mashery.com/login/rdio.mashery.com/) and register for a Mashery ID
	
	2) Replace **RDIO_CONSUMER_KEY** and **RDIO_CONSUMER_SECRET** in **rdio_consumer_credentials.js** (music-app-rdio> rdio_modules)

**Run the app**

1. Direct to music-app-rdio.

        cd music-app-rdio

2. Open node server in terminal.

        node server.js

4. Run locally in your bowser.

        localhost:8888
        
5. Follow the process and enjoy the music.
    
    1) Click "login"

    2) Login with your rdio account.
    
    3) Enjoy the music from playlist.


**Join and edit the playlist**

1. Go to [Rdio.com](http://www.rdio.com/).
2. Search [Jukebox](http://rd.io/x/Rl4SxkEvz3Jk/) playlist on [Rdio](http://www.rdio.com/).
3. Click "collaborate" on the top right to collaborate with this playlist.
4. Add musics you like into the playlist.

**Change to your playlist and domain**

Change the playlist: change information in **config.json** under **music-app-rdio**

Change the domain: change information in **config.json** under **public> js**


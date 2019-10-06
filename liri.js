////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////// NPM
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

require("dotenv").config();
let axios = require("axios");
let fileSystem = require("fs");
let keys = require("./keys.js");
let inquirer = require("inquirer");
let Spotify = require('node-spotify-api');

//let moment = require("moment");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////// keys
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let spotify = new Spotify(keys.spotify);
let omdbkey = "54a70c14";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////// inquirer
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

inquirer
    .prompt([
        {
            type: "list",
            name: "input",
            message: "Select from the follwing options.",
            choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says", "Cast a Magic Spell!"]
        }
    ])
    .then(answers => {
        switch (answers.input) {
            case "concert-this":
                concertThis();
                break;
            case "spotify-this-song":
                spotifyThisSong();
                break;
            case "movie-this":
                movieThis();
                break;
            case "do-what-it-says":
                doWhatItSays();
                break;
            case "Cast a Magic Spell!":
                console.log(`Not enough mana.`);
                break;
            default:
                console.log(`Something's gone wrong!`);
                break;
        };
    });


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////// Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const spotifyThisSong = () => {
    let userInputSong = "All the small things";
    inquirer.prompt([
        {
            type: "input",
            name: "inputData",
            message: "Name a song! *spelling matters*"
        }
    ]).then(songAnswer => {

        // default song if input field was left blank.
        songAnswer.inputData.length < 1 ?
            userInputSong = "Ace of Base" :
            userInputSong = songAnswer.inputData;

        //spotifySearch();
        spotifySearchFunction(userInputSong);
    });
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////// concert-this 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const concertThis = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "userInput",
            message: "Who's your favorite band?"
        }
    ]).then(bandData => {
        let artist;

        // This is another way to make sure data is passed though.
        if( bandData.userInput.length < 1) {
            artist = "Blink 182" } 
        else {
            artist = (bandData.userInput).trim().toLowerCase().replace(/"  "/g, " ").replace(/" "/g,"-");
        };
        let apiAddress = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";

        // Now that we have everything we need. Lets push the data to axios!
        axios.get(apiAddress).then(function(bandObject){
            function BandObject(_ticketsAvailable = false, _bandName = artist, _venue, _city, _state, _dateOfEvent){
                this.Band = _bandName;
                this.Venue = _venue;
                this.DateOfEvent = _dateOfEvent;
                this.Tickets = _ticketsAvailable;
                this.Location = `${_city}, ${_state}`;
            };

            let info = bandObject.data[0];

            let theDateOfEvent = `${info.datetime}`;

            // Moment is in package.json but is a lot more code than we need.
            function iDontNeedMoment(date){
                let day = date.slice(8,10);
                let month = date.slice(5,7);
                let year = date.slice(0,4);
                // Now build the date however you want for this website.
                return `${month}/${day}/${year}`;
            };

            let printableInfo = new BandObject(info.offers[0].status, artist, info.venue.name, info.venue.city, info.venue.region, iDontNeedMoment(theDateOfEvent));
            console.table(printableInfo);
        }).catch(function(error){
            console.log(error);
        });
    });
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////// movieThis 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const movieThis = () => {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////// Nested Movie Object Constructor
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function MovieObj(_title, _year, _imdbRating, _rtRating, _producedIn, _language, _plot, _actors) {
        this.title = _title;
        this.year = _year;
        this.imdbRating = _imdbRating;
        this.rtRating = _rtRating;
        this.producedIn = _producedIn;
        this.language = _language;
        this.plot = _plot;
        this.actors = _actors;

        this.printOut = () => {
            // Do not table() data. Plot and Actors are too robust to print into that spacing without a \n function.
            // Do not use for (...in) loop. Custom data fields are provieded. 
            console.log(`----------------------------`);
            console.log(`Title: ${this.title}`);
            console.log(`Release Year: ${this.year}`);
            console.log(`IMDB Rating: ${this.imdbRating}`);
            console.log(`Rotten Tomatos: ${this.rtRating}`);
            console.log(`Produced: ${this.producedIn}`);
            console.log(`Language: ${this.language}`);
            console.log(`Plot: ${this.plot}`);
            console.log(`Actors: ${this.actors}`);
        };
    };

    inquirer.prompt([
        {
            type: "input",
            name: "userInput",
            message: "Name a movie!"
        }
    ]).then(movieData => {
        // What did the user type?
        let movieTitle = movieData.userInput;
        // Make sure the input wasnt blank.
        movieTitle.length < 1 ? movieTitle = "Wall e" : movieTitle = movieTitle;
        // Trim and replace for the URL.
        movieTitle.trim().replace(/" "/g, "+");

        // Now lets axios that beast
        axios.get(`http://www.omdbapi.com/?t=${movieTitle}&apikey=${omdbkey}`)
        .then(function (response) {
            // handle success
            let thisMovie = response.data;
            //console.log(thisMovie);
            let result = new MovieObj(thisMovie.Title, thisMovie.Year, thisMovie.imdbRating, thisMovie.Ratings[1].Value, thisMovie.Production, thisMovie.Language, thisMovie.Plot, thisMovie.Actors);
            result.printOut();
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
    });
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////// do-what-it-says
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const doWhatItSays = () => {
    fileSystem.readFile("./random.txt", "UTF-8", (err, data) => {
        spotifySearchFunction(data.slice(data.indexOf(",")+1));
    });
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////// spotifyThis Function (used in multiple methods across the application.)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* This function is where all spotify related calls get passed through to resolve into data. */
/* NOT a nested function and can be called across the application */

const spotifySearchFunction = (songInput) => {
    //now that we have the song lets search it!
    function ThisSong(_artist, _songName, _previewLink, _album) {
        this.artist = _artist,
            this.songName = _songName,
            this.album = _album,
            this.previewLink = _previewLink
    };
    spotify.search({
        type: 'track', query: songInput
    }).then(function (response) {
        let finalPreviewLink = "No preview link available";
        let result = response.tracks.items[0];
        result.preview_url === null ? finalPreviewLink = "No preview link available." : finalPreviewLink = result.preview_url;
        let thisData = new ThisSong(result.artists[0].name, result.name, finalPreviewLink, result.album.name);
        console.table(thisData);
    }).catch(function (err) {
        console.log(err);
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////// FIN
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


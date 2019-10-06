//////////////////////////////////////////////
///////////////// NPM
//////////////////////////////////////////////

let axios = require("axios");
let fileSystem = require("fs");
let inquirer = require("inquirer");
let moment = require("moment");
let Spotify = require('node-spotify-api');
let keys = require("./keys.js");
require("dotenv").config();

//////////////////////////////////////////////
///////////////// keys
//////////////////////////////////////////////

let spotify = new Spotify(keys.spotify);
let omdbkey = "54a70c14";

//////////////////////////////////////////////
///////////////// inquirer
//////////////////////////////////////////////

inquirer
    .prompt([
        {
            type: "list",
            name: "input",
            message: "Select from the follwing options.",
            choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says"]
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
                doWhatItSays()
                break;
            default:
                console.log(`Something's gone wrong!`);
                break;
        }
    });


//////////////////////////////////////////////
///////////////// Functions
//////////////////////////////////////////////

const concertThis = () => {
    console.log(`concertThis() fucntion called.`);
};

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
    
//////////////////////////////////////////////
///////////////// movieThis 
//////////////////////////////////////////////
const movieThis = () => {

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
        console.log(response.data);
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
const doWhatItSays = () => {
    console.log(``);
    console.log(`-------------------------------------`);
    fileSystem.readFile("./random.txt", "UTF-8", (err, data) => {
        let song = data;
        console.log(song);
        spotifySearchFunction("wild wild west");
        console.log(`-------------------------------------`);
    });
};

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
        console.log(`------------------ START ------------------`);
        let finalPreviewLink = "No preview link available";
        let result = response.tracks.items[0];
        result.preview_url === null ? finalPreviewLink = "No preview link available." : finalPreviewLink = result.preview_url;
        let thisData = new ThisSong(result.artists[0].name, result.name, finalPreviewLink, result.album.name);
        console.table(thisData);
        console.log(`------------------ FIN ------------------`);
    }).catch(function (err) {
        console.log(err);
    });
};
//////////////////////////////////////////////
///////////////// FIN
//////////////////////////////////////////////


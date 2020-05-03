/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import queryString from "query-string";
import logo from "./logo.svg";
import "./App.css";
import Collapsible from "react-collapsible";
import { Chart } from "react-google-charts";

var randomColor = require("randomcolor");
const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function Introduction(props) {
  //putting all song counts in a list
  let allSongs = props.user.playlists.reduce((songCount, eachPlaylist) => {
    return songCount.concat(eachPlaylist.songCount);
  }, []);
  //and then adding them together
  let totalSongs = allSongs.reduce(
    (accumulator, currentValue) => accumulator + currentValue
  );

  return (
    <div style={{color:'#FFA07A'}}>
      <h1 style={{textAlign:'center'}}>
        Hello, {props.user.name}.You have {props.user.playlists.length} playlists which is a total of {totalSongs} songs.{" "}
      </h1>{" "}
    </div>
  );
}

function FavArtist(props) {

  let genreString=props.artist.genres.slice(0,5).map((genre, index) =>
        " " +
        capitalize(genre) +
        ((index < props.artist.genres.slice(0,5).length - 1) ? "," : ".")
    )

  return (
    <div style={{display:'inline-block', backgroundColor:'#FFA07A', marginLeft:'1.5%'}}>
    <div className="flip-card">
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <img
            src={props.artist.imageUrl}
            style={{
              width: "220px",
              height: "220px",
            }}
          />{" "}
        </div>{" "}
        <div className="flip-card-back">
          <h2 style={{color:'white'}}> {props.artist.name} </h2>{" "}
          <p> Followers: {props.artist.followers} </p>{" "}
          <p>
            {" "}
            Genres:
            {props.artist.genres.length > 0
              ? (genreString)
              : " No genres available for this artist"}
          </p>{" "}
          <p> Popularity: {props.artist.popularity} </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  </div>
  );
}

function FavTracks(props) {
  return (
    <div className="songBlock">
      <ol>
        {" "}
        {props.tracks.map((track) => (
          <li> {" " + track.name + " - " + track.artist} </li>
        ))}{" "}
      </ol>{" "}
    </div>
  );
}

function UserTrends(props) {
  function getOcurrences(list, value) {
    return list.filter((v) => v === value).length;
  }
  let allLTgenres = props.LTartists.reduce((genres, artist) => {
    return genres.concat(artist.genres);
  }, []);
  let allMTgenres = props.MTartists.reduce((genres, artist) => {
    return genres.concat(artist.genres);
  }, []);
  let allSTgenres = props.STartists.reduce((genres, artist) => {
    return genres.concat(artist.genres);
  }, []);

  function ocurrenceSort(a, b) {
    return b.percentage - a.percentage;
  }
  let LTgenrePercentages = [...new Set(allLTgenres)].map((item) => {
    return {
      title: capitalize(item),
      value: getOcurrences(allLTgenres, item),
    };
  });
  let MTgenrePercentages = [...new Set(allMTgenres)].map((item) => {
    return {
      title: item,
      value: getOcurrences(allMTgenres, item),
    };
  });
  let STgenrePercentages = [...new Set(allSTgenres)].map((item) => {
    return {
      title: item,
      value: getOcurrences(allSTgenres, item),
    };
  });

  LTgenrePercentages.sort(ocurrenceSort);
  STgenrePercentages.sort(ocurrenceSort);
  let chartData = [["Genre", "Value"]];

  LTgenrePercentages.slice(0, 30).map((item) =>
    chartData.push([item.title, item.value])
  );
  return (
    <div className="PieChartt">
      <h2 style={{textAlign:'center'}}> Your Genre Pie Chart </h2>{" "}
      <Chart
        width={"800px"}
        height={"600px"}
        chartType="PieChart"
        loader={<div> Loading Chart </div>}
        data={chartData}
        options={{
          backgroundColor: {
            fill: "transparent",
          },
          chartArea: {
            width: "100%",
            height: "90%",
          },
          legend: {
            position: "labeled",
            labeledValueText: "both",
            textStyle: {
              color: "white",
              fontSize: 14,
            },
          },
        }}
        rootProps={{
          "data-testid": "1",
        }}
      />{" "}
    </div>
  );
}

function RelatedArtists(props) {

  let allArtists=props.artists.longTerm.slice(0,5).concat(
    props.artists.mediumTerm.slice(0,5).concat(props.artists.shortTerm.slice(0,5))
  )

  function searchedArtist(title){
    return allArtists.find(artist=>artist.name.toLowerCase()===title.toLowerCase())
  }

  const [title,setTitle]=useState()
  const [artist,setArtist]=useState(null)
  const [relatedArtists,setRelatedArtists]=useState()
  const [relatedArtistTracks,setRelatedArtistTracks]=useState()
  const [relatedSongURIs,setRelatedSongURIs]=useState()


  const handleSubmit = (e)=>{
    e.preventDefault()
    if(typeof searchedArtist(title) !== 'undefined'){
      setArtist(searchedArtist(title))
    }
  }

  useEffect(()=>{
    if(artist === null || artist === ''){
      return console.log("")
    }
    let parsed = queryString.parse(window.location.search);
    let accessToken = parsed.access_token;


      fetch("https://api.spotify.com/v1/artists/"+artist.id+"/related-artists", {
        headers: {
          Authorization: "Bearer " + accessToken,
        }
      }).then(relatedArtistsData=>(relatedArtistsData.json())).
      then(
        relatedArtistsData=>{
          setRelatedArtists(
            relatedArtistsData.artists.slice(0,5).map(item=>{
              return{
                name: item.name,
                imageUrl: item.images[0].url,
                genres: item.genres,
                followers: item.followers.total,
                popularity: item.popularity,
                href: item.href,
                id: item.id
              }
            })
          )
        }
      )
  },[artist]
  )

  useEffect(()=>{
    let parsed = queryString.parse(window.location.search)
    let accessToken = parsed.access_token

    if(typeof relatedArtists !== 'undefined')

    Promise.all([
      fetch("https://api.spotify.com/v1/artists/"+relatedArtists[0].id+"/top-tracks?country=HU", {
        headers: {
          Authorization: "Bearer " + accessToken,
        }
      }),
      fetch("https://api.spotify.com/v1/artists/"+relatedArtists[1].id+"/top-tracks?country=HU", {
        headers: {
          Authorization: "Bearer " + accessToken,
        }
      }),
      fetch("https://api.spotify.com/v1/artists/"+relatedArtists[2].id+"/top-tracks?country=HU", {
        headers: {
          Authorization: "Bearer " + accessToken,
        }
      }),
      fetch("https://api.spotify.com/v1/artists/"+relatedArtists[3].id+"/top-tracks?country=HU", {
        headers: {
          Authorization: "Bearer " + accessToken,
        }
      }),
      fetch("https://api.spotify.com/v1/artists/"+relatedArtists[4].id+"/top-tracks?country=HU", {
        headers: {
          Authorization: "Bearer " + accessToken,
        }
      })
    ]).then(
      ([
        firstData,
        secondData,
        thirdData,
        fourthData,
        fifthData
      ]) => {
        return Promise.all([
          firstData.json(),
          secondData.json(),
          thirdData.json(),
          fourthData.json(),
          fifthData.json()
        ]);
      }
    ).then(
      ([
        firstData,
        secondData,
        thirdData,
        fourthData,
        fifthData
      ]) =>
      setRelatedArtistTracks(
        {firstArtistsTracks:firstData.tracks.map((item) => {
          return {
            name: item.name,
            artist: item.artists[0].name,
            album: item.album.name,
            id: item.id,
            uri:item.uri
          }
        }),
        secondArtistsTracks:secondData.tracks.map((item) => {
          return {
            name: item.name,
            artist: item.artists[0].name,
            album: item.album.name,
            id: item.id,
            uri:item.uri
          }
        }),
        thirdArtistsTracks:thirdData.tracks.map((item) => {
          return {
            name: item.name,
            artist: item.artists[0].name,
            album: item.album.name,
            id: item.id,
            uri:item.uri
          }
        }),
        fourthArtistsTracks:fourthData.tracks.map((item) => {
          return {
            name: item.name,
            artist: item.artists[0].name,
            album: item.album.name,
            id: item.id,
            uri:item.uri
          }
        }),
        fifthArtistsTracks:fifthData.tracks.map((item) => {
          return {
            name: item.name,
            artist: item.artists[0].name,
            album: item.album.name,
            id: item.id,
            uri:item.uri
          }
        })}
      )
    )


  },[relatedArtists] )

  function handleCreateSubmit(e){
    e.preventDefault()
    //console.log(relatedArtistTracks)
    let allURIs= (relatedArtistTracks.firstArtistsTracks.slice(0,5).map((track)=>{
       return(track.uri)
     })).join().concat(','+(relatedArtistTracks.secondArtistsTracks.slice(0,5).map((track)=>{
        return(track.uri)
      })).join()).concat(','+(relatedArtistTracks.thirdArtistsTracks.slice(0,5).map((track)=>{
        return(track.uri)
      })).join()).concat(','+(relatedArtistTracks.fourthArtistsTracks.slice(0,5).map((track)=>{
        return(track.uri)
      })).join()).concat(','+(relatedArtistTracks.fifthArtistsTracks.slice(0,5).map((track)=>{
        return(track.uri)
      })).join())
      setRelatedSongURIs(allURIs)

  }

  useEffect(()=>{

    let parsed = queryString.parse(window.location.search)
    let accessToken = parsed.access_token

    if(typeof relatedSongURIs !=='undefined'){

      fetch("https://api.spotify.com/v1/users/"+props.userID+"/playlists", {
        method: "post",
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        body:JSON.stringify({
          name: 'Tracks like '+artist.name+"'s",
          description:'songs',
          public:'true'
        })
      }).then(response=>(response.json())).then(
        (response)=>{
          fetch("https://api.spotify.com/v1/playlists/"+response.id+"/tracks?uris="+relatedSongURIs, {
            method:'post',
            headers: {
              Authorization: "Bearer " + accessToken,
            }
          }).then(responseData=>(responseData.json())).then(
            responseData=>{console.log("works")}
          )
        }
      )


    }
  },[relatedSongURIs])




  return(
    <div style={{backgroundColor:'', margin:'auto', marginBottom:'60px'}}>
      <h2 style={{textAlign:'center'}}>Enter names of one of your favourite artists to get related artists to them</h2>
      <form onSubmit={handleSubmit} style={{height:'40px', width:'50%', marginLeft:'27%', marginBottom:'20px'}}>
        <input type="text" value={title || ''} required onChange={(e)=> setTitle(e.target.value)} style={{fontSize:'40px'}}/>
        <input type="submit" value="Go!" style={{fontSize:'40px'}}/>
      </form>
      {relatedArtists ?
      (
        <div>
        <div>
          <FavArtist artist={relatedArtists[0]}/>
          <FavArtist artist={relatedArtists[1]}/>
          <FavArtist artist={relatedArtists[2]}/>
          <FavArtist artist={relatedArtists[3]}/>
          <FavArtist artist={relatedArtists[4]}/>
        </div>
        <div>
          <form onSubmit={handleCreateSubmit}>
            <input type="submit" value="Create"/>
          </form>
        </div>
      </div>
      )
      : <p></p>}
    </div>
  )
}

function AudioFeatureTrend(props){

  let avgAcousticness
  let avgDanceability
  let avgDuration
  let avgEnergy
  let avgInstrumentalness
  let avgKey
  let avgLiveness
  let avgLoudness
  let avgTempo
  let avgSpeechiness
  let avgValence

  let readyToShow=false

  let allSongIds=(props.tracks.map((track,index)=>{
    return(track.id)
  })).join()


  const [audioFeatures,setAudioFeatures]=useState()

  useEffect(() => {
      let parsed = queryString.parse(window.location.search);
      let accessToken = parsed.access_token;

      fetch("https://api.spotify.com/v1/audio-features?ids="+allSongIds, {
        headers: {
          Authorization: "Bearer " + accessToken,
        }
      }).then(audioFeatureData=>(audioFeatureData.json())).then(
        audioFeatureData=>{
          setAudioFeatures(audioFeatureData.audio_features.map(item=>{
            return{
              acousticness:item.acousticness,
              danceability:item.danceability,
              duration:item.duration_ms,
              energy:item.energy,
              instrumentalness:item.instrumentalness,
              key:item.key,
              liveness:item.liveness,
              loudness:item.loudness,
              speechiness:item.speechiness,
              tempo:item.tempo,
              valence:item.valence
            }
          }))
        }
      )
  }, [])

  function avg(list){
    return ((list.reduce(
      (accumulator, currentValue) => accumulator + currentValue
    ))/list.length)
  }


  if(typeof audioFeatures !== 'undefined'){

    let allAcousticness = audioFeatures.reduce((acousticness, eachTrack) => {
      return acousticness.concat(eachTrack.acousticness)
    }, [])

    let allDanceability = audioFeatures.reduce((danceability, eachTrack) => {
      return danceability.concat(eachTrack.danceability)
    }, [])

    let allDuration = audioFeatures.reduce((duration, eachTrack) => {
      return duration.concat(eachTrack.duration)
    }, [])

    let allEnergy = audioFeatures.reduce((energy, eachTrack) => {
      return energy.concat(eachTrack.energy)
    }, [])

    let allInstrumentalness = audioFeatures.reduce((instrumentalness, eachTrack) => {
      return instrumentalness.concat(eachTrack.instrumentalness)
    }, [])

    let allKey = audioFeatures.reduce((key, eachTrack) => {
      return key.concat(eachTrack.key)
    }, [])

    let allLiveness = audioFeatures.reduce((liveness, eachTrack) => {
      return liveness.concat(eachTrack.liveness)
    }, [])

    let allLoudness = audioFeatures.reduce((loudness, eachTrack) => {
      return loudness.concat(eachTrack.loudness)
    }, [])

    let allTempo = audioFeatures.reduce((tempo, eachTrack) => {
      return tempo.concat(eachTrack.tempo)
    }, [])

    let allValence = audioFeatures.reduce((valence, eachTrack) => {
      return valence.concat(eachTrack.valence)
    }, [])

    let allSpeechiness = audioFeatures.reduce((speechiness, eachTrack) => {
      return speechiness.concat(eachTrack.speechiness)
    }, [])

    avgAcousticness=avg(allAcousticness)
    avgDanceability=avg(allDanceability)
    avgDuration=avg(allDuration)
    avgEnergy=avg(allEnergy)
    avgInstrumentalness=avg(allInstrumentalness)
    avgKey=avg(allKey)
    avgLiveness=avg(allLiveness)
    avgLoudness=avg(allLoudness)
    avgTempo=avg(allTempo)
    avgValence=avg(allValence)
    avgSpeechiness=avg(allSpeechiness)

  }

  function acousticnessDecision(acousticness){
    if(acousticness<=0.4){
      return ("You are more into electric sounds (think electric guitars, synthesizers, drum machines, auto-tuned vocals and so on).")
    }else if(acousticness<=0.6){
      return "You like both natural acoustic sounds (think acoustic guitar, piano, orchestra, the unprocessed human voice) and electric sounds (think electric guitars, synthesizers, drum machines, auto-tuned vocals and so on)."
    }else{
      return "You are more into natural acoustic sounds (think acoustic guitar, piano, orchestra, the unprocessed human voice)."
    }
  }

  function danceabilityDecision(danceability){
    if(danceability<=0.4){
      return "You are not really into danceable songs."
    }else if(danceability<=0.6){
      return "You like both calm and danceable songs."
    }else{
      return "You are more into danceable songs."
    }
  }

  function toHumanTime(duration){
    let mins=Math.floor((duration/1000)/60)
    let seconds=Math.floor((duration/1000)%60)

    return (mins+" minutes and "+seconds+" seconds")
  }

  function energyDecision(energy){
    if(energy<=0.4){
      return "You seem to be more into more calm and chill songs."
    }else if(energy<=0.6){
      return "You like both calm and energetic songs."
    }else{
      return "You are more into high energy songs."
    }
  }

  function speechinessDecision(speechiness){
    let basicResponse="The average speechiness for your top tracks suggests that you listen to tracks "
    if(speechiness<=0.33){
      return (basicResponse+"with almost no speech at all.")
    }if(speechiness<=0.66){
      return basicResponse+"that may contain both music and speech, either in sections or layered, including such cases as rap music."
    }
    return basicResponse+(" that are probably made entirely of spoken words.")
  }


  return(

    <div className="AudioFeatures">
      <h2 style={{border:'solid' , width:'40%', margin:'auto', marginTop:'5px'}}>Audio trends for your top 50 tracks</h2>
    {(typeof audioFeatures !== 'undefined') ?

    (<div>
        <p>{acousticnessDecision(avgAcousticness)} Your average acousticness score is {(Math.floor(avgAcousticness*1000))/1000} highest possible point being 1.0</p>
        <p>{danceabilityDecision(avgDanceability)} Your average danceability score is {(Math.floor(avgDanceability*1000))/1000} highest possible point being possible 1.0.
          The higher the value, the easier it is to dance to the song.</p>
        <p>Average duration for your favourite songs is {toHumanTime(avgDuration)}</p>
        <p>{energyDecision(avgEnergy)} Your average energy score is {(Math.floor(avgEnergy*1000))/1000} highest possible point being 1.0.</p>
        <p>{speechinessDecision(avgSpeechiness)} Your average speechiness score is {(Math.floor(avgSpeechiness*1000))/1000}</p>
        <p>Average BPM for you favourite songs is {Math.floor(avgTempo)}</p>
        <p>Your average valence score is {(Math.floor(avgValence*1000))/1000}. Tracks with high valence sound more positive (happy, cheerful, euphoric), while
          tracks with low valence sound more negative (sad, depressed, angry).</p>

    </div>)
    : (<div>
        <p>Loading...</p>
      </div>)}
    </div>
  )

}

function PlaylistCreator(props){

  let name="Top tracks"

  let allSongURIsLT=(props.tracks.longTerm.map((track,index)=>{
    return(track.uri)
  })).join()
  let allSongURIsMT=(props.tracks.mediumTerm.map((track,index)=>{
    return(track.uri)
  })).join()
  let allSongURIsST=(props.tracks.shortTerm.map((track,index)=>{
    return(track.uri)
  })).join()



  const [playlist,setPlaylist]=useState()
  const [radioButton,setRadioButton]=useState("6 months")
  const [songURIs,setSongURIs]=useState()
  const [playlistName,setPlaylistName]=useState()



  useEffect(() => {

    let parsed = queryString.parse(window.location.search);
    let accessToken = parsed.access_token;


    if(typeof playlistName !== 'undefined')

    fetch("https://api.spotify.com/v1/users/"+props.userID+"/playlists", {
      method: "post",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      body:JSON.stringify({
        name: playlistName,
        description:'songs',
        public:'true'
      })
    }).then(playlistData=>(playlistData.json())).then(
      (playlistData)=>{
        fetch("https://api.spotify.com/v1/playlists/"+playlistData.id+"/tracks?uris="+songURIs, {
          method:'post',
          headers: {
            Authorization: "Bearer " + accessToken,
          }
        }).then(responseData=>(responseData.json())).then(
          responseData=>{console.log("boom")}
        )
      }
    )

  },[songURIs])


function handleSubmit(e){
  e.preventDefault()
  if(radioButton==='All time'){
    setSongURIs(allSongURIsLT)
    setPlaylistName("All time top tracks")
  }else if (radioButton==='6 months') {
    setSongURIs(allSongURIsMT)
    setPlaylistName("6 months top tracks")
  }else if(radioButton==="4 weeks"){
    setSongURIs(allSongURIsST)
    setPlaylistName("4 weeks top tracks")
  }

}

//make a state and use state for calling the fetch hook

function handleSelect(event){
  let a = event.target.value
  setRadioButton(a)
}

  return(
    <div>
      <h2>In this section you can create playlists with your top 50 tracks from different time periods</h2>
      <div className='ChoiceBox'>
      <p style={{fontSize:'24px', display:'inline-block',marginRight:'5px'}}>Choose the preferred time period: </p>
      <form onSubmit={handleSubmit} style={{display:'inline-block'}}>
        <select value={radioButton} onChange={handleSelect}>
          <option>All time</option>
          <option>6 months</option>
          <option>4 weeks</option>
        </select>
        <input type="submit" value="Go!"/>
      </form>
      </div>
    </div>
  )

}

function RecentlyPlayed(props){

  const [recentSongs,setRecentSongs]=useState()
  const [number,setNumber]=useState()
  const [toBeRendered,setToBeRendered]=useState(4)


  useEffect(()=>{
    let parsed = queryString.parse(window.location.search);
    let accessToken = parsed.access_token;

    fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
      headers: {
        Authorization: "Bearer " + accessToken,
      }
    }).then(responseData=>(responseData.json())).then(
      responseData=>{
        setRecentSongs(responseData.items.map(item=>{
          return{
            playedAt:item.played_at,
            name:item.track.name,
            albumName:item.track.album.name,
            duration:item.track.duration_ms,
            image:(item.track.album.images[0]
              ? item.track.album.images[0].url
              //below is an image that says no image available
              : 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png' ),
            artist:item.track.artists[0].name
          }
        }))
      })
  },[])

  function toHumanTime(duration){
    let mins=Math.floor((duration/1000)/60)
    let seconds=Math.floor((duration/1000)%60)
    // if(seconds<10){
    //   return (mins+":0"+seconds)
    // }
    return (mins+":"+seconds)
  }

  function toHumanDate(date){
    return date.substr(0,10)
  }

  function wordCutter(string){
    return (string.length>16
				? string.substr(0, 13).concat("...")
				: string)
  }
  let liStyle={
    paddingTop:'0px',
    margin:'0px'
  }

  function songBox(song){
    return(
      <div style={{display:'inline-block', margin:'4px',  border:'3px solid #fe9b1d',
        height:'125px', width:'300px',padding:'10px',paddingTop:'0'}}>
        <img src={song.image} height="100" width="100" style={{marginLeft:'2px',padding:'0', marginRight:'2px'}}/>
        <div style={{display:'inline-block', padding:'0', margin:'0'}}>
          <ul style={{listStyleType:'none',padding:'0px'}}>
              <li style={liStyle}>Name: {wordCutter(song.name)} </li>
              <li style={liStyle}>Album: {wordCutter(song.albumName)}</li>
              <li style={liStyle}>Artist: {wordCutter(song.artist)}</li>
              <li style={liStyle}>Duration: {toHumanTime(song.duration)}</li>
              <li style={liStyle}>Played at: {toHumanDate(song.playedAt)}</li>
          </ul>
        </div>
      </div>
    )
  }

  function handleSubmit(e){
    e.preventDefault()
    setToBeRendered(number)
  }




  return(
    recentSongs ?
    <div>
      <h2>Recently played</h2>
      <p style={{fontSize:'20px', margin:'5px',textAlign:'center'}}>Ever listened to a song on spotify then forgot the name?
        Worry not! Just enter the number of recently
        played songs you would like to see.</p>
      <form onSubmit={handleSubmit} style={{marginLeft:'42%', marginBottom:'20px'}}>
          <input type="text" value={number} required onChange={(e)=> setNumber(e.target.value)}/>
          <input type="submit" value="Go!"/>
        </form>
      {recentSongs.slice(0,toBeRendered).map(song=>songBox(song))}
    </div>
    :<div>
    <p>Loading...</p>
  </div>
  )
}

function App() {
  const [serverData, setServerData] = useState()
  const [searchText, setSearchText] = useState()

//made this async not so sure about the effects
  useEffect(() => {


    let parsed = queryString.parse(window.location.search);
    let accessToken = parsed.access_token;

//await is here
  Promise.all([
      //we are first fetching the user data(to extract the name)
      fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }),
      //and here we are fetching the playlists of the user
      fetch("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }),
      //the following 3 fetches are user's top artists in long medium and short term in that order
      fetch(
        "https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=50",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      ),
      fetch(
        "https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=50",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      ),
      fetch(
        "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=50",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      ),
      //the folloewing 3 fetches are user's top tracks in the above order
      fetch(
        "https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      ),
      fetch(
        "https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      ),
      fetch(
        "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      ),
    ])
      .then(
        ([
          userData,
          playlistData,
          favArtistDataLT,
          favArtistDataMT,
          favArtistDataST,
          favTracksLT,
          favTracksMT,
          favTracksST,
        ]) => {
          return Promise.all([
            userData.json(),
            playlistData.json(),
            favArtistDataLT.json(),
            favArtistDataMT.json(),
            favArtistDataST.json(),
            favTracksLT.json(),
            favTracksMT.json(),
            favTracksST.json(),
          ]);
        }
      )
      .then(
        ([
          userData,
          playlistData,
          favArtistDataLT,
          favArtistDataMT,
          favArtistDataST,
          favTracksLT,
          favTracksMT,
          favTracksST,
        ]) =>
          setServerData({
            user: {
              name: userData.display_name,
              id: userData.id,
              //mapping the names of the playlists into corresponding ones
              playlists: playlistData.items.map((item) => {
                return {
                  name: item.name,
                  songCount: item.tracks.total,
                };
              }),
              favArtists: {
                longTerm: favArtistDataLT.items.map((item) => {
                  return {
                    name: item.name,
                    imageUrl: item.images[0].url,
                    genres: item.genres,
                    followers: item.followers.total,
                    popularity: item.popularity,
                    href: item.href,
                    id: item.id,
                  };
                }),
                mediumTerm: favArtistDataMT.items.map((item) => {
                  return {
                    name: item.name,
                    imageUrl: item.images[0].url,
                    genres: item.genres,
                    followers: item.followers.total,
                    popularity: item.popularity,
                    href: item.href,
                    id: item.id,
                  };
                }),
                shortTerm: favArtistDataST.items.map((item) => {
                  return {
                    name: item.name,
                    imageUrl: item.images[0].url,
                    genres: item.genres,
                    followers: item.followers.total,
                    popularity: item.popularity,
                    id: item.id,
                  };
                }),
              },
              favTracks: {
                longTerm: favTracksLT.items.map((item) => {
                  return {
                    name: item.name,
                    artist: item.artists[0].name,
                    album: item.album.name,
                    id: item.id,
                    uri:item.uri
                  };
                }),
                mediumTerm: favTracksMT.items.map((item) => {
                  return {
                    name: item.name,
                    artist: item.artists[0].name,
                    album: item.album.name,
                    id:item.id,
                    uri:item.uri

                  };
                }),
                shortTerm: favTracksST.items.map((item) => {
                  return {
                    name: item.name,
                    artist: item.artists[0].name,
                    album: item.album.name,
                    id: item.id,
                    uri:item.uri

                  };
                }),
              },
            },
          })
      );
  }, []);

  return (
    <div>
      {" "}
      {serverData ? (
        <div>
          <header>
            <Introduction user={serverData.user} />{" "}
          </header>{" "}
          <div className="FavArtists">
            <h2 style={{textAlign:'center'}}> Your all time favourite artists </h2>{" "}
            {serverData.user.favArtists.longTerm.slice(0, 5).map((artist) => (
              <FavArtist artist={artist} />
            ))}{" "}
            <h2> Your favourite artists for the last 6 months </h2>{" "}
            {serverData.user.favArtists.mediumTerm.slice(0, 5).map((artist) => (
              <FavArtist artist={artist} />
            ))}{" "}
            <h2> Your favourite artists for the last 4 weeks </h2>{" "}
            {serverData.user.favArtists.shortTerm.slice(0, 5).map((artist) => (
              <FavArtist artist={artist} />
            ))}{" "}
          </div>{" "}
          <div className="FavTracks">
            <h2>
              {" "}
              These are a list of songs that were your favourite over a certian
              period of time{" "}
            </h2>{" "}
            <Collapsible trigger="Your all time favourite tracks">
              <FavTracks tracks={serverData.user.favTracks.longTerm} />{" "}
            </Collapsible>{" "}
            <Collapsible trigger="Your favourite tracks for the last 6 months">
              <FavTracks tracks={serverData.user.favTracks.mediumTerm} />{" "}
            </Collapsible>{" "}
            <Collapsible trigger="Your favourite tracks for the last 4 weeks">
              <FavTracks tracks={serverData.user.favTracks.shortTerm} />{" "}
            </Collapsible>{" "}
          </div>{" "}
          <UserTrends
            LTartists={serverData.user.favArtists.longTerm}
            MTartists={serverData.user.favArtists.mediumTerm}
            STartists={serverData.user.favArtists.shortTerm}
          />
            <RelatedArtists artists={serverData.user.favArtists} userID={serverData.user.id}/>
            <AudioFeatureTrend tracks={serverData.user.favTracks.longTerm}/>
            <PlaylistCreator userID={serverData.user.id} tracks={serverData.user.favTracks}/>
            <RecentlyPlayed/>
        </div>
      ) : (
        <button
          onClick={() => {
            window.location = window.location.href.includes("localhost")
              ? "http://localhost:8888/login"
              : "http://spotify-analytics-backendd.herokuapp.com/login";
          }}
          style={{
            padding: "20px",
            fontSize: "50px",
            marginTop: '15%',
            marginLeft:'33%'
          }}
        >
          {" "}
          Sign in with Spotify{" "}
        </button>
      )}
    </div>
  );
}

export default App;

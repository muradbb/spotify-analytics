/* eslint-disable */
import React, { useState, useEffect} from 'react';
import queryString from 'query-string';
import logo from './logo.svg';
import './App.css';

let artistStyle={
	width: '120px',
	height:'180px',
	display:'inline-block',
	//border: '1px solid green',
	margin: '20px',
	'background-color': '#212121'
}


function Introduction(props){
  //putting all song counts in a list
  let allSongs=props.user.playlists.reduce(
    (songCount, eachPlaylist)=>{
      return songCount.concat(eachPlaylist.songCount)
    },
    []
  )
  //and then adding them together
  let totalSongs=allSongs.reduce((accumulator, currentValue) => accumulator + currentValue)
  return(
    <div>
      <h1>Hello, {props.user.name}. You have {props.user.playlists.length} playlists which is a total of {totalSongs} songs.</h1>
    </div>
  )
}

function FavArtist(props){

  return(
    <div style={{... artistStyle}}>
      <img src={props.artist.imageUrl} style={{width:'100px',height:'100px', 'margin-left': '10px', 'margin-top':'10px'}}/>
      <h4>{props.artist.name}</h4>
    </div>
  )
}



function App() {

  const [serverData, setServerData] = useState()

  useEffect(() => {
    let parsed = queryString.parse(window.location.search)
    let accessToken = parsed.access_token

    Promise.all([
      //we are first fetching the user data(to extract the name)
      fetch(
        'https://api.spotify.com/v1/me',{
          headers:{'Authorization': 'Bearer ' + accessToken}
        }
      )
      //and here we are fetching the playlists of the user
      ,fetch(
        'https://api.spotify.com/v1/me/playlists',{
          headers:{'Authorization': 'Bearer ' + accessToken}
        }
      )
      ,fetch(
        'https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=5',{
          headers:{'Authorization': 'Bearer ' + accessToken}
        }
      )
      ,fetch(
        'https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=5',{
          headers:{'Authorization': 'Bearer ' + accessToken}
        }
      )
      ,fetch(
        'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5',{
          headers:{'Authorization': 'Bearer ' + accessToken}
        }
      )
    ])
    .then(([userData, playlistData,favArtistDataLT,favArtistDataMT,favArtistDataST]) => {
         return Promise.all([userData.json(), playlistData.json()
           ,favArtistDataLT.json(),favArtistDataMT.json(),favArtistDataST.json()])
      })
      .then(([userData,playlistData,favArtistDataLT,favArtistDataMT,favArtistDataST])=>
      setServerData({
        user:{
          name:userData.display_name,
          //mapping the names of the playlists into corresponding ones
          playlists: playlistData.items.map(item => {
            return{
              name: item.name,
              songCount: item.tracks.total
            }
          }),
          favArtists:{
            longTerm:favArtistDataLT.items.map(item => {
              return{
                name: item.name,
                imageUrl: item.images[0].url
              }
            }),
            mediumTerm:favArtistDataMT.items.map(item => {
              return{
                name: item.name,
                imageUrl: item.images[0].url
              }
            }),
            shortTerm:favArtistDataST.items.map(item => {
              return{
                name: item.name,
                imageUrl: item.images[0].url
              }
            })
          }
        }
      })
    )

  },[])


  return (
    <div>
      { serverData ?
        <div>
          <header>
            <Introduction user={serverData.user}/>
          </header>
          <h2>Your all time favourite </h2>
          {
            serverData.user.favArtists.longTerm.map(artist=>
            <FavArtist artist={artist}/>)
          }
          <h2>Your medium time favourite </h2>
          {
            serverData.user.favArtists.mediumTerm.map(artist=>
            <FavArtist artist={artist}/>)
          }
          <h2>Your recent time favourite </h2>
          {
            serverData.user.favArtists.shortTerm.map(artist=>
            <FavArtist artist={artist}/>)
          }
          )
        </div> :
        <button onClick={() => {
            window.location = window.location.href.includes('localhost')
              ? 'http://localhost:8888/login'
              : 'http://spotify-analytics-backendd.herokuapp.com/login' }
          }
          style={{padding: '20px', 'font-size': '50px', 'margin-top': '20px'}}>Sign in with Spotify</button>
        }

    </div>
  );
}

export default App;

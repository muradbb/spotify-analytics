/* eslint-disable */
import React, { useState, useEffect} from 'react';
import queryString from 'query-string';
import logo from './logo.svg';
import './App.css';

function Introduction(props){
  // let allSongs=props.user.playlists.reduce(
  //   (songs, eachPlaylist)=>{
  //     return songs.concat(eachPlaylist.songs)
  //   },
  //   []
  // )
  return(
    <div>
      <h1>Hello, {props.user.name}. You have {props.user.playlists.length} playlists which is a total of allSongs.length songs</h1>
    </div>
  )
}

function FavArtist(){
  return(
    <div style={{display:'inline-block'}}>
      <img/>
      <h3>Artist name</h3>
      <ul>
        <li>SongName</li>
        <li>SongName</li>
        <li>SongName</li>
      </ul>
    </div>
  )
}



function App() {

  const [serverData, setServerData] = useState()

  useEffect(() => {
    let parsed = queryString.parse(window.location.search)
    let accessToken = parsed.access_token

    Promise.all([fetch(
      'https://api.spotify.com/v1/me',{
        headers:{'Authorization': 'Bearer ' + accessToken}
      }
    ),fetch(
      'https://api.spotify.com/v1/me/playlists',{
        headers:{'Authorization': 'Bearer ' + accessToken}
      }
    )]).then(([userData, playlistData]) => {
         return Promise.all([userData.json(), playlistData.json()])
      }).then(([userData,playlistData])=>setServerData({
        user:{
          name:userData.display_name,
          playlists:playlistData.items
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
          {// {serverData.user.playlists.map(
          //   (playlists)=>
          //     <FavArtist/>
          // )}
        }
        </div> :
        <button onClick={() => {
            window.location = window.location.href.includes('localhost')
              ? 'http://localhost:8888/login'
              : 'https://better-playlists-backend.herokuapp.com/login' }
          }
          style={{padding: '20px', 'font-size': '50px', 'margin-top': '20px'}}>Sign in with Spotify</button>
        }
      }
    </div>
  );
}

export default App;

/* eslint-disable */
import React, { useState, useEffect} from 'react';
import queryString from 'query-string';
import logo from './logo.svg';
import './App.css';

function Introduction(props){
  let allSongs=props.user.playlists.reduce(
    (songCount, eachPlaylist)=>{
      return songCount.concat(eachPlaylist.songCount)
    },
    []
  )
  let totalSongs=allSongs.reduce((accumulator, currentValue) => accumulator + currentValue)
  return(
    <div>
      <h1>Hello, {props.user.name}. You have {props.user.playlists.length} playlists which is a total of {totalSongs}.</h1>
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
      //we are first fetching the user data
    ),fetch(
      //and here we are fetching the playlists of the user
      'https://api.spotify.com/v1/me/playlists',{
        headers:{'Authorization': 'Bearer ' + accessToken}
      }
    )])
    .then(([userData, playlistData]) => {
         return Promise.all([userData.json(), playlistData.json()])
      })
      .then(([userData,playlistData])=>
      setServerData({
        user:{
          name:userData.display_name,
          //mapping the names of the playlists into corresponding ones
          playlists: playlistData.items.map(item => {
          //  console.log(item.name)
            //console.log(item.tracks.total)
            return{name: item.name,
            songCount: item.tracks.total}
          })
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

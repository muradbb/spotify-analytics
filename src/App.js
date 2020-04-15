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
      <h1>Hello, props.user.name}. You have {props.playlists.playlists.length} playlists which is a total of allSongs.length songs</h1>
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

  const [user, setUser] = useState()
  const [playlists, setPlaylists] = useState()

  useEffect(() => {
    let parsed = queryString.parse(window.location.search);
    let accessToken = parsed.access_token;

    // fetch(
    //   'https://api.spotify.com/v1/me',{
    //     headers:{'Authorization': 'Bearer ' + accessToken}
    //   }
    // ).then(
    //   response => response.json()
    // ).then(
    //   data=>setUser({
    //       name:data.display_name
    //
    //   })
    // )

    fetch(
      'https://api.spotify.com/v1/me/playlists',{
        headers:{'Authorization': 'Bearer ' + accessToken}
      }
    ).then(
      response => response.json()
    ).then(
      data=>setPlaylists({
          playlists:data.items
        })
    )
  },[])


  return (
    <div>
      { (user || playlists) ?
        <div>
          <header>
            <Introduction user={user} playlists={playlists}/>
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

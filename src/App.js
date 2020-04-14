/* eslint-disable */
import React, { useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';

let dummyServerData={
  user:{
    name: "Tofiq",
    playlists:[
      {
        name: "cool songs",
        songs:[
          {name: "sik", durationn:1234},
          {name: "sik", durationn:1234},
          {name: "sik", durationn:1234}
        ]
      },
      {
        name: "pool songs",
        songs:[
          {name: "sik", durationn:1234},
          {name: "sik", durationn:1234},
          {name: "sik", durationn:1234}
        ]
      },
      {name: "tool songs",
      songs:[
        {name: "sik", durationn:1234},
        {name: "sik", durationn:1234},
        {name: "sik", durationn:1234}
      ]
      }
    ]
  }
}


function Introduction(props){
  let allSongs=props.user.playlists.reduce(
    (songs, eachPlaylist)=>{
      return songs.concat(eachPlaylist.songs)
    },
    []
  )
  return(
    <div>
      <h1>Hello, {props.user.name}. You have {props.user.playlists.length} playlists which is a total of {allSongs.length} songs</h1>
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
 const [serverData, setServerData] = useState(dummyServerData)
  return (
    <div>
      <header>
        <Introduction user={serverData.user}/>
      </header>
      <FavArtist/>
      <FavArtist/>
      <FavArtist/>
      <FavArtist/>
    </div>
  );
}

export default App;

import React from 'react';
import logo from './logo.svg';
import './App.css';

let appStyle={
  bgcolor:'#2F3133'
}

function Introduction(){
  return(
    <div>
      <h1>You have "N" playlists which is a total of "N" hours</h1>
    </div>
  )
}

function FavArtists(){
  return(
    <div>
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
  return (
    <div style={appStyle}>
      <header>
      <Introduction/>
      </header>
      <FavArtists/>
    </div>
  );
}

export default App;

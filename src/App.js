/* eslint-disable */
import React, { useState, useEffect} from 'react';
import queryString from 'query-string';
import logo from './logo.svg';
import './App.css';
import Collapsible from 'react-collapsible';
import { Chart } from "react-google-charts";


var randomColor = require('randomcolor')
const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
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
      <h1>
        Hello, {props.user.name}. You have {props.user.playlists.length} playlists which is a total of {totalSongs} songs.
      </h1>
    </div>
  )
}

function FavArtist(props){
  return(
    <div className="flip-card">
     <div className="flip-card-inner">
        <div className="flip-card-front">
           <img src={props.artist.imageUrl} style={{width:'220px' ,height:'220px'}}/>
        </div>
        <div className="flip-card-back">
           <h2>{props.artist.name}</h2>
           <p>Followers: {props.artist.followers}</p>
           <p>Genres:{props.artist.genres.length>0 ? props.artist.genres.map(
               (genre,index)=>" "+capitalize(genre)+(index < props.artist.genres.length - 1 ? ',' : '.')
             ) : " No genres available for this artist"}</p>
           <p>Popularity:{props.artist.popularity}</p>
        </div>
     </div>
    </div>
  )
}



function FavTracks(props){
  return(
    <div className="songBlock">
        <ol>
          {props.tracks.map((track)=><li>{" "+track.name+" - "+track.artist}</li>)}
        </ol>
    </div>
  )
}

function UserTrends(props){

  function getOcurrences(list,value){
    return list.filter((v) => (v === value)).length
  }
  let allLTgenres=props.LTartists.reduce(
    (genres,artist)=> {return genres.concat(artist.genres)},[])
  let allMTgenres=props.MTartists.reduce(
    (genres,artist)=> {return genres.concat(artist.genres)},[])
  let allSTgenres=props.STartists.reduce(
    (genres,artist)=> {return genres.concat(artist.genres)},[])
  function ocurrenceSort(a,b){
    return b.percentage-a.percentage
  }
  let LTgenrePercentages=[...(new Set(allLTgenres))].map(item=>{
    return{
      title:capitalize(item),
      value:getOcurrences(allLTgenres,item)
      //Math.round(((getOcurrences(allLTgenres,item)/allLTgenres.length)*100)*100)/100,
    }
  })
  let MTgenrePercentages=[...(new Set(allMTgenres))].map(item=>{
    return{
      title:item,
      value:Math.round(((getOcurrences(allLTgenres,item)/allLTgenres.length)*100)*100)/100,
    }
  })
  let STgenrePercentages=[...(new Set(allSTgenres))].map(item=>{
    return{
      title:item,
      value:Math.round(((getOcurrences(allLTgenres,item)/allLTgenres.length)*100)*100)/100,
    }
  })

  LTgenrePercentages.sort(ocurrenceSort)
//  console.log([LTgenrePercentages.map(item=>[item.title,item.value])][0])
//console.log(LTgenrePercentages.map(item=>[item.title,item.value]))
  let chartData=([["genre","value"]
])

  LTgenrePercentages.slice(0,30).map(item=>chartData.push([item.title,item.value]))
  console.log(chartData)
  return(
    <div className="PieChartt">
      <h3>This is a Pie Chart for the genres you listen to</h3>
      <Chart
        width={'800px'}
        height={'600px'}
        chartType="PieChart"
        loader={<div>Loading Chart</div>}
        data={chartData}
        options={{
          backgroundColor: { fill:'transparent' },
          chartArea: {'width': '100%', 'height': '90%'},
          legend:{
            position: 'labeled',
      labeledValueText: 'both',
      textStyle: {
          color: 'white',
          fontSize: 14
          }
        }}}
        rootProps={{ 'data-testid': '1' }}
      />
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
      //the following 3 fetches are user's top artists in long medium and short term in that order
      ,fetch(
        'https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=50',{
          headers:{'Authorization': 'Bearer ' + accessToken}
        }
      )
      ,fetch(
        'https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=50',{
          headers:{'Authorization': 'Bearer ' + accessToken}
        }
      )
      ,fetch(
        'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=50',{
          headers:{'Authorization': 'Bearer ' + accessToken}
        }
      )
      //the folloewing 3 fetches are user's top tracks in the above order
      ,fetch(
        'https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50',{
          headers:{'Authorization': 'Bearer ' + accessToken}
        }
      )
      ,fetch(
        'https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50',{
          headers:{'Authorization': 'Bearer ' + accessToken}
        }
      )
      ,fetch(
        'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50',{
          headers:{'Authorization': 'Bearer ' + accessToken}
        }
      )
    ])
    .then(([userData, playlistData,favArtistDataLT,favArtistDataMT,favArtistDataST,favTracksLT,favTracksMT,favTracksST]) => {
         return Promise.all([userData.json(), playlistData.json()
           ,favArtistDataLT.json(),favArtistDataMT.json(),favArtistDataST.json()
           ,favTracksLT.json(),favTracksMT.json(),favTracksST.json()])
      })
      .then(([userData,playlistData,favArtistDataLT,favArtistDataMT,favArtistDataST,favTracksLT,favTracksMT,favTracksST])=>
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
                imageUrl: item.images[0].url,
                genres: item.genres,
                followers:item.followers.total,
                popularity:item.popularity

              }
            }),
            mediumTerm:favArtistDataMT.items.map(item => {
              return{
                name: item.name,
                imageUrl: item.images[0].url,
                genres: item.genres,
                followers:item.followers.total,
                popularity:item.popularity
              }
            }),
            shortTerm:favArtistDataST.items.map(item => {
              return{
                name: item.name,
                imageUrl: item.images[0].url,
                genres: item.genres,
                followers:item.followers.total,
                popularity:item.popularity
              }
            })
          },
          favTracks:{
            longTerm:favTracksLT.items.map(item => {
              return{
                name: item.name,
                artist:item.artists[0].name,
                album:item.album.name
              }
            }),
            mediumTerm:favTracksMT.items.map(item => {
              return{
                name: item.name,
                artist:item.artists[0].name,
                album:item.album.name
              }
            }),
            shortTerm:favTracksST.items.map(item => {
              return{
                name: item.name,
                artist:item.artists[0].name,
                album:item.album.name
              }
            }),

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
           <div className="FavArtists">
           <h2>Your all time favourite </h2>
           {
             serverData.user.favArtists.longTerm.slice(0,5).map(artist=>
             <FavArtist artist={artist}/>)
           }
           <h2>Your medium time favourite </h2>
           {
             serverData.user.favArtists.mediumTerm.slice(0,5).map(artist=>
             <FavArtist artist={artist}/>)
           }
           <h2>Your recent time favourite </h2>
           {
             serverData.user.favArtists.shortTerm.slice(0,5).map(artist=>
             <FavArtist artist={artist}/>)
           }
         </div>
         <div className="FavTracks">
          <Collapsible trigger="Your all time favourite tracks">
             <FavTracks tracks={serverData.user.favTracks.longTerm}/>
          </Collapsible>
          <Collapsible trigger="Your favourite tracks for the last 6 months">
             <FavTracks tracks={serverData.user.favTracks.mediumTerm}/>
          </Collapsible>
          <Collapsible trigger="Your favourite tracks for the last 4 weeks">
             <FavTracks tracks={serverData.user.favTracks.shortTerm}/>
          </Collapsible>
         </div>
         <UserTrends LTartists={serverData.user.favArtists.longTerm}
           MTartists={serverData.user.favArtists.mediumTerm}
           STartists={serverData.user.favArtists.shortTerm}/>
        </div> :
        <button onClick={() => {
            window.location = window.location.href.includes('localhost')
              ? 'http://localhost:8888/login'
              : 'http://spotify-analytics-backendd.herokuapp.com/login' }
          }
          style={{padding: '20px', 'font-size': '50px', 'marginTop': '20px'}}>Sign in with Spotify</button>
        }

    </div>
  )
}

export default App;

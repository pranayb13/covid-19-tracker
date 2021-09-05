import React from 'react'
import './App.css';
import "leaflet/dist/leaflet.css";
import { MenuItem,FormControl,Select,Card,CardContent} from "@material-ui/core";
import { useState } from 'react';
import { useEffect } from 'react';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { sortData } from './util';
import LineGraph from './LineGraph';
import { prettyPrintStat } from './util';
// https://disease.sh/v3/covid-19/countries

// UseEffect = Runs a piece of code based on a given condition


function App() {
  const [Countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, settableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({lat:34.80746 ,lng : -40.4796});
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response=>response.json())
    .then((data)=>{
      setCountryInfo(data);
    });

  }, []);
  useEffect(() => {
    //Async -> send a request to the servers , wait for it , do something with it

    const getCountriesData=async() =>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
          const Countries = data.map((country) =>({
              name:country.country, //United States , United Kingdom
              value:country.countryInfo.iso2 //UK,USA,FR
            }));
            const sortedData = sortData(data);
            settableData(sortedData);
            setMapCountries(data);
            setCountries(Countries);
      });
    };
    getCountriesData();
  }, [Countries])
  const onChangeCountry = async(event) =>{
    const countryCode = event.target.value;
    // console.log("Yooo>>>",countryCode);
    setCountry(countryCode);

    const url = countryCode === 'worldwide' ? "https://disease.sh/v3/covid-19/all" : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then(response => response.json())
    .then (data =>{
      setCountry(countryCode);
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    });
  };
  // console.log("countryInfo",countryInfo);
  return (
    <div className="App">
      <div className="app__left">

        <div className="app__header">
          <h1>Covid-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" onChange={onChangeCountry} value={country}>
              {/* Loop Thorugh all the ocuntries list and show it in the dropdown */}

              {/* <MenuItem value="worldwide">WorldWide</MenuItem>
              <MenuItem value="worldwide">Option 1</MenuItem>
              <MenuItem value="worldwide">Option 2</MenuItem>
            <MenuItem value="worldwide">Option 3</MenuItem> */}
              <MenuItem value="worldwide">WorldWide</MenuItem>
              {
                Countries.map(country =>(
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox isRed active={casesType==='cases'} onClick={e=>setCasesType('cases')} title="Coronovirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)}></InfoBox>
          <InfoBox active={casesType==='recovered'} onClick={e=>setCasesType('recovered')} title="Recovered Cases" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)}></InfoBox>
          <InfoBox isRed active={casesType==='deaths'} onClick={e=>setCasesType('deaths')} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}></InfoBox>
        </div>
        <Map countries={mapCountries} casesType={casesType} center={mapCenter} zoom={mapZoom}/>
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by country</h3>
          <Table countries={tableData}></Table>
          <h3 className="graph__title">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph"casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;

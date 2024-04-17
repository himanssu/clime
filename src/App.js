import { Box, Container, Grid, Link, Typography, SvgIcon } from "@mui/material";
import useStyles from "./Components/Styles/styles";
import GitHubIcon from "@mui/icons-material/GitHub";
import CircularProgress from "@mui/material/CircularProgress";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Search from "./Components/Search/Search";
import CurrentWeather from "./Components/Current_Weather/CurrentWeather";
import WeekWeather from "./Components/Week_Weather/WeekWeather";
import { fetchWeatherData, getTodayForecastWeather, getWeekForecastWeather } from "./Components/API/Api";
import { transformDateFormat } from "./Components/Constants/Time";
import { ReactComponent as SplashIcon } from "./Components/Styles/moonIcon.svg";
import Logo from "./Components/Styles/logo.png";
import Bmc from "./Components/Styles/bmc.png";
import React, { useEffect, useState } from "react";

function App() {
  const classes = useStyles();

  const [lat, setLat] = useState();
  const [lon, setLon] = useState();
  const [city, setCity] = useState();
  const [todayWeather, setTodayWeather] = useState(null);
  const [todayForecast, setTodayForecast] = useState(null);
  const [weekForecast, setWeekForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  // Function to fetch weather data if latitude and longitude are available
  const fetchData = async () => {
    if (lat && lon) {
      setIsLoading(true);
      try {
        const currentDate = transformDateFormat();
        const [todayWeatherResponse, weekForecastResponse] = await fetchWeatherData(lat, lon);
        const todayForecastsList = getTodayForecastWeather( weekForecastResponse, currentDate );
        const weekForecastsList = getWeekForecastWeather( weekForecastResponse, currentDate );
        
        if(!city) {
          const cityName = todayWeatherResponse.name + ", " + todayWeatherResponse.sys.country;
          setCity(cityName);
          setTodayWeather({city:cityName, ...todayWeatherResponse });
        }
        if(city) {
          setTodayWeather({city:city, ...todayWeatherResponse });
        }
        setTodayForecast([...todayForecastsList]);
        setWeekForecast([...weekForecastsList]);

        setIsLoading(false);
      } catch (error) {
        setError(true);
        setIsLoading(false);
      }
    }
  };

  // Fetch user's geolocation to update latitude and longitude
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition( (position) => {
        setLat(position.coords.latitude);
        setLon(position.coords.longitude);
      });
    } else {
      console.log("Geolocation is not supported by your browser. Please use latest browser.");
    }
  }, []);

  // Update document title when the city changes
  useEffect(() => {
    if(city) {
      document.title = `Clime - ${city.slice(0,city.length-4)}`;
    }
  }, [city]);

  // Fetch data whenever latitude or longitude changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [lat, lon]);

  // Handle search input change to update latitude and longitude
  const handleOnSearchChange = (searchData) => {
    setLat(searchData.value.split(" ")[0]);
    setLon(searchData.value.split(" ")[1]);
    setCity(searchData.label);
  };

  let weatherContent = (
    <Box xs={12} className={classes.emptyContainer}>
      <SvgIcon component={SplashIcon} inheritViewBox className={classes.emptyContainerImg} />
      <Typography variant="h4" component="h4" className={classes.emptyContainerText} >
        Enable location services or manually search for your city to discover current weather conditions and a 4-5 day forecast for your city.
      </Typography>
    </Box>
  );

  if (isLoading) {
    weatherContent = (
      <Box className={classes.loadingContainer}>
        <Box className={classes.loadingContainerBox}>
          <CircularProgress className={classes.loadingContainerImg} />
          <Typography variant="h3" component="h3" className={classes.loadingContainerText} >
            Loading...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (todayWeather && weekForecast) {
    weatherContent = (
      <React.Fragment>
        <Grid item xs={12} md={6}>
          <CurrentWeather data={todayWeather} forecastList={todayForecast} />
        </Grid>
        <Grid item xs={12} md={6}>
          <WeekWeather data={weekForecast} />
        </Grid>
      </React.Fragment>
    );
  }

  if (error) {
    weatherContent = (
      <Box className={classes.errorContainer}>
        <ErrorOutlineIcon className={classes.errorContainerImg} />
        <Typography variant="h2" component="h2" className={classes.errorContainerText} >
          Internal Server Error
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Container className={classes.container}>
        <Grid container columnSpacing={2}>
          <Grid item xs={12}>
            <Box className={classes.topBox}>
              <Box component="img" alt="Website Logo" src={Logo} className={classes.appLogo} />
              <Box className={classes.topLinks}>
                <Link href="https://www.linkedin.com/in/himanssu" target="_blank" >
                  <LinkedInIcon className={classes.linkedinIcon} />
                </Link>
                <Link href="https://github.com/himanssu" target="_blank">
                  <GitHubIcon className={classes.gitIcon} />
                </Link>
              </Box>
            </Box>
            <Search onSearchChange={handleOnSearchChange} />
          </Grid>
          {weatherContent}
        </Grid>
      </Container>
    </>
  );
}

export default App;

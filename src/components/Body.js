import React, { useEffect, useState, useMemo } from "react"; // Import useMemo
import { swiggyApi } from "../Constants";
import { defaultLat,defaultLon } from "../Constants";
import RestaurantCard from "./RestaurantCard";
import Shimmer from "./Shimmer";
import { filterRestaurant } from "../utils/helper";

const Body = () => {
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: defaultLat, lon: defaultLon });

  // Fetch restaurants based on user location or default
  useEffect(() => {
    getGeolocation();
  }, []);

  // Function to get user's geolocation
  const getGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          getRestaurants(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error fetching location, using default location.", error);
          getRestaurants(defaultLat, defaultLon); // Fetch with default location
        }
      );
    } else {
      console.error("Geolocation not supported, using default location.");
      getRestaurants(defaultLat, defaultLon); // Fetch with default location
    }
  };

  // Fetch restaurants from API
  const getRestaurants = async (lat, lon) => {
    try {
      const apiUrl = `https://foodfire.onrender.com/api/restaurants?lat=${lat}&lng=${lon}&page_type=DESKTOP_WEB_LISTING`;
      //const apiUrl = `${swiggyApi}?lat=${lat}&lng=${lon}&page_type=DESKTOP_WEB_LISTING`; 

      const response = await fetch(apiUrl);
      const json = await response.json();

      // Function to find the restaurant data in the API response
      async function checkJsonData(jsonData) {
        for (let i = 0; i < jsonData?.data?.cards.length; i++) {
          let checkData =
            json?.data?.cards[i]?.card?.card?.gridElements?.infoWithStyle
              ?.restaurants;
          if (checkData !== undefined) {
            return checkData;
          }
        }
      }

      const resData = await checkJsonData(json);
      setAllRestaurants(resData || []); // Fallback to empty array if no data
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
      setError("Unable to fetch restaurant data.");
    }
  };

  // Memoize the filtered restaurants based on search input
  const filteredRestaurants = useMemo(() => {
    if (search === "") {
      return allRestaurants;
    }
    const filtered = filterRestaurant(allRestaurants, search);
    if (filtered.length === 0) {
      setError("No results found");
    } else {
      setError(null); // Clear error if results are found
    }
    return filtered;
  }, [allRestaurants, search]); // Dependencies

  return (
    <>
      <div className="p-4 text-center rounded-xl mx-40 ">
      <input
        data-testid="search-input"
        className="text-center w-full sm:w-3/4 md:w-2/3 lg:w-1/2 px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        type="text"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button
        data-testid="search-btn"
        className="mt-2 sm:mt-0 sm:ml-2 px-2 py-1 bg-pink-300 text-white rounded-md hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
        onClick={() => setSearch(search)}
      >
          Search
        </button>
      </div>
      {error && (
        <p className="text-center text-red-500 font-bold p-2">{error}</p>
      )}
      {allRestaurants?.length === 0 ? (
        <Shimmer />
      ) : (
        <div
          data-testid="res-list"
          className="flex flex-wrap justify-center flex-row mx-20"
        >
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant?.info.id} {...restaurant?.info} />
          ))}
        </div>
      )}
    </>
  );
};

export default Body;

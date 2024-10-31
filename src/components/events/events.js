import React, { useEffect, useState } from "react";
import "./events.css";
import MenuBar from "../menumain/menubar";
import Footer from "../Footer";
import WorkshopItem from "./workItem";
import axios from 'axios';

const UpcomingWorkshops = () => {

  const [eventData, setEventData] = useState([]); 

  const getEvents = async () => {
    const requestBody = {};
    try {
      const response = await axios.get(
        "https://agathiyarpyramid.org/api/get-events",
        requestBody
      );
      setEventData(response.data);
      console.log("Events loaded successsully:", response.data);
    } catch (error) {
      console.error("Error loading events", error);
    }
  };

  useEffect(()=> {
    getEvents()
  }, [])
  return (
    <div className="workshop-page">
      <MenuBar />
      <div className="workshop-list">
        {eventData &&
          eventData.map((data, index) => {
            return <WorkshopItem key={index} {...data} />;
          })}
      </div>
      <Footer />
    </div>
  );
};

export default UpcomingWorkshops;

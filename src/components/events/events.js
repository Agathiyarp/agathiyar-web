import React, { useEffect, useState } from "react";
import "./events.css";
import MenuBar from "../menumain/menubar";
import Footer from "../Footer";
import WorkshopItem from "./workItem";
import axios from "axios";

const UpcomingWorkshops = () => {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getEvents = async () => {
    try {
      const response = await axios.get("https://agathiyarpyramid.org/api/get-events");
      setEventData(response.data || []);
      console.log("Events loaded successfully:", response.data);
    } catch (error) {
      console.error("Error loading events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  return (
    <div className="workshop-page">
      <MenuBar />
      <div className="workshop-list">
        {loading ? (
          <p className="event-status-message">Loading events...</p>
        ) : eventData.length === 0 ? (
          <div className="no-events-container">
            <p className="event-status-message">No Events found.</p>
          </div>
        ) : (
          eventData.map((data, index) => <WorkshopItem key={index} {...data} />)
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UpcomingWorkshops;

import React from "react";
import "./events.css";
import MenuBar from "../menumain/menubar";
import Footer from "../Footer";
import WorkshopItem from "./workItem";

import ActivityImage from '../../images/ActivityImage.png';
import MeditationImage from  '../../images/meditation.png'

const UpcomingWorkshops = () => {
  const eventData = [
    {
      hostName: "Meditation",
      hostTitle: "Founder, Agathiyar",
      workshopTitle: "Ultimate Health Challenge",
      price: 990,
      description:
        "If you want to reach your ultimate peak health, then this workshop is for you. Learn 7 revolutionary habits over a span of 21 days!",
      timeLeft: "2 DAYS 1 HRS",
      startDate: "7th Oct",
      duration: "21 Days",
      timing: ["6 - 7 am", "8 - 9 am", "4 - 5 pm", "8 - 9 pm"],
      language: "English",
      eventImage: MeditationImage
    },
    {
      hostName: "Event",
      hostTitle: "Founder, Agathiyar",
      workshopTitle: "Ultimate Health Challenge",
      price: 990,
      description:
        "If you want to reach your ultimate peak health, then this workshop is for you. Learn 7 revolutionary habits over a span of 21 days!",
      timeLeft: "2 DAYS 1 HRS",
      startDate: "7th Oct",
      duration: "21 Days",
      timing: ["6 - 7 am", "8 - 9 am", "4 - 5 pm", "8 - 9 pm"],
      language: "English",
      eventImage: ActivityImage
    },
  ];
  return (
    <div className="workshop-page">
      <MenuBar />
      {/* Top Banner Section */}
      <div className="banner-section">
        <h1>Join Our Upcoming Events</h1>
      </div>
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

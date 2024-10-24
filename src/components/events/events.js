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
      hostName: "Meditation Retreat",
      hostTitle: "Master Pradeep Vijay",
      workshopTitle: "Silence and Meditaion Retreat",
      price: "45,000",
      description:
        "Detox diet, Intense Meditation with crystal pyramid, spirituality in practical life. Practice of mindfulness and silence and inner stiffness. Emotional & mental healing.",
      timeLeft: "5 DAYS 10 HRS",
      startDate: "22nd Nov",
      duration: "9 Days",
      language: "English",
      eventImage: MeditationImage
    },
    {
      hostName: "Event",
      hostTitle: "Founder, Agathiyar",
      workshopTitle: "Agathiyar Event Program",
      price: 800,
      description:
        "If you want to reach your ultimate peak health, then this workshop is for you. Learn 7 revolutionary habits over a span of 21 days!",
      timeLeft: "2 DAYS 1 HRS",
      startDate: "7th Oct",
      duration: "21 Days",
      language: "English",
      eventImage: ActivityImage
    },
  ];
  return (
    <div className="workshop-page">
      <MenuBar />
      {/* Top Banner Section */}
      {/* <div className="banner-section">
        <h1>Join Our Upcoming Events</h1>
      </div> */}
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

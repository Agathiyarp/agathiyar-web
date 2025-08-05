import React from "react";
import Slider from "react-slick";
import "./home.css"; // Custom CSS
import Meditation from "../Meditation";
import GridViewVeg from "../GridViewVeg";
import GridViewAgath from "../GridViewAgath";
import MeditationInfo from "../../components/MeditationInfo";
import Footer from "../Footer";
import MenuBar from "../menumain/menubar"; // Import the MenuBar
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AgathiyarAbout from "../AboutAgathiyar";

const Home = () => {

  return (
    <div className="app-container">
      {/* Header */}
      <MenuBar /> {/* Use MenuBar here */}
     
      <div className="carousel-container" style={{ marginTop: "64px" }}>
        <div className="video-wrapper">
          <video controls autoPlay muted loop>
            <source src="https://www.agathiyarpyramid.org/videos/Meditation.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Content Section */}
      <div className="mission-vision-wrapper">
        <div className="card1">
          <h3 className="card-title1">VISION</h3>
          <p className="card-text">
            We envision a world awakened to inner peace, where individuals live in harmony with themselves,
            others, and nature—guided by the principles of non-violence, silence, meditation, and lifelong
            learning. Our Ashram aspires to be a beacon of stillness and spiritual nourishment, inspiring a
            global community to embrace conscious living and compassionate wisdom.
          </p>
        </div>

        <div className="card1">
          <h3 className="card-title1">MISSION</h3>
          <p className="card-text">
            At our Ashram, we are dedicated to nurturing a way of life rooted in vegetarian living, inner
            silence, deep meditation, and the wisdom of books. We provide a sacred space for seekers to turn
            inward, cultivate peace, and grow spiritually through mindful living, compassionate choices,
            and the transformative power of knowledge.
          </p>
        </div>
      </div>

      <div>
        <MeditationInfo />
      </div>

      <AgathiyarAbout />
     
      <div>
        <Meditation />
      </div>

      <div>
        <GridViewVeg />
      </div>

      <div>
        <GridViewAgath />
      </div>

      {/* <div>
        <h1 className="meditation-heading">Image Gallery</h1>
        <ImageGallery />
      </div> */}
      <Footer />
    </div>
  );
};

export default Home;
import React from "react";
import Slider from "react-slick";
import "./home.css"; // Custom CSS
import Meditation from "../Meditation";
import GridViewVeg from "../GridViewVeg";
import GridViewAgath from "../GridViewAgath";
import MeditationInfo from "../../components/MeditationInfo";
import Footer from "../Footer";
import ImageGallery from "../../components/ImageGallery";
import MenuBar from "../menumain/menubar"; // Import the MenuBar
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import image0 from "../../images/home-image.gif";
// import image1 from "../../images/image1.png";
// import image2 from "../../images/image2.png";
// import image3 from "../../images/image3.png";
// import image4 from "../../images/image4.png";
// import image5 from "../../images/image5.png";
// import MeditationVideo from "../../images/Meditation.mp4";

const statements = [
  "To teach meditation and spiritual science to all seekers of the truth.",
  "A conducive environment for practicing Mouna (Silence), Mindfulness, and intense Meditation.",
  "Self healing and Self realization in the lap of mother nature along with pyramid energies.",
  "Spreading the message of compassion and vegetarian living to all humanity.",
];

const Home = () => {
  const settings = {
    // dots: true,
    // infinite: true,
    // speed: 500,
    slidesToShow: 1,
    // slidesToScroll: 1,
    // autoplay: true,
    // autoplaySpeed: 3000,
  };

  const images = [
    { src: image0, alt: "Slide 1" }
    // { src: image2, alt: "Slide 2" },
    // { src: image3, alt: "Slide 3" }
  ];

  return (
    <div className="app-container">
      {/* Header */}
      <MenuBar /> {/* Use MenuBar here */}
     
      <div className="carousel-container" style={{ marginTop: "64px" }}>
        <div key={0}>
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
          <button className="more-info-button">More Info</button>
        </div>

        <div className="card1">
          <h3 className="card-title1">MISSION</h3>
          <p className="card-text">
            At our Ashram, we are dedicated to nurturing a way of life rooted in vegetarian living, inner
            silence, deep meditation, and the wisdom of books. We provide a sacred space for seekers to turn
            inward, cultivate peace, and grow spiritually through mindful living, compassionate choices,
            and the transformative power of knowledge.
          </p>
          <button className="more-info-button">More Info</button>
        </div>
      </div>


      <MeditationInfo />
     
      <div>
        <h1 className="meditation-heading">How to do Meditation?</h1>
        <Meditation />
      </div>

      <div>
        <h1 className="meditation-heading">Being a Vegetarian</h1>
        <GridViewVeg />
      </div>

      <div>
        <h1 className="meditation-heading">Swadhyayam</h1>
        <GridViewAgath />
      </div>

      <div>
        <h1 className="meditation-heading">Image Gallery</h1>
        <ImageGallery />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
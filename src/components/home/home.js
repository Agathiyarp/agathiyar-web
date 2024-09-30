import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import Slider from "react-slick";
import "./home.css"; // Custom CSS
import Meditation from "../Meditation";
import GridViewVeg from "../GridViewVeg";
import GridViewAgath from "../GridViewAgath";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AdminIconWithRoles from "../../components/menu/admin";
//import Menu from '../../components/menu/menu';
import MeditationInfo from "../../components/MeditationInfo";
import Footer from "../Footer";
import ImageGallery from "../../components/ImageGallery";
import mainlogo from "../../images/mainlogo.png";
import image1 from "../../images/image1.png";
import image2 from "../../images/image2.png";
import image3 from "../../images/image3.png";
import image4 from "../../images/image4.png";
import image5 from "../../images/image5.png";

const statements = [
  "To teach meditation and spiritual science to all seekers of the truth.",
  "A conducive environment for practicing Mouna (Silence), Mindfulness, and intense Meditation.",
  "Self healing and Self realization in the lap of mother nature along with pyramid energies.",
  "Spreading the message of compassion and vegetarian living to all humanity.",
];
const Home = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };
  const images = [
    { src: image1, alt: "Slide 1" },
    { src: image2, alt: "Slide 2" },
    { src: image3, alt: "Slide 3" },
    { src: image4, alt: "Slide 4" },
    { src: image5, alt: "Slide 5" },
  ];

  return (
    <div className="app-container">
      {/* Header */}
      <AppBar
        position="fixed"
        className="fixed-header"
        sx={{ backgroundColor: "white" }}
      >
        <Toolbar disableGutters>
          <img src={mainlogo} alt="Logo" className="logo" />
          <Typography
            sx={{
              fontSize: "23px",
              fontWeight: "bold",
              color: "black",
              flexGrow: 1,
            }}
          >
            AGATHIYAR PYRAMID <br />
            DHYANA ASHRAM
            <br />
            <span style={{ fontSize: 14 }}>Mounam - Dhyanam - Gnanam</span>
          </Typography>

          <div
            className="menu"
            style={{
              display: "flex",
              alignItems: "center",
              paddingLeft: "40px",
            }}
          >
            {[
              "Home",
              "Events",
              "Videos",
              "Contact Us",
              "Donate",
              "About",
              "Books",
              "Login",
            ].map((text) => (
              <Button
                key={text}
                sx={{ color: "black", fontWeight: "bold", marginRight: "12px" }}
              >
                {text}
              </Button>
            ))}
          </div>
          <AdminIconWithRoles />
        </Toolbar>
      </AppBar>

      <div className="carousel-container" style={{ marginTop: "2px" }}>
        <Slider {...settings}>
          {images.map((image, index) => (
            <div key={index}>
              <img src={image.src} alt={image.alt} className="carousel-image" />
            </div>
          ))}
        </Slider>
      </div>

      {/* Content Section */}
      <div className="mission-statements-container">
        <h2 class="vision-heading">Our Vision</h2>
        <div className="single-image-container">
          <img src={image5} alt={"our vision"} className="single-image" />
        </div>
        <ul className="mission-list">
          {statements.map((statement, index) => (
            <li key={index} className="mission-item">
              {statement}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <MeditationInfo />
        {/* Other components */}
      </div>
      <div>
        <h1 className="meditation-heading">How to do Meditation ?</h1>
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
        <h1>Image Gallery</h1>
        <ImageGallery />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};
export default Home;

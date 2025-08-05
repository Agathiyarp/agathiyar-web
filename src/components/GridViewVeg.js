import React from 'react';
import ImageTextSection from './ImageTextSection';
import vegImage from '../images/home/home4.jpg';

const VegetarianSection = () => {
  return (
    <ImageTextSection
      imageSrc={vegImage}
      title="Being a Vegetarian"
      content="Vegetarianism is a conscious effort a deliberate effort to get out of the heaviness that keeps you tethered to the Earth so that you can fly. So that the flight from the alone to the alone becomes possible."
    />
  );
};

export default VegetarianSection;
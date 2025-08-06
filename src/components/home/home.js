import React from "react";
import Slider from "react-slick";
import "./home.css"; // Custom CSS
import Meditation from "../Meditation";
// import GridViewVeg from "../GridViewVeg";
// import GridViewAgath from "../GridViewAgath";
import MeditationInfo from "../../components/MeditationInfo";
import Footer from "../Footer";
import MenuBar from "../menumain/menubar"; // Import the MenuBar
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AgathiyarAbout from "../AboutAgathiyar";
import HomeSection from './section/HomeSection';
import corePrincipleImg from '../../images/home/core-principle.png';
import mounamImg from '../../images/home/meditation1.png';
import swathayayam from '../../images/home/swathayayam.png';
import meditationImg from '../../images/home/meditation3.png';
import ImageSection from '../home/section/ImageSection';
import vegImage from '../../images/home/home4.jpg';

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
            Our vision is to become the international headquarters for Mouna Dhyanam (Silent Meditation), serving as a global sanctuary for spiritual growth. Guided by the seven core principles of Silence, Meditation, Vegetarianism, and Swadhyayam, we aim to foster self-mastery and inner peace. We will leverage the unique energy of our pyramid to empower individuals on their journey, inspiring a life of selfless Service and creating a worldwide community dedicated to higher consciousness.
          </p>
        </div>

        <div className="card1">
          <h3 className="card-title1">MISSION</h3>
          <p className="card-text">
            Our mission is to establish and operate the international headquarters for Mouna Dhyanam (Silent Meditation), providing a sanctuary for spiritual seekers worldwide. We empower individuals on their path to inner peace and self-realization by imparting the seven core principles of Silence, Meditation, Vegetarianism, Swadhyayam, Pyramid Energy, Self Mastery, and Service.
          </p>
        </div>
      </div>

      <div>
        <HomeSection
          title="Core Principles"
          description="We operate based on seven core principles—Silence, Meditation, Vegetarianism, Swadhyayam, Pyramid Energy, Self Mastery, and Service—form a path for personal and spiritual growth. The journey begins with Silence and Meditation to quiet the mind and foster self-awareness. A Vegetarian diet and Swadhyayam (self-study) support this inner work. The belief in Pyramid Energy is thought to enhance these practices. The ultimate goal is Self Mastery, which is then expressed through selfless Service to others.."
          image={corePrincipleImg}
          imagePosition="right"
        />
      </div>

      <div>
        <ImageSection
          imageSrc={mounamImg}
          title="Mounam/Silence"
          content="Silence plays a significant role in spiritual growth by fostering inner peace, self-awareness, and mindfulness. It allows individuals to connect with their inner selves, listen to their intuition, and gain clarity about their purpose and beliefs. Silence also helps in reducing mental noise, aligning one with the present moment, and deepening meditation or prayer practices. Overall, embracing silence facilitates a profound sense of spiritual connection and growth."
        />
      </div>

      <div>
        <HomeSection
          title="Dhyanam/Meditation"
          description="Anapanasati meditation is a mindfulness practice centered around breathing. The term 'Anapanasati' is a Pali word that translates to 'mindfulness of breathing.' It is a core meditation technique in Buddhism designed to develop concentration, awareness, and insight.

          In Anapanasati meditation, practitioners focus their attention on the breath, observing the sensation of inhalation and exhalation. The practice involves systematically increasing awareness of breathing patterns, often in conjunction with mindful observation of bodily sensations, thoughts, and feelings. This helps cultivate a calm, clear mind and deeper understanding of the nature of impermanence and self."
          image={meditationImg}
          imagePosition="right"
        />
      </div>

      <div>
        <ImageSection
          imageSrc={vegImage}
          title="Ahimsa/Vegetarianism"
          content="Vegetarianism is valued in many spiritual traditions as a way to practice non-violence (ahimsa) and compassion toward all living beings. It is believed to purify the body and mind, promoting inner peace, clarity, and emotional balance—qualities essential for spiritual growth. In yogic and meditative practices, a vegetarian diet is considered sattvic, meaning pure and calming, helping improve focus and awareness. Additionally, avoiding harm to animals is thought to generate positive karma and support one’s spiritual evolution. Thus, vegetarianism is seen not just as a dietary choice, but as a path to higher consciousness and ethical living."
        />
      </div>

      <div>
        <HomeSection
          title="Swadhyayam"
          description="Swadhyaya is the practice of self-study and introspection, a cornerstone of spiritual growth. It involves a deep exploration of one's own thoughts, beliefs, and actions, often guided by the study of sacred texts or philosophical principles. This process of self-inquiry helps individuals understand their true nature, identify personal limitations, and cultivate virtues. Ultimately, Swadhyaya leads to greater self-awareness, inner peace, and a deeper connection to one's spiritual path."
          image={swathayayam}
          imagePosition="right"
        />
      </div>

      <div>
        <ImageSection
          imageSrc={vegImage}
          title="Pyramid Energy"
          content="The concept of 'pyramid energy' is that the unique geometric structure of a pyramid can harness and amplify a form of cosmic or universal energy. These include enhancing meditation by promoting deeper states of focus and spiritual awareness, as well as possessing healing properties that can balance the body's energy fields and reduce stress. Additionally, it is believed that the pyramid shape can preserve organic matter and clear negative energy from a space, thereby creating a more positive and revitalized environment."
        />
      </div>

      <div>
        <HomeSection
          title="Self Mastery"
          description="'Be a light unto yourself' encourages self-reliance and inner awareness, which are key to self-mastery. By trusting your inner wisdom and taking responsibility for your actions, you develop self-discipline, emotional balance, and clarity. It helps you stay true to your values, make conscious choices, and grow from within—leading to true personal mastery."
          image={meditationImg}
          imagePosition="right"
        />
      </div>

      <div>
        <ImageSection
          imageSrc={vegImage}
          title="Service"
          content="In spiritual development, service plays a vital role because it helps dissolve the ego, which is often the biggest barrier to inner growth. By serving others, you shift focus from 'me and mine' to the well-being of others, cultivating compassion, humility, and empathy. Service purifies the mind, opens the heart, and aligns your actions with higher values like love, generosity, and unity. It transforms spiritual knowledge into real-life practice, making your path more meaningful and grounded. 
          Ultimately, through genuine service, you experience the interconnectedness of all beings, which deepens your spiritual understanding and brings you closer to your true self."
        />
      </div>

      <div>
        <HomeSection
          title="What is Meditation?"
          description="Meditation means making our mind 'rather empty'. Once our mind is more or less empty, we have a tremendous capability of receiving cosmic energy and cosmic information surrounding us. This leads to good health and absolute clarity in thought processes, leading to a joyous life."
          image={meditationImg}
          imagePosition="right"
        />
      </div>

      <div>
        <ImageSection
          imageSrc={vegImage}
          title="How to do Mediation"
          content="Find a quiet, comfortable space, sit in a comfortable posture, with your back straight, clasp your hands, cross your legs and close your eyes
          gently bring your attention to your breath. Feel the air moving in and out of your nose. Don't try to change your breathing; just observe it as it is. 
          It's completely normal for your mind to wander. When you notice your thoughts drifting, simply acknowledge them without judgment and gently guide your attention back to your breath."
        />
      </div>

      <div>
        <HomeSection
          title="Benefits of Meditation"
          description="Mind naturally stays in Peaceful and Joyful state
            Wasteful Habits die naturally
            Diseases gets Healed faster
            Efficiency in all work increases
            Heightened Awareness
            Ability to Discern right and wrong gets sharpened
            Willpower and Self-Esteem naturally become stronger
            Interpersonal Relationships become qualitative and
            fulfilling
            Purpose of Life is thoroughly understood
            Life becomes Celebration."
          image={meditationImg}
          imagePosition="right"
        />
      </div>

      <div>
        <ImageSection
          imageSrc={vegImage}
          title="Rules / Guidelines of the Ashram"
          content="This ashram is for all sincere truth seekers for Mounam, Dhyanam
            and Swadhyayam.
            Usage of mobile phones are prohibited as it is a Mouna Dhyana
            Ashram
            We request your co-operation to keep this ashram neat and clean
            Usage of plastic is prohibited as this ashram is PLASTIC FREE ZONE
            Safety of your valuables and belongings are your responsibility
            ID proof is mandatory for all resident seekers
            Ashram is maintained with the help of philanthropic support of all
            kind-hearted people
            Kindly support for Annadanam / maintenance of this Ashram"
        />
      </div>
     
      {/* <div>
        <Meditation />
      </div> */}

      {/* <div>
        <GridViewAgath />
      </div> */}

      <AgathiyarAbout />
      
      <Footer />
    </div>
  );
};

export default Home;
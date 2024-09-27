import React from 'react';
import './AshramInfo.css';
const AshramInfo = () => {
    return (
        <div className="ashram-container">
            <header className="ashram-header">
                <h1>Agathiyar Pyramid Dhyana Ashram</h1>
                <p className="address">Near Ramanaickenpettai, Vaniyambadi, Tirupathur District, Tamil Nadu - 635801</p>
            </header>
            <main className="ashram-content">
                <h2>About the Ashram</h2>
                <p>
                    Experience peace and tranquility at the Agathiyar Pyramid Dhyana Ashram, a sanctuary for meditation and spiritual growth.
                </p>
                <h3>Contact Us</h3>
                <p>Mobile: <strong>+91 85250 44990</strong></p>
                <button className="subscribe-button" onClick={() => window.open('https://www.youtube.com/channel/YourChannelID', '_blank')}>
                    Subscribe on YouTube
                </button>
            </main>
            <footer className="ashram-footer">
                <p>Copyrights Owned by AgathiyarPyramid.com</p>
            </footer>
        </div>
    );
};
export default AshramInfo;
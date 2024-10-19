import React, { useState, useEffect, useRef } from "react";
import { videoData, localVideoData } from "./VideoData";
import "./VideoList.css";
import MenuBar from '../menumain/menubar';
import Footer from '../Footer';

const VideoList = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [videoSource, setVideoSource] = useState("youtube"); // Default to YouTube
  const videoRef = useRef(null);
  let hoverTimeout = null;

  const handleVideoClick = (videoId) => {
    setSelectedVideo(videoId);
    setHoveredVideo(null); // Stop preview if clicked
  };

  const handleMouseEnter = (videoId) => {
    hoverTimeout = setTimeout(() => {
      setHoveredVideo(videoId);
    }, 500); // Slight delay to show video after hover
  };

  const handleMouseLeave = () => {
    setHoveredVideo(null);
    clearTimeout(hoverTimeout);
  };

  useEffect(() => {
    if (hoveredVideo && videoRef.current) {
      if (videoSource === "youtube") {
        videoRef.current.src = `https://www.youtube.com/embed/${hoveredVideo}?autoplay=1&controls=0&mute=1`; // Autoplay the video muted for preview
      } else {
        const localVideo = localVideoData.find(video => video.videoId === hoveredVideo);
        if (localVideo) {
          videoRef.current.src = localVideo.src; // Use local video source
        }
      }
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.src = ""; // Pause video after 5 seconds
        }
      }, 5000);
    }
  }, [hoveredVideo, videoSource]);

  return (
    <div className="video-list-container">
      <MenuBar />
      {/* <div className="video-source-selection">
        <label>
          <input
            type="radio"
            value="youtube"
            checked={videoSource === "youtube"}
            onChange={() => setVideoSource("youtube")}
          />
          YouTube
        </label>
        <label>
          <input
            type="radio"
            value="local"
            checked={videoSource === "local"}
            onChange={() => setVideoSource("local")}
          />
          Local
        </label>
      </div> */}

      {selectedVideo ? (
        <div className="video-player">
          {videoSource === "youtube" ? (
            <iframe
              width="100%"
              height="500px"
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video Player"
            />
          ) : (
            <video width="100%" height="500px" controls>
              <source src={localVideoData.find(video => video.videoId === selectedVideo).src} />
              Your browser does not support the video tag.
            </video>
          )}
          <button className="close-player" onClick={() => setSelectedVideo(null)}>
            Close
          </button>
        </div>
      ) : (
        <div className="video-grid">
          {(videoSource === "youtube" ? videoData : localVideoData).map((video, index) => (
            <div
              key={index}
              className="video-card"
              onMouseEnter={() => handleMouseEnter(video.videoId)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleVideoClick(video.videoId)}
            >
              {hoveredVideo === video.videoId ? (
                <iframe
                  ref={videoRef}
                  width="100%"
                  height="150px"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={video.title}
                ></iframe>
              ) : (
                <img
                  src={videoSource === "youtube" ? `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg` : require(`${video.src}.jpg`)} // Placeholder for local thumbnail
                  alt={video.title}
                  className="video-thumbnail"
                />
              )}
              <h3 className="video-title">{video.title}</h3>
              <p className="video-description">{video.description}</p>
            </div>
          ))}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default VideoList;
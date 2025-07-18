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
    setHoveredVideo(null);
  };

  const handleMouseEnter = (videoId) => {
    hoverTimeout = setTimeout(() => {
      setHoveredVideo(videoId);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.src = "";
    }
    setHoveredVideo(null);
    clearTimeout(hoverTimeout);
  };

  useEffect(() => {
    if (hoveredVideo && videoRef.current) {
      if (videoSource === "youtube") {
        videoRef.current.src = `https://www.youtube.com/embed/${hoveredVideo}?autoplay=1&controls=0&mute=1`;
      } else {
        const localVideo = localVideoData.find(video => video.videoId === hoveredVideo);
        if (localVideo) {
          videoRef.current.src = localVideo.src;
        }
      }

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.src = ""; // Stop after 5s
        }
      }, 5000);
    }
  }, [hoveredVideo, videoSource]);

  return (
    <div className="video-list-container">
      <MenuBar />

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
              <div className="video-preview">
                {hoveredVideo === video.videoId ? (
                  <iframe
                    ref={videoRef}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={video.title}
                  ></iframe>
                ) : (
                  <img
                    src={
                      videoSource === "youtube"
                        ? `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`
                        : require(`${video.src}.jpg`)
                    }
                    alt={video.title}
                    className="video-thumbnail"
                  />
                )}
              </div>
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
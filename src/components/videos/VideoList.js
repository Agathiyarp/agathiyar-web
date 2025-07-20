import React, { useState, useEffect, useRef } from "react";
import "./VideoList.css";
import MenuBar from "../menumain/menubar";
import Footer from "../Footer";

const VideoList = () => {
  const [videoList, setVideoList] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const videoRef = useRef(null);
  let hoverTimeout = null;

  // 🟢 Fetch videos on mount
  useEffect(() => {
    fetch("https://www.agathiyarpyramid.org/api/videos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Extract YouTube video IDs from URLs
          const formatted = data.map((item) => {
            const videoId = extractYouTubeID(item.link);
            return {
              videoId,
              title: item.name,
              description: item.link,
              rawLink: item.link,
            };
          });
          setVideoList(formatted);
        }
      })
      .catch((err) => {
        console.error("Error fetching videos:", err);
      });
  }, []);

  const extractYouTubeID = (url) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtu.be")) {
        return parsed.pathname.slice(1);
      }
      if (parsed.hostname.includes("youtube.com")) {
        return parsed.searchParams.get("v");
      }
      return "";
    } catch {
      return "";
    }
  };

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
      videoRef.current.src = `https://www.youtube.com/embed/${hoveredVideo}?autoplay=1&controls=0&mute=1`;

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.src = "";
        }
      }, 5000);
    }
  }, [hoveredVideo]);

  return (
    <div className="video-list-container">
      <MenuBar />

      {selectedVideo ? (
        <div className="video-player">
          <iframe
            width="100%"
            height="500px"
            src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video Player"
          />
          <button className="close-player" onClick={() => setSelectedVideo(null)}>
            Close
          </button>
        </div>
      ) : (
        <div className="video-grid">
          {videoList.map((video, index) => (
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
                    src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
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

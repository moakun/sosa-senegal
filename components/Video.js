"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // Import useSession hook for session management
import { useRouter } from "next/navigation"; // For redirecting if needed

export default function VideoPage() {
  const videos = [
    {
      id: 1,
      title: "première Partie",
      url: "https://d21ulo4r1z07kx.cloudfront.net/FinalPartOne.mp4",
    },
    {
      id: 2,
      title: "Deuxième Partie",
      url: "",
    },
  ];

  const { data: session, status } = useSession();
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoStates, setVideoStates] = useState({ video1: false, video2: false });
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Don't fetch until session is loaded
    if (!session || !session.user?.email) {
      router.push("/login"); // Redirect to login page if not logged in
    } else {
      const fetchVideoStatus = async () => {
        try {
          const email = session.user.email; // Use email from session

          if (!email) {
            throw new Error("User email is missing");
          }

          const response = await fetch(`/api/video?email=${email}`); // Fetch video status from API

          if (!response.ok) {
            throw new Error("Failed to fetch video status");
          }

          const data = await response.json();

          if (data.success) {
            setVideoStates({
              video1: data.videoStatus.video1Status === "Vue",
              video2: data.videoStatus.video2Status === "Vue",
            });
          } else {
            console.error("Error fetching video status:", data.error);
          }
        } catch (error) {
          console.error("Error fetching video status:", error);
        }
      };

      fetchVideoStatus();
    }
  }, [session, status, router]);

  const handleWatchNow = async (videoId) => {
    if (!session?.user?.email) return; // Ensure the user is logged in before updating

    try {
      // Update the video state for the selected video
      const videoKey = videoId === 1 ? "video1" : "video2";
      setVideoStates((prev) => ({ ...prev, [videoKey]: true }));

      // Set the current video to display
      setCurrentVideo(videoId);

      // Send the video state update to the backend API
      const response = await fetch("/api/video", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email, // Send email instead of id
          [videoKey]: true, // Set the video to watched
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update video status");
      }

      const data = await response.json();

      if (data.success) {
        console.log("Video status updated successfully");
      } else {
        console.error("Error updating video status:", data.error);
      }
    } catch (error) {
      console.error("Error handling video watch:", error);
    }
  };

  // Check if both videos are marked as seen
  const allVideosWatched = videoStates.video1 && videoStates.video2;

  // Handle redirection to the dashboard when the button is clicked
  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black-600 mb-6">Vidéo du cours</h1>
        <p className="text-black-500 mb-8">Choisir un video:</p>

        <div className="space-y-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="p-6 rounded-lg shadow-lg bg-white-500 text-black-600 flex items-center justify-between"
            >
              <div className="ml-4">
                <h2 className="text-lg font-semibold">{video.title}</h2>
                <p>
                  {video.id === 1 && videoStates.video1 ? "Vue" : null}
                  {video.id === 2 && videoStates.video2 ? "Vue" : null}
                </p>
              </div>
              <button
                onClick={() => handleWatchNow(video.id)}
                className="px-4 py-2 bg-blue-500 text-white-500 rounded-lg shadow hover:bg-blue-100 hover:text-blue-500 transition-all"
              >
                Watch now
              </button>
            </div>
          ))}
        </div>

        {/* Section du lecteur vidéo */}
        {currentVideo && (
          <div className="mt-8 bg-white-500 shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-black-600 mb-4">Lecture en cours</h2>
            <div className="flex justify-center">
              <video
                controls
                className="w-full max-w-3xl rounded-lg shadow-md"
                src={videos.find((v) => v.id === currentVideo)?.url}
              />
            </div>
          </div>
        )}

        {/* Display the "Back to Dashboard" button if both videos are watched */}
        {allVideosWatched && (
          <div className="mt-8 text-center">
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-3 bg-blue-500 text-white-500 font-semibold rounded-lg shadow-lg hover:bg-green-600 transition-all"
            >
              Retour au tableau de bord
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

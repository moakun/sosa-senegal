"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Video() {
  const videos = [
    {
      id: 1,
      title: "Première Partie",
      url: "https://d21ulo4r1z07kx.cloudfront.net/FinalCongoOne.mp4", // Updated to Congo videos
    },
    {
      id: 2,
      title: "Deuxième Partie",
      url: "https://d21ulo4r1z07kx.cloudfront.net/FinalCongoTwo.mp4", // Updated to Congo videos
    },
  ];

  const { data: session, status } = useSession();
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoStates, setVideoStates] = useState({ video1: false, video2: false });
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user?.email) {
      router.push("/login"); // Updated to Congo login
    } else {
      const fetchVideoStatus = async () => {
        try {
          const response = await fetch(`/api/video?email=${session.user.email}&schema=congo`); // Added Congo schema
          
          if (!response.ok) {
            throw new Error("Échec de la récupération du statut de la vidéo");
          }

          const data = await response.json();

          if (data.success) {
            setVideoStates({
              video1: data.videoStatus.video1Status === "Vu",
              video2: data.videoStatus.video2Status === "Vu",
            });
          }
        } catch (error) {
          console.error("Erreur:", error);
        }
      };

      fetchVideoStatus();
    }
  }, [session, status, router]);

  const handleWatchNow = async (videoId) => {
    if (!session?.user?.email) return;

    try {
      const videoKey = videoId === 1 ? "video1" : "video2";
      setVideoStates((prev) => ({ ...prev, [videoKey]: true }));
      setCurrentVideo(videoId);

      const response = await fetch("/api/video", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          [videoKey]: true,
          schema: 'congo' // Added Congo schema
        }),
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const allVideosWatched = videoStates.video1 && videoStates.video2;

  const handleBackToDashboard = () => {
    router.push("/dashboard"); // Updated to Congo dashboard
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black-600 mb-6">Vidéos du cours</h1>
        <p className="text-black-500 mb-8">Choisissez une vidéo à regarder.</p>

        <div className="space-y-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="p-6 rounded-lg shadow-lg bg-white-500 text-black-600 flex items-center justify-between"
            >
              <div className="ml-4">
                <h2 className="text-lg font-semibold">{video.title}</h2>
                <p>
                  {video.id === 1 && videoStates.video1 ? "Vu" : null}
                  {video.id === 2 && videoStates.video2 ? "Vu" : null}
                </p>
              </div>
              <button
                onClick={() => handleWatchNow(video.id)}
                className="px-4 py-2 bg-blue-500 text-white-500 rounded-lg shadow hover:bg-blue-100 hover:text-blue-500 transition-all"
              >
                Regarder maintenant
              </button>
            </div>
          ))}
        </div>

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
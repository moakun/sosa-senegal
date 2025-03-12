"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // Importer le hook useSession pour la gestion de la session
import { useRouter } from "next/navigation"; // Pour rediriger si nécessaire

export default function VideoPage() {
  const videos = [
    {
      id: 1,
      title: "Première Partie",
      url: "https://d21ulo4r1z07kx.cloudfront.net/FinalSenegalOne.mp4",
    },
    {
      id: 2,
      title: "Deuxième Partie",
      url: "https://d21ulo4r1z07kx.cloudfront.net/FinalSenegalTwo.mp4",
    },
  ];

  const { data: session, status } = useSession();
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoStates, setVideoStates] = useState({ video1: false, video2: false });
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Ne pas récupérer tant que la session n'est pas chargée
    if (!session || !session.user?.email) {
      router.push("/login"); // Rediriger vers la page de connexion si non connecté
    } else {
      const fetchVideoStatus = async () => {
        try {
          const email = session.user.email; // Utiliser l'email de la session

          if (!email) {
            throw new Error("L'email de l'utilisateur est manquant");
          }

          const response = await fetch(`/api/video?email=${email}`); // Récupérer le statut de la vidéo via l'API

          if (!response.ok) {
            throw new Error("Échec de la récupération du statut de la vidéo");
          }

          const data = await response.json();

          if (data.success) {
            setVideoStates({
              video1: data.videoStatus.video1Status === "Vu",
              video2: data.videoStatus.video2Status === "Vu",
            });
          } else {
            console.error("Erreur lors de la récupération du statut de la vidéo :", data.error);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du statut de la vidéo :", error);
        }
      };

      fetchVideoStatus();
    }
  }, [session, status, router]);

  const handleWatchNow = async (videoId) => {
    if (!session?.user?.email) return; // S'assurer que l'utilisateur est connecté avant de mettre à jour

    try {
      // Mettre à jour l'état de la vidéo pour la vidéo sélectionnée
      const videoKey = videoId === 1 ? "video1" : "video2";
      setVideoStates((prev) => ({ ...prev, [videoKey]: true }));

      // Définir la vidéo actuelle à afficher
      setCurrentVideo(videoId);

      // Envoyer la mise à jour du statut de la vidéo à l'API backend
      const response = await fetch("/api/video", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email, // Envoyer l'email au lieu de l'id
          [videoKey]: true, // Marquer la vidéo comme vue
        }),
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour du statut de la vidéo");
      }

      const data = await response.json();

      if (data.success) {
        console.log("Statut de la vidéo mis à jour avec succès");
      } else {
        console.error("Erreur lors de la mise à jour du statut de la vidéo :", data.error);
      }
    } catch (error) {
      console.error("Erreur lors de la gestion de la vidéo :", error);
    }
  };

  // Vérifier si les deux vidéos sont marquées comme vues
  const allVideosWatched = videoStates.video1 && videoStates.video2;

  // Gérer la redirection vers le tableau de bord lorsque le bouton est cliqué
  const handleBackToDashboard = () => {
    router.push("/dashboard");
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

        {/* Afficher le bouton "Retour au tableau de bord" si les deux vidéos sont vues */}
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

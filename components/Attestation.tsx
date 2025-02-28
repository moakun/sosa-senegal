"use client";

import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Certificate } from "@/components/Certificate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Loader2 } from "lucide-react";

export default function Attestation() {
  const { data: session } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    // Vérifiez si la référence du certificat et l'email de session sont disponibles
    if (!certificateRef.current || !session?.user?.email) return;

    setIsGenerating(true);
    try {
      // Générer l'image du certificat avec html2canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, // Augmenter l'échelle pour une meilleure résolution
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
      });

      // Convertir le canvas en PDF avec jsPDF
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("landscape", "mm", "a4"); // Format A4, orientation paysage
      const imgWidth = 297; // Largeur A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Garder le ratio d'aspect
      const scaledHeight = imgHeight > 210 ? 210 : imgHeight; // Échelle si l'image est trop grande

      // Centrer l'image dans le PDF
      const xOffset = (297 - imgWidth) / 2;
      const yOffset = (210 - scaledHeight) / 2;

      pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, scaledHeight);
      pdf.save("certificat.pdf");

      // Mettre à jour l'état de l'attestation dans la base de données
      const response = await fetch("/api/certinfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }), // Passer l'email de session
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la mise à jour du statut de l'attestation");
      }

      console.log("Statut de l'attestation mis à jour avec succès");
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Si la session n'est pas disponible, inviter l'utilisateur à se connecter
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Veuillez vous connecter pour voir votre certificat.</p>
      </div>
    );
  }

  // Rendre la page du certificat avec un bouton de téléchargement
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-screen-lg mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Votre certificat</h1>
          <Button onClick={downloadCertificate} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> // Afficher le spinner de chargement pendant la génération
            ) : (
              "Télécharger le certificat"
            )}
          </Button>
        </div>

        {/* Aperçu du certificat */}
        <div className="border rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-auto">
            <div ref={certificateRef}>
              <Certificate
                userName={session.user?.fullName || "Utilisateur"}
                company={session.user?.companyName || "Nom de l'entreprise"}
                date={new Date()}
                courseName="Anticorruption et Éthique des affaires"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

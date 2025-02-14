'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';


export default function PostQuiz() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    dispositif: '',
    engagement: '',
    identification: '',
    formation: '',
    procedure: '',
    dispositifAlert: '',
    certifierISO: '',
    mepSystem: '',
    intention: '',
  });

  const [loading, setLoading] = useState(false); // To handle loading state
  const { data: session } = useSession();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email, // Replace this with the actual email
          ...formData,
        }),
      });
  
      if (response.ok) {
        setFormData({
          dispositif: '',
          engagement: '',
          identification: '',
          formation: '',
          procedure: '',
          dispositifAlert: '',
          certifierISO: '',
          mepSystem: '',
          intention: '',
        }); // Reset form
        router.push('/dashboard');
      } else {
        alert('Failed to update the data.');
      }
    } catch (error) {
      console.error('Error updating data:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const questions = [
    { id: 'dispositif', label: 'Votre entreprise a-t-elle mis en place des mesures pour se protéger contre les actes de corruption ?' },
    { id: 'engagement', label: 'La Direction a-t-elle formalisé un engagement contre la corruption sous toutes ses formes (politique anti-corruption, charte anti-corruption et/ou code de conduite) ?' },
    { id: 'identification', label: 'Identification des risques de corruption et élaboration d\'une cartographie des risques ?' },
    { id: 'formation', label: 'Formation et sensibilisation du personnel aux risques de corruption et à la prévention des conflits d\'intérêts ?' },
    { id: 'procedure', label: 'Procédure de gestion des cadeaux ?' },
    { id: 'dispositifAlert', label: 'Système d\'alerte pour recueillir les signalements préoccupants ?' },
    { id: 'certifierISO', label: 'Votre entreprise est-elle certifiée ISO 37001 ?' },
    { id: 'mepSystem', label: 'Votre entreprise est-elle en train de mettre en place un système de management anti-corruption en vue d\'une certification selon la norme ISO 37001 ?' },
    { id: 'intention', label: 'Envisagez-vous de certifier votre entreprise selon la norme anti-corruption ISO 37001 ?' },
];

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md bg-white-500 rounded-lg shadow-lg border-none">
        <CardHeader className="space-y-2 p-4">
          <CardTitle className="text-2xl font-bold text-center text-blue-500">
            Questionnaire
          </CardTitle>
          <CardDescription className="text-center text-gray-500 text-sm">
          Répondre par Oui, Non ou JJ/MM/AA
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={question.id} className="text-sm font-medium text-gray-600">
                  {question.label}
                </Label>
                <Input
                  id={question.id}
                  name={question.id}
                  value={formData[question.id as keyof typeof formData]}
                  onChange={handleChange}
                  required
                  placeholder="Yes, No or DD/MM/YY"
                  className="w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                />
              </div>
            ))}
            <Button
              type="submit"
              disabled={loading}
              className={`w-full mt-6 text-white-500 rounded-md py-2 text-sm font-medium ${
                loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? 'Loading...' : 'Send'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

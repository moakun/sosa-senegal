import { formatDate } from '@/utils/format-date';

interface CertificateProps {
  userName: string;
  company: string;
  date: Date;
  courseName: string;
}

export function Certificate({ userName, company, date, courseName }: CertificateProps) {
  return (
    <div className="relative w-[800px] h-[600px] bg-white p-8 mx-auto">
      {/* Border */}
      <div className="absolute inset-4 border-4 border-gray-300"></div>
      <div className="absolute inset-6 border-2 border-gray-300"></div>

      <div className="relative h-full flex flex-col items-center justify-between py-12">
        {/* Logo */}
        <div className="space-y-4">
        <img src="/assets/sosal.png" alt="Logo de SOGEA SATOM" width={160} height={160} className="mx-auto" />
        </div>

        {/* Certificate Content */}
        <div className="space-y-8 text-center">
          <p className="text-xl text-gray-800">
            La société Sogea Satom Senegal certifie que
          </p>
          <p className="text-2xl font-semibold text-gray-900">
            {userName.toUpperCase()} de la société {company.toUpperCase()}
          </p>
          <p className="text-xl text-gray-800">
            a réussi à compléter le programme de formation suivant :
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            {courseName}
          </h1>
        </div>

        {/* Date */}
        <div className="text-left w-full pl-12">
          <p className="text-lg">
            <span className="font-semibold">Date : </span>
            {formatDate(date)}
          </p>
        </div>
      </div>
    </div>
  );
}


import React from 'react';
import { User, Activity, FileText, Heart } from 'lucide-react';

const MedicalScene: React.FC = () => {
  return (
    <div className="w-full h-96 md:h-[450px] relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
      {/* Animated 3D-like medical scene */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-3xl mx-auto">
          {/* Doctor representation */}
          <div className="absolute left-10 md:left-40 top-1/2 transform -translate-y-1/2 animate-float">
            <div className="relative">
              <div className="size-20 md:size-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                <User className="size-10 md:size-16 text-white" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium shadow-md">
                Doctor
              </div>
            </div>
          </div>

          {/* Patient representation */}
          <div className="absolute right-10 md:right-40 top-1/2 transform -translate-y-1/2 animate-float-delayed">
            <div className="relative">
              <div className="size-20 md:size-32 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg">
                <User className="size-10 md:size-16 text-white" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium shadow-md">
                Patient
              </div>
            </div>
          </div>

          {/* Connecting elements */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 animate-pulse">
            <div className="size-24 md:size-36 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center shadow-lg">
              <Heart className="size-12 md:size-20 text-white" strokeWidth={1.5} />
            </div>
            
            <div className="w-48 md:w-64 h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-full shadow-md"></div>
            
            <div className="flex justify-center gap-5">
              <div className="size-10 md:size-14 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-md">
                <Activity className="size-5 md:size-8 text-white" strokeWidth={1.5} />
              </div>
              <div className="size-10 md:size-14 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center shadow-md">
                <FileText className="size-5 md:size-8 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute size-56 rounded-full bg-blue-500/10 -top-20 -left-20 animate-blob"></div>
        <div className="absolute size-56 rounded-full bg-purple-500/10 top-40 right-20 animate-blob animation-delay-2000"></div>
        <div className="absolute size-56 rounded-full bg-green-500/10 bottom-10 left-40 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default MedicalScene;

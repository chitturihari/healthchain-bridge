
import React, { useEffect, useRef } from 'react';
import { Doctor, Patient, Computer, Activity } from 'lucide-react';

const MedicalScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Simple animation for the elements
    const interval = setInterval(() => {
      const elements = containerRef.current?.querySelectorAll('.animated-icon');
      elements?.forEach((el) => {
        el.classList.toggle('pulse');
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-xl overflow-hidden"
    >
      {/* Connection lines */}
      <div className="absolute left-1/2 top-1/2 w-[140px] h-[1px] bg-primary/30 -translate-x-[140px] -translate-y-[30px] transform rotate-[30deg]" />
      <div className="absolute left-1/2 top-1/2 w-[140px] h-[1px] bg-primary/30 -translate-x-[140px] translate-y-[30px] transform -rotate-[30deg]" />
      <div className="absolute left-1/2 top-1/2 w-[80px] h-[1px] bg-primary/30 translate-x-[10px]" />
      
      {/* Doctor */}
      <div className="absolute top-[calc(50%-80px)] left-[calc(25%-40px)]">
        <div className="relative flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center shadow-md animated-icon">
            <Doctor className="h-10 w-10 text-blue-600" />
          </div>
          <span className="mt-2 text-sm font-medium">Doctor</span>
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm animate-pulse">
            <Activity className="h-3 w-3 text-green-500" />
          </div>
        </div>
      </div>
      
      {/* Patient */}
      <div className="absolute top-[calc(50%-80px)] right-[calc(25%-40px)]">
        <div className="relative flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-md animated-icon">
            <Patient className="h-10 w-10 text-green-600" />
          </div>
          <span className="mt-2 text-sm font-medium">Patient</span>
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm animate-pulse">
            <Activity className="h-3 w-3 text-green-500" />
          </div>
        </div>
      </div>
      
      {/* Central blockchain element */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative flex flex-col items-center">
          <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center shadow-md animated-icon">
            <div className="grid grid-cols-2 grid-rows-2 gap-1 rotate-45">
              <div className="w-6 h-6 bg-primary/20 rounded-md"></div>
              <div className="w-6 h-6 bg-primary/30 rounded-md"></div>
              <div className="w-6 h-6 bg-primary/30 rounded-md"></div>
              <div className="w-6 h-6 bg-primary/20 rounded-md"></div>
            </div>
          </div>
          <span className="mt-2 text-sm font-medium">Blockchain</span>
        </div>
      </div>
      
      {/* Computer/Database */}
      <div className="absolute bottom-[calc(25%-40px)] left-1/2 transform -translate-x-1/2">
        <div className="relative flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center shadow-md animated-icon">
            <Computer className="h-10 w-10 text-purple-600" />
          </div>
          <span className="mt-2 text-sm font-medium">Secure Storage</span>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-blue-200/50"></div>
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-green-200/50"></div>
      
      {/* Add some particles floating effect */}
      <div className="absolute w-2 h-2 rounded-full bg-primary/20 top-[20%] left-[30%] animate-float"></div>
      <div className="absolute w-3 h-3 rounded-full bg-primary/10 top-[70%] left-[20%] animate-float" style={{ animationDelay: "1.5s" }}></div>
      <div className="absolute w-2 h-2 rounded-full bg-primary/20 top-[30%] right-[20%] animate-float" style={{ animationDelay: "0.8s" }}></div>
      <div className="absolute w-3 h-3 rounded-full bg-primary/10 bottom-[20%] right-[30%] animate-float" style={{ animationDelay: "2.2s" }}></div>
    </div>
  );
};

export default MedicalScene;

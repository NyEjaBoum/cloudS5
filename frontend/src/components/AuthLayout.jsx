import React from "react";
import illustration from "../assets/fond.png";
import logo from "../assets/mapeo.png";

export default function AuthLayout({ children, title, subtitle, leftSide = true }) {
  const illustrationPanel = (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <img
        src={illustration}
        alt="Illustration"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-sand-900/60 via-sand-800/40 to-sand-700/20" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <img src={logo} alt="Mapeo" className="h-9 w-9" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Mapeo</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Plateforme de gestion et suivi des signalements geographiques
          </p>
        </div>
      </div>
    </div>
  );

  const formPanel = (
    <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-[420px] animate-fade-in">
        {/* Brand - mobile only */}
        <div className="flex items-center gap-2.5 mb-10 lg:hidden">
          <img src={logo} alt="Mapeo" className="h-8 w-8" />
          <span className="text-xl font-bold text-slate-800">Mapeo</span>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1.5">{title}</h1>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {leftSide ? (
        <>
          {illustrationPanel}
          {formPanel}
        </>
      ) : (
        <>
          {formPanel}
          {illustrationPanel}
        </>
      )}
    </div>
  );
}

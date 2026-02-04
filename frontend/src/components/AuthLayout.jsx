import React from "react";
import illustration from "../assets/fond.png"; // adapte le nom si besoin
import logo from "../assets/mapeo.png";

export default function AuthLayout({ children, title, subtitle, leftSide = true }) {
  const illustrationPanel = (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <img
        src={illustration}
        alt="Illustration"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-secondary/50 to-primary/30" />
    </div>
  );

  const formPanel = (
    <div className="w-full lg:w-1/2 flex items-center justify-center bg-base-100 px-4 py-10">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <img src={logo} alt="Mapeo" className="h-8 w-8" />
            <span className="text-3xl font-extrabold text-primary tracking-tight">
              Mapeo
            </span>
          </div>
          <div className="h-1 w-10 rounded-full bg-primary" />
        </div>

        {/* Content */}
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-base-content">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
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

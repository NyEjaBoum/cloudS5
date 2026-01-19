import React from "react";
import illustration from "../assets/fond.png"; // adapte le nom si besoin

export default function AuthLayout({ children, title, subtitle, leftSide = true }) {
  return (
    <div className="auth-container">
      {leftSide ? (
        <>
          <div className="auth-illustration">
            <img src={illustration} alt="Illustration" />
          </div>
          <div className="auth-form-section">
            <div className="auth-brand">Mapeo</div>
            <div className="auth-content">
              <h1>{title}</h1>
              <p>{subtitle}</p>
              {children}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="auth-form-section">
            <div className="auth-brand">Mapeo</div>
            <div className="auth-content">
              <h1>{title}</h1>
              <p>{subtitle}</p>
              {children}
            </div>
          </div>
          <div className="auth-illustration">
            <img src={illustration} alt="Illustration" />
          </div>
        </>
      )}
    </div>
  );
}
import { useState } from "react";

const WHATSAPP_URL =
  "https://wa.me/917558646366?text=Hi%20PANTHM%20AI%20Labs!%20I%20visited%20your%20website%20and%20would%20like%20to%20know%20more%20about%20your%20services.";

const styles = {
  wrapper: {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },
  tooltip: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 500,
    padding: "6px 12px",
    borderRadius: "8px",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
    pointerEvents: "none",
    opacity: 1,
    transform: "translateY(0)",
    transition: "opacity 0.2s ease, transform 0.2s ease",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  tooltipHidden: {
    opacity: 0,
    transform: "translateY(4px)",
  },
  button: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#25D366",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    position: "relative",
    outline: "none",
  },
  buttonHover: {
    transform: "scale(1.1)",
    boxShadow: "0 6px 28px rgba(37,211,102,0.6)",
  },
  pulse: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    backgroundColor: "#25D366",
    animation: "whatsapp-pulse 2s ease-out infinite",
    zIndex: -1,
  },
};

// Inject keyframes once
const injectKeyframes = (() => {
  let injected = false;
  return () => {
    if (injected) return;
    injected = true;
    const style = document.createElement("style");
    style.textContent = `
      @keyframes whatsapp-pulse {
        0%   { transform: scale(1);   opacity: 0.7; }
        70%  { transform: scale(1.55); opacity: 0;   }
        100% { transform: scale(1.55); opacity: 0;   }
      }
      @media (max-width: 768px) {
        .wa-float-btn { width: 52px !important; height: 52px !important; }
        .wa-float-btn svg { width: 28px !important; height: 28px !important; }
      }
    `;
    document.head.appendChild(style);
  };
})();

export default function WhatsAppWidget() {
  injectKeyframes();
  const [hovered, setHovered] = useState(false);

  return (
    <div style={styles.wrapper}>
      {/* Tooltip */}
      <div
        style={{
          ...styles.tooltip,
          ...(hovered ? {} : styles.tooltipHidden),
        }}
        aria-hidden="true"
      >
        Chat with us on WhatsApp
      </div>

      {/* Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="wa-float-btn"
        style={{
          ...styles.button,
          ...(hovered ? styles.buttonHover : {}),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        {/* Pulse ring */}
        <span style={styles.pulse} aria-hidden="true" />

        {/* WhatsApp SVG logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="34"
          height="34"
          fill="#fff"
          aria-hidden="true"
        >
          <path d="M16.003 2.667C8.639 2.667 2.667 8.639 2.667 16c0 2.361.635 4.629 1.837 6.609L2.667 29.333l6.907-1.812A13.28 13.28 0 0016.003 29.333C23.366 29.333 29.333 23.361 29.333 16S23.366 2.667 16.003 2.667zm0 24.267c-2.127 0-4.193-.572-6.005-1.655l-.43-.256-4.098 1.076 1.095-4.003-.279-.445A10.888 10.888 0 015.067 16c0-6.031 4.906-10.933 10.936-10.933S26.933 9.969 26.933 16 22.034 26.934 16.003 26.934zm6.005-8.184c-.329-.164-1.948-.961-2.25-1.071-.303-.11-.523-.164-.743.164-.22.328-.852 1.071-.044 1.29.22.055 1.618.576 2.747 1.181.374.201.688.155.909-.109l.384-.483c.219-.274.164-.576-.164-.74a23.76 23.76 0 00-.839-.232zm-6.005 3.294c-1.147 0-2.267-.307-3.243-.886l-.231-.137-2.402.629.643-2.345-.149-.239a6.388 6.388 0 01-.977-3.382c0-3.527 2.87-6.397 6.397-6.397a6.356 6.356 0 014.52 1.877 6.356 6.356 0 011.877 4.52c0 3.527-2.87 6.36-6.435 6.36zm3.508-4.774c-.192-.096-1.137-.561-1.313-.625-.175-.064-.303-.096-.43.096-.128.191-.496.625-.609.753-.112.128-.224.144-.416.048-.192-.096-.811-.299-1.544-.953a5.8 5.8 0 01-1.068-1.329c-.112-.192-.012-.296.084-.391.087-.085.192-.224.288-.336.096-.112.128-.192.192-.32.064-.128.032-.24-.016-.336-.048-.096-.43-1.037-.589-1.42-.155-.373-.313-.322-.43-.328h-.367c-.128 0-.336.048-.512.24-.176.192-.672.657-.672 1.602s.688 1.858.784 1.986c.096.128 1.353 2.065 3.278 2.895.458.197.816.315 1.095.403.46.146.879.125 1.21.076.369-.055 1.137-.465 1.298-.914.16-.449.16-.834.112-.914-.048-.08-.175-.128-.367-.224z" />
        </svg>
      </a>
    </div>
  );
}

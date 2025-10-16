import React from "react";

const ComingSoonComponent = ({
                        title = "Coming Soon",
                        subtitle = "We’re working hard to bring this feature to you soon.",
                        image
                    }) => {
    return (
        <div className="coming-soon-container">
            <div className="coming-soon-content">
                {image && (
                    <img src={image} alt="Coming Soon" className="coming-soon-image" />
                )}
                <h1 className="coming-soon-title">{title}</h1>
                <p className="coming-soon-subtitle">{subtitle}</p>
                <div className="coming-soon-loader"></div>
                <p className="coming-soon-text">Stay tuned for updates!</p>
            </div>
            <style>
                {
                    `
                     :root {
  --primary-color: #e55b7c;
  --secondary-color: #44a89f;
  --text-color: #656565;
  --bg-color: #fff8f8;
}

.coming-soon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 87vh;
  background: var(--bg-color);
  padding: 20px;
  text-align: center;
}

.coming-soon-content {
  max-width: 420px;
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
}

.coming-soon-image {
  width: 140px;
  height: auto;
  margin-bottom: 20px;
  filter: drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.1));
}

.coming-soon-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 10px;
}

.coming-soon-subtitle {
  font-size: 1.05rem;
  color: var(--text-color);
  margin-bottom: 25px;
  line-height: 1.5;
}

.coming-soon-loader {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px auto;
  border: 4px solid #eee;
  border-top: 4px solid var(--secondary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.coming-soon-text {
  font-size: 0.95rem;
  color: var(--text-color);
  opacity: 0.7;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .coming-soon-content {
    padding: 30px 20px;
  }
  .coming-soon-title {
    font-size: 1.6rem;
  }
  .coming-soon-subtitle {
    font-size: 0.95rem;
  }
}

                    `
                }
            </style>
        </div>
    );
};

export default ComingSoonComponent;

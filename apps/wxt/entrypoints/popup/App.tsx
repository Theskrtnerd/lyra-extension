import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 Sending GET_USER_DATA message");
    browser.runtime.sendMessage({ type: 'GET_USER_DATA' }, (response) => {
      console.log("✅ User data received in popup:", response);
      setUserData(response);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading profile data...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="popup-container">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h1 className="empty-title">LinkedIn Profile Data</h1>
          <p className="empty-message">No data available. Please visit a LinkedIn profile page.</p>
          <button 
            className="button"
            onClick={() => window.close()}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <header className="header">
        <h1 className="header-title">LinkedIn Profile</h1>
        {userData.profileUrl && (
          <a 
            href={userData.profileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="link"
          >
            View on LinkedIn
          </a>
        )}
      </header>
      
      <div className="profile-card">
        <div className="profile-header">
          {userData.profileImage ? (
            <div className="profile-image">
              <img src={userData.profileImage} alt={userData.name || 'Profile'} />
            </div>
          ) : (
            <div className="profile-image-placeholder">
              {userData.name ? userData.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          <div className="profile-info">
            <h2 className="profile-name">{userData.name || 'Unknown Name'}</h2>
            <p className="profile-headline">{userData.headline || ''}</p>
            {userData.location && (
              <p className="profile-location">
                <span className="location-icon">📍</span> {userData.location}
              </p>
            )}
          </div>
        </div>
        
        {userData.about && (
          <div className="section">
            <h3 className="section-title">About</h3>
            <div className="section-content">
              <p className="description">{userData.about}</p>
            </div>
          </div>
        )}
        
        <div className="section">
          <h3 className="section-title">Experience</h3>
          <div className="section-content">
            {renderExperiences(userData.experiences)}
          </div>
        </div>
        
        {userData.education && userData.education.length > 0 && (
          <div className="section">
            <h3 className="section-title">Education</h3>
            <div className="section-content">
              {renderEducation(userData.education)}
            </div>
          </div>
        )}

        {userData.skills && userData.skills.length > 0 && (
          <div className="section">
            <h3 className="section-title">Skills</h3>
            <div className="skills-container">
              {userData.skills.map((skill: string, index: number) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderExperiences(experiences: any[]) {
  if (!experiences || experiences.length === 0) {
    return <p className="empty-message">No experience data available</p>;
  }
  
  return (
    <div className="experience-list">
      {experiences.map((exp, index) => (
        <div key={index} className="experience-item">
          {index < experiences.length - 1 && (
            <div className="divider"></div>
          )}
          
          {exp.roles ? (
            // Multi-role experience
            <>
              <div className="company-header">
                {exp.companyLogo ? (
                  <div className="company-logo">
                    <img src={exp.companyLogo} alt={exp.companyName || 'Company'} />
                  </div>
                ) : (
                  <div className="company-logo"></div>
                )}
                <div className="company-info">
                  <h4 className="company-name">{exp.companyName || 'Unknown Company'}</h4>
                  <p className="company-duration">{exp.companyDuration || ''}</p>
                </div>
              </div>
              <div className="roles-container">
                {exp.roles.map((role: any, roleIndex: number) => (
                  <div key={roleIndex} className="role-item">
                    <div className="role-bullet"></div>
                    <h5 className="role-title">{role.jobTitle || 'Unknown Role'}</h5>
                    <p className="role-details">
                      <span>{role.employmentType || ''}</span>
                      {role.employmentType && role.duration && <span className="role-separator">•</span>}
                      <span className="role-duration">{role.duration || ''}</span>
                    </p>
                    {role.description && <p className="description">{role.description}</p>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Single role experience
            <>
              <div className="company-header">
                {exp.companyLogo ? (
                  <div className="company-logo">
                    <img src={exp.companyLogo} alt={exp.companyName || 'Company'} />
                  </div>
                ) : (
                  <div className="company-logo"></div>
                )}
                <div className="company-info">
                  <h4 className="company-name">{exp.jobTitle || 'Unknown Role'}</h4>
                  <p className="role-details">
                    <span>{exp.companyName || 'Unknown Company'}</span>
                    {exp.companyName && exp.duration && <span className="role-separator">•</span>}
                    <span className="role-duration">{exp.duration || ''}</span>
                  </p>
                </div>
              </div>
              {exp.description && <p className="description">{exp.description}</p>}
              {exp.skills && (
                <div className="skills-info">
                  <p className="skills-text">Skills: {exp.skills}</p>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function renderEducation(education: any[]) {
  if (!education || education.length === 0) {
    return <p className="empty-message">No education data available</p>;
  }
  
  return (
    <div className="education-list">
      {education.map((edu, index) => (
        <div key={index} className="education-item">
          <div className="school-header">
            {edu.schoolLogo ? (
              <div className="school-logo">
                <img src={edu.schoolLogo} alt={edu.schoolName || 'School'} />
              </div>
            ) : (
              <div className="school-logo"></div>
            )}
            <div className="school-info">
              <h4 className="school-name">{edu.schoolName || 'Unknown School'}</h4>
              <p className="school-degree">{edu.degree || ''}</p>
              <p className="school-duration">{edu.duration || ''}</p>
              {edu.description && <p className="description">{edu.description}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 Sending GET_USER_DATA message");
    browser.runtime.sendMessage({ type: 'GET_USER_DATA' }, (response) => {
      console.log("🔍 Response:", response);
      console.log("✅ User data received in popup:", response);
      setUserData(response);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile data...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container empty-state">
        <div className="empty-icon">📋</div>
        <h1>LinkedIn Profile Data</h1>
        <p>No data available. Please visit a LinkedIn profile page.</p>
        <button className="primary-button" onClick={() => window.close()}>Close</button>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="app-header">
        <h1>LinkedIn Profile</h1>
      </header>
      
      <div className="profile-card">
        <div className="profile-header">
          {userData.profileImage && (
            <div className="profile-image">
              <img src={userData.profileImage} alt={userData.name || 'Profile'} />
            </div>
          )}
          <div className="profile-info">
            <h2>{userData.name || 'Unknown Name'}</h2>
            <p className="headline">{userData.headline || ''}</p>
            {userData.location && <p className="location">{userData.location}</p>}
          </div>
        </div>
        
        {userData.about && (
          <div className="section">
            <h3>About</h3>
            <div className="card-content">
              <p>{userData.about}</p>
            </div>
          </div>
        )}
        
        <div className="section">
          <h3>Experience</h3>
          <div className="card-content">
            {renderExperiences(userData.experiences)}
          </div>
        </div>
        
        {userData.education && userData.education.length > 0 && (
          <div className="section">
            <h3>Education</h3>
            <div className="card-content">
              {renderEducation(userData.education)}
            </div>
          </div>
        )}

        {userData.skills && userData.skills.length > 0 && (
          <div className="section">
            <h3>Skills</h3>
            <div className="skills-container">
              {userData.skills.map((skill: string, index: number) => (
                <span key={index} className="skill-tag">{skill}</span>
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
    <div className="experiences-list">
      {experiences.map((exp, index) => (
        <div key={index} className="experience-item">
          {exp.roles ? (
            // Multi-role experience
            <>
              <div className="company-header">
                {exp.companyLogo && (
                  <div className="company-logo">
                    <img src={exp.companyLogo} alt={exp.companyName || 'Company'} />
                  </div>
                )}
                <div>
                  <h4>{exp.companyName || 'Unknown Company'}</h4>
                  <p className="duration">{exp.companyDuration || ''}</p>
                </div>
              </div>
              <div className="roles-container">
                {exp.roles.map((role: any, roleIndex: number) => (
                  <div key={roleIndex} className="role-item">
                    <h5>{role.jobTitle || 'Unknown Role'}</h5>
                    <p className="role-details">
                      <span className="employment-type">{role.employmentType || ''}</span>
                      {role.employmentType && role.duration && <span className="dot-separator">•</span>}
                      <span className="duration">{role.duration || ''}</span>
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
                {exp.companyLogo && (
                  <div className="company-logo">
                    <img src={exp.companyLogo} alt={exp.companyName || 'Company'} />
                  </div>
                )}
                <div>
                  <h4>{exp.jobTitle || 'Unknown Role'}</h4>
                  <p className="company-details">
                    <span className="company-name">{exp.companyName || 'Unknown Company'}</span>
                    {exp.companyName && exp.duration && <span className="dot-separator">•</span>}
                    <span className="duration">{exp.duration || ''}</span>
                  </p>
                </div>
              </div>
              {exp.description && <p className="description">{exp.description}</p>}
              {exp.skills && (
                <div className="experience-skills">
                  <p>Skills: {exp.skills}</p>
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
          <div className="education-header">
            {edu.schoolLogo && (
              <div className="school-logo">
                <img src={edu.schoolLogo} alt={edu.schoolName || 'School'} />
              </div>
            )}
            <div>
              <h4>{edu.schoolName || 'Unknown School'}</h4>
              <p className="degree">{edu.degree || ''}</p>
              <p className="duration">{edu.duration || ''}</p>
              {edu.description && <p className="description">{edu.description}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;

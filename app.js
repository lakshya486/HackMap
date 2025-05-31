const { useState, useEffect, useContext, createContext } = React;

// App Context for state management
const AppContext = createContext();

// Sample data
const sampleHackathons = [
  {
    id: "hack1",
    title: "AI Innovation Challenge 2024",
    theme: "Artificial Intelligence",
    startDate: "2024-06-15",
    endDate: "2024-06-17",
    registrationDeadline: "2024-06-10",
    prizes: "$50,000 in prizes",
    tags: ["AI", "Machine Learning", "Innovation"],
    location: "San Francisco, CA",
    description: "Build innovative AI solutions that solve real-world problems",
    registeredUsers: []
  },
  {
    id: "hack2", 
    title: "Web3 Future Hack",
    theme: "Blockchain",
    startDate: "2024-06-20",
    endDate: "2024-06-22",
    registrationDeadline: "2024-06-15",
    prizes: "$25,000 in crypto",
    tags: ["Blockchain", "Web3", "DeFi"],
    location: "Online",
    description: "Create the next generation of decentralized applications",
    registeredUsers: []
  },
  {
    id: "hack3",
    title: "Climate Tech Solutions",
    theme: "Sustainability",
    startDate: "2024-06-25",
    endDate: "2024-06-27",
    registrationDeadline: "2024-06-20",
    prizes: "$30,000 + mentorship",
    tags: ["Climate", "Clean Tech", "Sustainability"],
    location: "Boston, MA",
    description: "Develop technology solutions to combat climate change",
    registeredUsers: []
  }
];

const availableSkills = [
  "JavaScript", "Python", "React", "Node.js", "Machine Learning", 
  "UI/UX Design", "Product Management", "Blockchain", "DevOps", 
  "Data Science", "Mobile Development", "Game Development"
];

const techStacks = [
  "React", "Vue.js", "Angular", "Node.js", "Python", "Django",
  "Express.js", "MongoDB", "PostgreSQL", "AWS", "Docker", "Kubernetes"
];

// Initial app state
const initialState = {
  currentUser: null,
  currentPage: 'home',
  users: [],
  hackathons: sampleHackathons,
  teams: [],
  projects: [],
  notifications: [],
  showLoginModal: false,
  showSignupModal: false,
  showCreateTeamModal: false,
  showCreateProjectModal: false,
  registrationSuccess: null
};

// App Provider Component
const AppProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const addUser = (user) => {
    const newUser = {
      ...user,
      id: Date.now().toString(),
      joinedTeams: [],
      registeredHackathons: []
    };
    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      currentUser: newUser
    }));
    
    // Add welcome notification
    addNotification(newUser.id, "Welcome to HackMap! Get started by registering for a hackathon.");
  };

  const login = (email, password) => {
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const addNotification = (userId, message, type = "info") => {
    const newNotification = {
      id: Date.now().toString(),
      userId,
      type,
      message,
      read: false,
      timestamp: new Date().toISOString()
    };
    
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }));
  };

  const registerForHackathon = (hackathonId) => {
    if (!state.currentUser) return;
    
    const hackathon = state.hackathons.find(h => h.id === hackathonId);
    
    setState(prev => ({
      ...prev,
      hackathons: prev.hackathons.map(h => 
        h.id === hackathonId 
          ? { ...h, registeredUsers: [...h.registeredUsers, prev.currentUser.id] }
          : h
      ),
      currentUser: {
        ...prev.currentUser,
        registeredHackathons: [...prev.currentUser.registeredHackathons, hackathonId]
      },
      users: prev.users.map(u => 
        u.id === prev.currentUser.id
          ? { ...u, registeredHackathons: [...u.registeredHackathons, hackathonId] }
          : u
      ),
      registrationSuccess: hackathon.title
    }));
    
    // Add notification
    addNotification(
      state.currentUser.id, 
      `You've successfully registered for ${hackathon.title}!`, 
      "success"
    );
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setState(prev => ({ ...prev, registrationSuccess: null }));
    }, 3000);
  };

  const createTeam = (teamData) => {
    const newTeam = {
      ...teamData,
      id: Date.now().toString(),
      currentMembers: [state.currentUser.id],
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdBy: state.currentUser.id
    };
    
    setState(prev => ({
      ...prev,
      teams: [...prev.teams, newTeam],
      currentUser: {
        ...prev.currentUser,
        joinedTeams: [...prev.currentUser.joinedTeams, newTeam.id]
      },
      users: prev.users.map(u => 
        u.id === prev.currentUser.id
          ? { ...u, joinedTeams: [...u.joinedTeams, newTeam.id] }
          : u
      )
    }));
    
    const hackathon = state.hackathons.find(h => h.id === teamData.hackathonId);
    
    // Add notification
    addNotification(
      state.currentUser.id,
      `Your team "${teamData.name}" for ${hackathon.title} has been created!`,
      "success"
    );
  };

  const joinTeam = (teamId) => {
    const team = state.teams.find(t => t.id === teamId);
    
    setState(prev => ({
      ...prev,
      teams: prev.teams.map(t => 
        t.id === teamId 
          ? { ...t, currentMembers: [...t.currentMembers, prev.currentUser.id] }
          : t
      ),
      currentUser: {
        ...prev.currentUser,
        joinedTeams: [...prev.currentUser.joinedTeams, teamId]
      },
      users: prev.users.map(u => 
        u.id === prev.currentUser.id
          ? { ...u, joinedTeams: [...u.joinedTeams, teamId] }
          : u
      )
    }));
    
    // Notify team creator
    addNotification(
      team.createdBy,
      `${state.currentUser.name} has joined your team "${team.name}"!`,
      "team_invite"
    );
  };

  const createProject = (projectData) => {
    const newProject = {
      ...projectData,
      id: Date.now().toString(),
      likes: 0,
      comments: []
    };
    
    setState(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
    
    const team = state.teams.find(t => t.id === projectData.teamId);
    
    // Notify team members
    team.currentMembers.forEach(memberId => {
      if (memberId !== state.currentUser.id) {
        addNotification(
          memberId,
          `A new project "${projectData.title}" has been created for your team "${team.name}"!`,
          "new_comment"
        );
      }
    });
  };

  const likeProject = (projectId) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId 
          ? { ...p, likes: p.likes + 1 }
          : p
      )
    }));
  };

  const updateProfile = (profileData) => {
    setState(prev => ({
      ...prev,
      currentUser: { ...prev.currentUser, ...profileData },
      users: prev.users.map(u => 
        u.id === prev.currentUser.id
          ? { ...u, ...profileData }
          : u
      )
    }));
  };

  const value = {
    ...state,
    updateState,
    addUser,
    login,
    logout,
    registerForHackathon,
    createTeam,
    joinTeam,
    createProject,
    likeProject,
    updateProfile,
    addNotification
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Components
const Header = () => {
  const { currentPage, updateState, currentUser, logout } = useApp();
  
  const navigate = (page) => {
    updateState({ currentPage: page });
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <a href="#" className="nav__brand" onClick={() => navigate('home')}>
            HackMap
          </a>
          
          <div className="nav__menu">
            <a 
              href="#" 
              className={`nav__link ${currentPage === 'home' ? 'nav__link--active' : ''}`}
              onClick={() => navigate('home')}
            >
              Home
            </a>
            <a 
              href="#" 
              className={`nav__link ${currentPage === 'hackathons' ? 'nav__link--active' : ''}`}
              onClick={() => navigate('hackathons')}
            >
              Hackathons
            </a>
            <a 
              href="#" 
              className={`nav__link ${currentPage === 'teams' ? 'nav__link--active' : ''}`}
              onClick={() => navigate('teams')}
            >
              Teams
            </a>
            <a 
              href="#" 
              className={`nav__link ${currentPage === 'projects' ? 'nav__link--active' : ''}`}
              onClick={() => navigate('projects')}
            >
              Projects
            </a>
            {currentUser && (
              <a 
                href="#" 
                className={`nav__link ${currentPage === 'dashboard' ? 'nav__link--active' : ''}`}
                onClick={() => navigate('dashboard')}
              >
                Dashboard
              </a>
            )}
          </div>

          <div className="nav__actions">
            {currentUser ? (
              <>
                <a 
                  href="#" 
                  className="nav__link"
                  onClick={() => navigate('profile')}
                >
                  {currentUser.name}
                </a>
                <button className="btn btn--outline btn--sm" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn--outline btn--sm"
                  onClick={() => updateState({ showLoginModal: true })}
                >
                  Login
                </button>
                <button 
                  className="btn btn--primary btn--sm"
                  onClick={() => updateState({ showSignupModal: true })}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

const HomePage = () => {
  const { hackathons, updateState } = useApp();
  const featuredHackathons = hackathons.slice(0, 3);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome to HackMap</h1>
          <p className="page-subtitle">Discover hackathons and build amazing teams</p>
        </div>
        <button 
          className="btn btn--primary"
          onClick={() => updateState({ currentPage: 'hackathons' })}
        >
          Browse All Hackathons
        </button>
      </div>

      <div className="grid grid--3">
        {featuredHackathons.map(hackathon => (
          <HackathonCard key={hackathon.id} hackathon={hackathon} />
        ))}
      </div>
    </div>
  );
};

const HackathonCard = ({ hackathon }) => {
  const { currentUser, registerForHackathon, updateState } = useApp();
  const isRegistered = currentUser?.registeredHackathons?.includes(hackathon.id);

  const handleRegister = () => {
    if (!currentUser) {
      updateState({ showLoginModal: true });
      return;
    }
    registerForHackathon(hackathon.id);
  };

  return (
    <div className="hackathon-card">
      <div className="hackathon-card__title">{hackathon.title}</div>
      <div className="hackathon-card__theme">{hackathon.theme}</div>
      <div className="hackathon-card__dates">
        {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
      </div>
      <div className="hackathon-card__prizes">{hackathon.prizes}</div>
      <div className="hackathon-card__tags">
        {hackathon.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      <button 
        className={`btn ${isRegistered ? 'btn--secondary' : 'btn--primary'} btn--full-width`}
        onClick={handleRegister}
        disabled={isRegistered}
      >
        {isRegistered ? 'Registered ✓' : 'Register'}
      </button>
    </div>
  );
};

const HackathonsPage = () => {
  const { hackathons, registrationSuccess } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [themeFilter, setThemeFilter] = useState('');

  const filteredHackathons = hackathons.filter(hackathon => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = !themeFilter || hackathon.theme === themeFilter;
    return matchesSearch && matchesTheme;
  });

  const themes = [...new Set(hackathons.map(h => h.theme))];

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hackathons</h1>
          <p className="page-subtitle">Find and register for upcoming hackathons</p>
        </div>
      </div>

      {registrationSuccess && (
        <div className="status status--success mb-8">
          Successfully registered for {registrationSuccess}!
        </div>
      )}

      <div className="filter-bar">
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search hackathons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Theme</label>
            <select
              className="form-control"
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
            >
              <option value="">All Themes</option>
              {themes.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid--3">
        {filteredHackathons.map(hackathon => (
          <HackathonCard key={hackathon.id} hackathon={hackathon} />
        ))}
      </div>
    </div>
  );
};

const TeamsPage = () => {
  const { teams, hackathons, currentUser, updateState } = useApp();
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [teamCreated, setTeamCreated] = useState(false);

  // Clear team created message after 3 seconds
  useEffect(() => {
    if (teamCreated) {
      const timer = setTimeout(() => {
        setTeamCreated(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [teamCreated]);

  const filteredTeams = teams.filter(team => 
    !selectedHackathon || team.hackathonId === selectedHackathon
  );

  const handleCreateTeam = () => {
    if (!currentUser) {
      updateState({ showLoginModal: true });
      return;
    }
    
    if (currentUser.registeredHackathons.length === 0) {
      alert("Please register for a hackathon first before creating a team.");
      updateState({ currentPage: 'hackathons' });
      return;
    }
    
    updateState({ showCreateTeamModal: true });
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="page-subtitle">Find teams to join or create your own</p>
        </div>
        <button 
          className="btn btn--primary"
          onClick={handleCreateTeam}
        >
          Create Team
        </button>
      </div>

      {teamCreated && (
        <div className="status status--success mb-8">
          Team created successfully!
        </div>
      )}

      <div className="filter-bar">
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Hackathon</label>
            <select
              className="form-control"
              value={selectedHackathon}
              onChange={(e) => setSelectedHackathon(e.target.value)}
            >
              <option value="">All Hackathons</option>
              {hackathons.map(hackathon => (
                <option key={hackathon.id} value={hackathon.id}>{hackathon.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">No teams found</div>
          <p>Be the first to create a team for this hackathon!</p>
        </div>
      ) : (
        <div className="grid grid--2">
          {filteredTeams.map(team => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
};

const TeamCard = ({ team }) => {
  const { currentUser, joinTeam, users, hackathons, updateState } = useApp();
  const hackathon = hackathons.find(h => h.id === team.hackathonId);
  const isAlreadyMember = currentUser?.joinedTeams?.includes(team.id);
  const isFull = team.currentMembers.length >= team.maxSize;

  const handleJoinTeam = () => {
    if (!currentUser) {
      updateState({ showLoginModal: true });
      return;
    }
    
    if (!currentUser.registeredHackathons.includes(team.hackathonId)) {
      alert(`You need to register for ${hackathon.title} before joining this team.`);
      return;
    }
    
    if (!isAlreadyMember && !isFull) {
      joinTeam(team.id);
    }
  };

  // Find team creator
  const creator = users.find(u => u.id === team.createdBy);

  return (
    <div className="team-card">
      <div className="team-card__header">
        <div className="team-card__name">{team.name}</div>
        <div className="team-card__size">
          {team.currentMembers.length}/{team.maxSize} members
        </div>
      </div>
      
      <div className="hackathon-card__theme">{hackathon?.title}</div>
      <div className="team-card__description">{team.description}</div>
      
      <div className="team-card__skills">
        <div className="team-card__skills-label">Needed Skills:</div>
        <div className="hackathon-card__tags">
          {team.neededSkills.map(skill => (
            <span key={skill} className="tag tag--skill">{skill}</span>
          ))}
        </div>
      </div>
      
      {creator && (
        <div className="mb-8">
          <div className="team-card__skills-label">Created by:</div>
          <div>{creator.name}</div>
        </div>
      )}

      <button 
        className={`btn ${isAlreadyMember ? 'btn--secondary' : 'btn--primary'} btn--full-width`}
        onClick={handleJoinTeam}
        disabled={isAlreadyMember || isFull}
      >
        {isAlreadyMember ? 'Already Member ✓' : isFull ? 'Team Full' : 'Join Team'}
      </button>
    </div>
  );
};

const ProjectsPage = () => {
  const { projects, teams, hackathons, currentUser, updateState } = useApp();
  const [projectCreated, setProjectCreated] = useState(false);

  // Clear project created message after 3 seconds
  useEffect(() => {
    if (projectCreated) {
      const timer = setTimeout(() => {
        setProjectCreated(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [projectCreated]);

  const handleCreateProject = () => {
    if (!currentUser) {
      updateState({ showLoginModal: true });
      return;
    }
    
    if (currentUser.joinedTeams.length === 0) {
      alert("You need to create or join a team before posting a project idea.");
      updateState({ currentPage: 'teams' });
      return;
    }
    
    updateState({ showCreateProjectModal: true });
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Project Ideas</h1>
          <p className="page-subtitle">Browse and share project ideas</p>
        </div>
        <button 
          className="btn btn--primary"
          onClick={handleCreateProject}
        >
          Post Project Idea
        </button>
      </div>

      {projectCreated && (
        <div className="status status--success mb-8">
          Project idea posted successfully!
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">No projects yet</div>
          <p>Be the first to share a project idea!</p>
        </div>
      ) : (
        <div className="grid grid--2">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectCard = ({ project }) => {
  const { likeProject, teams, hackathons, currentUser } = useApp();
  const team = teams.find(t => t.id === project.teamId);
  const hackathon = hackathons.find(h => h.id === project.hackathonId);

  const handleLike = () => {
    if (!currentUser) {
      alert("Please login to like projects");
      return;
    }
    likeProject(project.id);
  };

  return (
    <div className="project-card">
      <div className="project-card__header">
        <div className="project-card__title">{project.title}</div>
        <div className="project-card__likes">
          ❤️ {project.likes}
        </div>
      </div>
      
      <div className="hackathon-card__theme">{hackathon?.title} • {team?.name}</div>
      <div className="project-card__description">{project.description}</div>
      
      <div className="project-card__tech">
        <div className="team-card__skills-label">Tech Stack:</div>
        <div className="hackathon-card__tags">
          {project.techStack.map(tech => (
            <span key={tech} className="tag">{tech}</span>
          ))}
        </div>
      </div>

      <div className="project-card__actions">
        <button 
          className="btn btn--outline btn--sm"
          onClick={handleLike}
        >
          Like
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { currentUser, hackathons, teams, projects, notifications, updateState } = useApp();
  
  if (!currentUser) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state__title">Please login to view dashboard</div>
          <button 
            className="btn btn--primary mt-8"
            onClick={() => updateState({ showLoginModal: true })}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const userHackathons = hackathons.filter(h => 
    currentUser.registeredHackathons.includes(h.id)
  );
  const userTeams = teams.filter(t => 
    currentUser.joinedTeams.includes(t.id)
  );
  const userNotifications = notifications.filter(n => n.userId === currentUser.id);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {currentUser.name}!</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{userHackathons.length}</div>
              <div className="stat-label">Registered Hackathons</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{userTeams.length}</div>
              <div className="stat-label">Teams Joined</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{projects.filter(p => {
                const team = teams.find(t => t.id === p.teamId);
                return team && team.currentMembers.includes(currentUser.id);
              }).length}</div>
              <div className="stat-label">Your Projects</div>
            </div>
          </div>

          <div className="card">
            <div className="card__body">
              <h3>My Hackathons</h3>
              {userHackathons.length === 0 ? (
                <div className="empty-state">
                  <p>No hackathons registered yet.</p>
                  <button 
                    className="btn btn--primary mt-8"
                    onClick={() => updateState({ currentPage: 'hackathons' })}
                  >
                    Browse Hackathons
                  </button>
                </div>
              ) : (
                <div className="grid grid--2">
                  {userHackathons.map(hackathon => (
                    <HackathonCard key={hackathon.id} hackathon={hackathon} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card__body">
              <h3>My Teams</h3>
              {userTeams.length === 0 ? (
                <div className="empty-state">
                  <p>No teams joined yet.</p>
                  <button 
                    className="btn btn--primary mt-8"
                    onClick={() => updateState({ currentPage: 'teams' })}
                  >
                    Browse Teams
                  </button>
                </div>
              ) : (
                <div className="grid grid--2">
                  {userTeams.map(team => (
                    <TeamCard key={team.id} team={team} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="card">
            <div className="card__body">
              <h4>Notifications</h4>
              {userNotifications.length === 0 ? (
                <p>No new notifications</p>
              ) : (
                <div className="notification-list">
                  {userNotifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification ${!notification.read ? 'notification--unread' : ''}`}
                    >
                      {notification.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="card mt-8">
            <div className="card__body">
              <h4>Quick Actions</h4>
              <div className="flex flex-col gap-8 mt-8">
                <button 
                  className="btn btn--primary"
                  onClick={() => updateState({ currentPage: 'hackathons' })}
                >
                  Find Hackathons
                </button>
                <button 
                  className="btn btn--outline"
                  onClick={() => updateState({ currentPage: 'teams' })}
                >
                  Browse Teams
                </button>
                <button 
                  className="btn btn--outline"
                  onClick={() => updateState({ currentPage: 'profile' })}
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { currentUser, updateProfile, updateState } = useApp();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: [],
    experience: 'beginner'
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        skills: currentUser.skills || [],
        experience: currentUser.experience || 'beginner'
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state__title">Please login to view profile</div>
          <button 
            className="btn btn--primary mt-8"
            onClick={() => updateState({ showLoginModal: true })}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSave = () => {
    updateProfile(formData);
    setEditing(false);
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your profile information</p>
        </div>
        <button 
          className="btn btn--primary"
          onClick={() => editing ? handleSave() : setEditing(true)}
        >
          {editing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-section">
        <div className="form-group">
          <label className="form-label">Name</label>
          {editing ? (
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          ) : (
            <p>{currentUser.name}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Bio</label>
          {editing ? (
            <textarea
              className="form-control"
              rows="3"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            />
          ) : (
            <p>{currentUser.bio || 'No bio provided'}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Experience Level</label>
          {editing ? (
            <select
              className="form-control"
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          ) : (
            <p>{currentUser.experience || 'Not specified'}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Skills</label>
          {editing ? (
            <div className="skills-grid">
              {availableSkills.map(skill => (
                <button
                  key={skill}
                  type="button"
                  className={`tag cursor-pointer ${formData.skills.includes(skill) ? 'tag--skill' : ''}`}
                  onClick={() => handleSkillToggle(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          ) : (
            <div className="skills-grid">
              {(currentUser.skills || []).map(skill => (
                <span key={skill} className="tag tag--skill">{skill}</span>
              ))}
              {(!currentUser.skills || currentUser.skills.length === 0) && (
                <p>No skills added yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal Components
const LoginModal = () => {
  const { showLoginModal, updateState, login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!showLoginModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (login(email, password)) {
      updateState({ showLoginModal: false });
      setEmail('');
      setPassword('');
    } else {
      setError('Invalid credentials or user not found');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h3 className="modal__title">Login</h3>
          <button 
            className="modal__close"
            onClick={() => updateState({ showLoginModal: false })}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            {error && (
              <div className="status status--error mb-8">{error}</div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="text-center">
              <p>Don't have an account? 
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  updateState({ showLoginModal: false, showSignupModal: true });
                }}> Sign up</a>
              </p>
            </div>
          </div>
          <div className="modal__footer">
            <button 
              type="button" 
              className="btn btn--outline"
              onClick={() => updateState({ showLoginModal: false })}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SignupModal = () => {
  const { showSignupModal, updateState, addUser } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    skills: [],
    experience: 'beginner'
  });

  if (!showSignupModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addUser(formData);
    updateState({ showSignupModal: false });
    setFormData({
      name: '',
      email: '',
      password: '',
      bio: '',
      skills: [],
      experience: 'beginner'
    });
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h3 className="modal__title">Sign Up</h3>
          <button 
            className="modal__close"
            onClick={() => updateState({ showSignupModal: false })}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-control"
                rows="3"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select
                className="form-control"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Skills</label>
              <div className="skills-grid">
                {availableSkills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    className={`tag cursor-pointer ${formData.skills.includes(skill) ? 'tag--skill' : ''}`}
                    onClick={() => handleSkillToggle(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-center">
              <p>Already have an account? 
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  updateState({ showSignupModal: false, showLoginModal: true });
                }}> Login</a>
              </p>
            </div>
          </div>
          <div className="modal__footer">
            <button 
              type="button" 
              className="btn btn--outline"
              onClick={() => updateState({ showSignupModal: false })}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateTeamModal = () => {
  const { showCreateTeamModal, updateState, createTeam, hackathons, currentUser } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hackathonId: '',
    maxSize: 4,
    neededSkills: []
  });

  useEffect(() => {
    if (currentUser && currentUser.registeredHackathons.length > 0) {
      setFormData(prev => ({
        ...prev,
        hackathonId: currentUser.registeredHackathons[0]
      }));
    }
  }, [currentUser]);

  if (!showCreateTeamModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    createTeam(formData);
    updateState({ showCreateTeamModal: false });
    // Show success message on teams page
    const teamsPage = document.querySelector('.TeamsPage');
    if (teamsPage) {
      teamsPage.scrollIntoView({ behavior: 'smooth' });
    }
    setFormData({
      name: '',
      description: '',
      hackathonId: currentUser?.registeredHackathons[0] || '',
      maxSize: 4,
      neededSkills: []
    });
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      neededSkills: prev.neededSkills.includes(skill)
        ? prev.neededSkills.filter(s => s !== skill)
        : [...prev.neededSkills, skill]
    }));
  };

  const userHackathons = hackathons.filter(h => 
    currentUser?.registeredHackathons?.includes(h.id)
  );

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h3 className="modal__title">Create Team</h3>
          <button 
            className="modal__close"
            onClick={() => updateState({ showCreateTeamModal: false })}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-group">
              <label className="form-label">Team Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hackathon</label>
              <select
                className="form-control"
                value={formData.hackathonId}
                onChange={(e) => setFormData(prev => ({ ...prev, hackathonId: e.target.value }))}
                required
              >
                <option value="">Select Hackathon</option>
                {userHackathons.map(hackathon => (
                  <option key={hackathon.id} value={hackathon.id}>{hackathon.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Max Team Size</label>
              <input
                type="number"
                className="form-control"
                min="2"
                max="10"
                value={formData.maxSize}
                onChange={(e) => setFormData(prev => ({ ...prev, maxSize: parseInt(e.target.value) }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Needed Skills</label>
              <div className="skills-grid">
                {availableSkills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    className={`tag cursor-pointer ${formData.neededSkills.includes(skill) ? 'tag--skill' : ''}`}
                    onClick={() => handleSkillToggle(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal__footer">
            <button 
              type="button" 
              className="btn btn--outline"
              onClick={() => updateState({ showCreateTeamModal: false })}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateProjectModal = () => {
  const { showCreateProjectModal, updateState, createProject, teams, hackathons, currentUser } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: [],
    teamId: '',
    hackathonId: ''
  });

  useEffect(() => {
    if (currentUser && currentUser.joinedTeams.length > 0) {
      const teamId = currentUser.joinedTeams[0];
      const team = teams.find(t => t.id === teamId);
      setFormData(prev => ({
        ...prev,
        teamId,
        hackathonId: team?.hackathonId || ''
      }));
    }
  }, [currentUser, teams]);

  if (!showCreateProjectModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    createProject(formData);
    updateState({ showCreateProjectModal: false });
    setFormData({
      title: '',
      description: '',
      techStack: [],
      teamId: '',
      hackathonId: ''
    });
  };

  const handleTechToggle = (tech) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const userTeams = teams.filter(t => 
    currentUser?.joinedTeams?.includes(t.id)
  );

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h3 className="modal__title">Create Project Idea</h3>
          <button 
            className="modal__close"
            onClick={() => updateState({ showCreateProjectModal: false })}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-group">
              <label className="form-label">Project Title</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Team</label>
              <select
                className="form-control"
                value={formData.teamId}
                onChange={(e) => {
                  const team = userTeams.find(t => t.id === e.target.value);
                  setFormData(prev => ({ 
                    ...prev, 
                    teamId: e.target.value,
                    hackathonId: team?.hackathonId || ''
                  }));
                }}
                required
              >
                <option value="">Select Team</option>
                {userTeams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tech Stack</label>
              <div className="skills-grid">
                {techStacks.map(tech => (
                  <button
                    key={tech}
                    type="button"
                    className={`tag cursor-pointer ${formData.techStack.includes(tech) ? 'tag--skill' : ''}`}
                    onClick={() => handleTechToggle(tech)}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal__footer">
            <button 
              type="button" 
              className="btn btn--outline"
              onClick={() => updateState({ showCreateProjectModal: false })}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'hackathons':
        return <HackathonsPage />;
      case 'teams':
        return <TeamsPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="main">
        {renderPage()}
      </main>
      <LoginModal />
      <SignupModal />
      <CreateTeamModal />
      <CreateProjectModal />
    </div>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AppProvider>
    <App />
  </AppProvider>
);
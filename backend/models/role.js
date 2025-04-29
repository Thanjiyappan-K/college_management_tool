// Define roles and their hierarchy
const ROLES = {
    SITE_ADMIN: 'site_admin',
    COLLEGE_ADMIN: 'college_admin',
    TEACHER: 'teacher',
    STUDENT: 'student'
  };
  
  // Define permissions for each role
  const PERMISSIONS = {
    [ROLES.SITE_ADMIN]: [
      'manage_admins',
      'manage_users',
      'view_all_users',
      'manage_colleges'
    ],
    [ROLES.COLLEGE_ADMIN]: [
      'manage_college_users',
      'view_college_users',
      'view_all_users',
      'manage_teachers'
    ],
    [ROLES.TEACHER]: [
      'view_students',
      'manage_courses',
      'grade_students'
    ],
    [ROLES.STUDENT]: [
      'view_courses',
      'view_grades'
    ]
  };
  
  // Check if a role has a specific permission
  const hasPermission = (role, permission) => {
    if (!PERMISSIONS[role]) return false;
    return PERMISSIONS[role].includes(permission);
  };
  
  // Define role hierarchy (who can manage whom)
  const canManageRole = (managerRole, targetRole) => {
    if (managerRole === ROLES.SITE_ADMIN) return true;
    if (managerRole === ROLES.COLLEGE_ADMIN && 
       (targetRole === ROLES.TEACHER || targetRole === ROLES.STUDENT)) return true;
    if (managerRole === ROLES.TEACHER && targetRole === ROLES.STUDENT) return true;
    return false;
  };
  
  // Get role redirect paths
  const getRoleRedirectPath = (role) => {
    switch (role) {
      case ROLES.SITE_ADMIN:
      case ROLES.COLLEGE_ADMIN:
        return '/admin';
      case ROLES.TEACHER:
        return '/teacher';
      case ROLES.STUDENT:
        return '/student';
      default:
        return '/';
    }
  };
  
  module.exports = {
    ROLES,
    PERMISSIONS,
    hasPermission,
    canManageRole,
    getRoleRedirectPath
  };
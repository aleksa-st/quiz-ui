import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import { cacheService } from '../../services/cacheService';
import { ENV } from '../../src/config/env';
import { User as UserIcon, Briefcase, GraduationCap, Camera, Save, X } from 'lucide-react';

type EditSection = 'personal' | 'career' | 'education' | null;

export const ProfileManagement: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [editingSection, setEditingSection] = useState<EditSection>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [personalData, setPersonalData] = useState<any>({});
  const [careerData, setCareerData] = useState<any>({ skills: [] });
  const [educationData, setEducationData] = useState<any>({});
  const [skillInput, setSkillInput] = useState('');
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const skillOptions = [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js',
    'Python', 'Django', 'Flask', 'PHP', 'Laravel', 'CodeIgniter', 'Java', 'Spring Boot',
    'C#', '.NET', 'Ruby', 'Ruby on Rails', 'Go', 'Rust', 'Swift', 'Kotlin',
    'HTML', 'CSS', 'SASS', 'Bootstrap', 'Tailwind CSS', 'jQuery',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence',
    'Figma', 'Adobe XD', 'Photoshop', 'Illustrator'
  ];



  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await loadProfile();
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const loadProfile = async () => {
    try {
      // Try to load from cache first
      let profileData = cacheService.getUserProfile();

      if (!profileData) {
        // If not in cache, fetch from API
        const response = await api.profile.get();
        if (response.success) {
          profileData = response.data;
          // Cache the profile for this session
          cacheService.setUserProfile(profileData);
        }
      }

      if (profileData) {
        const u = profileData;
        setUser(u);
        setPersonalData({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          date_of_birth: u.date_of_birth || '',
          bio: u.bio || '',
          linkedin: u.linkedin || '',
          twitter: u.twitter || '',
        });
        setCareerData({
          job_title: u.job_title || '',
          company: u.company || '',
          industry: u.industry || '',
          experience_years: u.experience_years || '',
          career_level: u.career_level || '',
          skills: Array.isArray(u.skills) ? u.skills : (u.skills ? u.skills.split(', ').filter(Boolean) : []),
        });
        setEducationData({
          highest_qualification: u.highest_qualification || '',
          institution: u.institution || '',
          field_of_study: u.field_of_study || '',
          graduation_year: u.graduation_year || '',
          certifications: u.certifications || '',
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const profileData = {
        ...personalData,
        ...careerData,
        ...educationData,
        experience_years: parseInt(careerData.experience_years) || null,
        graduation_year: parseInt(educationData.graduation_year) || null,
      };

      const response = await api.profile.update(profileData);

      if (response.success && response.data) {
        // Update cache with the new full profile data
        cacheService.setUserProfile(response.data);

        // Notify other components (Header, Dashboard) about the update
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: response.data }));

        await loadProfile();
        setEditingSection(null);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      setLoading(true);
      const response = await api.profile.uploadAvatar(formData);
      if (response.success && response.data?.avatar_url) {
        // Fetch full updated profile to ensure consistency
        const profileRes = await api.profile.get();
        if (profileRes.success && profileRes.data) {
          const updatedUser = profileRes.data;
          setUser(updatedUser);
          setAvatarKey(Date.now());

          cacheService.setUserProfile(updatedUser);

          window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
        }
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600"></div></div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-6 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile Management</h1>
          <p className="text-gray-600">Manage your personal, career, and educational information</p>
        </div>

        <div className="bg-white rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex items-start gap-6">
            <div className="relative">
              {(user.avatar_url || user.avatar) ? (
                <img src={`${user.avatar_url || user.avatar}?t=${avatarKey}`} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" ref={fileInputRef} />
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <p className="text-gray-600 mb-2">{careerData.job_title} {careerData.company && `at ${careerData.company}`}</p>
              <p className="text-gray-500 text-sm">{personalData.bio}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
            </div>
            {editingSection !== 'personal' && (
              <button onClick={() => setEditingSection('personal')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">Edit</button>
            )}
          </div>
          {editingSection === 'personal' ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Full Name</label><input type="text" value={personalData.name} onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Email Address</label><input type="email" value={personalData.email} onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Phone Number</label><input type="tel" value={personalData.phone} onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Date of Birth</label><input type="date" value={personalData.date_of_birth} onChange={(e) => setPersonalData({ ...personalData, date_of_birth: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div className="md:col-span-2"><label className="block text-gray-700 mb-2 text-sm font-medium">Bio / About</label><textarea value={personalData.bio} onChange={(e) => setPersonalData({ ...personalData, bio: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" rows={3} /></div>
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">LinkedIn</label><input type="text" value={personalData.linkedin} onChange={(e) => setPersonalData({ ...personalData, linkedin: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Twitter</label><input type="text" value={personalData.twitter} onChange={(e) => setPersonalData({ ...personalData, twitter: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
              </div>
              <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
                <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 font-medium"><Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setEditingSection(null)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition flex items-center gap-2 font-medium"><X className="w-4 h-4" />Cancel</button>
              </div>
            </>
          ) : (
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              <div><p className="text-gray-500 text-sm">Full Name</p><p className="text-gray-900 font-medium">{personalData.name}</p></div>
              <div><p className="text-gray-500 text-sm">Email Address</p><p className="text-gray-900 font-medium">{personalData.email}</p></div>
              <div><p className="text-gray-500 text-sm">Phone Number</p><p className="text-gray-900 font-medium">{personalData.phone}</p></div>
              <div><p className="text-gray-500 text-sm">Date of Birth</p><p className="text-gray-900 font-medium">{personalData.date_of_birth}</p></div>
              <div className="md:col-span-2"><p className="text-gray-500 text-sm">Bio</p><p className="text-gray-900 font-medium">{personalData.bio}</p></div>
              <div><p className="text-gray-500 text-sm">LinkedIn</p><p className="text-gray-900 font-medium">{personalData.linkedin}</p></div>
              <div><p className="text-gray-500 text-sm">Twitter</p><p className="text-gray-900 font-medium">{personalData.twitter}</p></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-8 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Career Information</h2>
            </div>
            {editingSection !== 'career' && (
              <button onClick={() => setEditingSection('career')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">Edit</button>
            )}
          </div>

          {editingSection === 'career' ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Job Title</label><input type="text" value={careerData.job_title} onChange={(e) => setCareerData({ ...careerData, job_title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Company / Organization</label><input type="text" value={careerData.company} onChange={(e) => setCareerData({ ...careerData, company: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Industry</label><select value={careerData.industry} onChange={(e) => setCareerData({ ...careerData, industry: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"><option value="">Select Industry</option><option>Technology</option><option>Healthcare</option><option>Finance</option><option>Education</option><option>Other</option></select></div>
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Years of Experience</label><input type="number" min="0" max="50" value={careerData.experience_years} onChange={(e) => setCareerData({ ...careerData, experience_years: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter years" /></div>
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Career Level</label><select value={careerData.career_level} onChange={(e) => setCareerData({ ...careerData, career_level: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"><option value="">Select Level</option><option>Entry-Level</option><option>Mid-Level</option><option>Senior</option><option>Executive</option></select></div>
                <div className="md:col-span-2"><label className="block text-gray-700 mb-2 text-sm font-medium">Skills</label><div className="space-y-3"><div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-300 rounded-lg">{(careerData.skills || []).map((skill: string, index: number) => (<span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">{skill}<button type="button" onClick={() => setCareerData({ ...careerData, skills: careerData.skills.filter((_: any, i: number) => i !== index) })} className="text-purple-600 hover:text-purple-800 font-bold">×</button></span>))}</div><div className="relative"><input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && skillInput.trim() && !(careerData.skills || []).includes(skillInput.trim())) { e.preventDefault(); setCareerData({ ...careerData, skills: [...(careerData.skills || []), skillInput.trim()] }); setSkillInput(''); } }} placeholder="Type a skill and press Enter" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />{skillInput && (<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">{skillOptions.filter(skill => skill.toLowerCase().includes(skillInput.toLowerCase()) && !(careerData.skills || []).includes(skill)).map(skill => (<button key={skill} type="button" onClick={() => { setCareerData({ ...careerData, skills: [...(careerData.skills || []), skill] }); setSkillInput(''); }} className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">{skill}</button>))}</div>)}</div></div></div>
              </div>
              <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
                <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 font-medium"><Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setEditingSection(null)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition flex items-center gap-2 font-medium"><X className="w-4 h-4" />Cancel</button>
              </div>
            </>
          ) : (
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              <div><p className="text-gray-500 text-sm">Job Title</p><p className="text-gray-900 font-medium">{careerData.job_title}</p></div>
              <div><p className="text-gray-500 text-sm">Company</p><p className="text-gray-900 font-medium">{careerData.company}</p></div>
              <div><p className="text-gray-500 text-sm">Industry</p><p className="text-gray-900 font-medium">{careerData.industry}</p></div>
              <div><p className="text-gray-500 text-sm">Experience</p><p className="text-gray-900 font-medium">{careerData.experience_years} years</p></div>
              <div><p className="text-gray-500 text-sm">Career Level</p><p className="text-gray-900 font-medium">{careerData.career_level}</p></div>
              <div className="md:col-span-2"><p className="text-gray-500 text-sm">Skills</p><div className="flex flex-wrap gap-2 mt-1">{(careerData.skills || []).length > 0 ? (careerData.skills || []).map((skill: string, index: number) => (<span key={index} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">{skill}</span>)) : (<p className="text-gray-900 font-medium">No skills added</p>)}</div></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-8 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
            </div>
            {editingSection !== 'password' && (
              <button onClick={() => setEditingSection('password')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">Change</button>
            )}
          </div>
          {editingSection === 'password' ? (
            <>
              <div className="grid gap-4 max-w-md">
                {user?.google_id ? (
                  <p className="text-blue-600 text-sm mb-4">Since you have Google authentication, you can change your password without entering the current one.</p>
                ) : (
                  <div><label className="block text-gray-700 mb-2 text-sm font-medium">Current Password</label><input type="password" value={personalData.current_password || ''} onChange={(e) => setPersonalData({ ...personalData, current_password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                )}
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">{user?.google_id ? 'Set Password' : 'New Password'}</label><input type="password" value={personalData.new_password || ''} onChange={(e) => setPersonalData({ ...personalData, new_password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Confirm Password</label><input type="password" value={personalData.new_password_confirmation || ''} onChange={(e) => setPersonalData({ ...personalData, new_password_confirmation: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
              </div>
              <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
                <button onClick={async () => {
                  try {
                    setLoading(true);
                    await request('/change-password', {
                      method: 'POST',
                      body: JSON.stringify({
                        current_password: personalData.current_password,
                        new_password: personalData.new_password,
                        new_password_confirmation: personalData.new_password_confirmation
                      })
                    });
                    setPersonalData({ ...personalData, current_password: '', new_password: '', new_password_confirmation: '' });
                    setEditingSection(null);
                  } catch (error) {
                    console.error('Password change failed:', error);
                  } finally {
                    setLoading(false);
                  }
                }} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 font-medium"><Save className="w-4 h-4" />{loading ? 'Changing...' : 'Change Password'}</button>
                <button onClick={() => setEditingSection(null)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition flex items-center gap-2 font-medium"><X className="w-4 h-4" />Cancel</button>
              </div>
            </>
          ) : (
            <p className="text-gray-600">Click "Change" to update your password</p>
          )}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Educational Background</h2>
            </div>
            {editingSection !== 'education' && (
              <button onClick={() => setEditingSection('education')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">Edit</button>
            )}
          </div>

          {editingSection === 'education' ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Highest Qualification</label><select value={educationData.highest_qualification} onChange={(e) => setEducationData({ ...educationData, highest_qualification: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"><option value="">Select Qualification</option><option>High School</option><option>Bachelor's Degree</option><option>Master's Degree</option><option>Doctorate</option></select></div>
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Institution / University</label><input type="text" value={educationData.institution} onChange={(e) => setEducationData({ ...educationData, institution: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Field of Study / Major</label><input type="text" value={educationData.field_of_study} onChange={(e) => setEducationData({ ...educationData, field_of_study: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="block text-gray-700 mb-2 text-sm font-medium">Graduation Year</label><input type="number" min="1950" max={new Date().getFullYear() + 10} value={educationData.graduation_year} onChange={(e) => setEducationData({ ...educationData, graduation_year: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter year" /></div>
                <div className="md:col-span-2"><label className="block text-gray-700 mb-2 text-sm font-medium">Certifications / Additional Courses</label><textarea value={educationData.certifications} onChange={(e) => setEducationData({ ...educationData, certifications: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" rows={2} /></div>
              </div>
              <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
                <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 font-medium"><Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setEditingSection(null)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition flex items-center gap-2 font-medium"><X className="w-4 h-4" />Cancel</button>
              </div>
            </>
          ) : (
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              <div><p className="text-gray-500 text-sm">Highest Qualification</p><p className="text-gray-900 font-medium">{educationData.highest_qualification}</p></div>
              <div><p className="text-gray-500 text-sm">Institution</p><p className="text-gray-900 font-medium">{educationData.institution}</p></div>
              <div><p className="text-gray-500 text-sm">Field of Study</p><p className="text-gray-900 font-medium">{educationData.field_of_study}</p></div>
              <div><p className="text-gray-500 text-sm">Graduation Year</p><p className="text-gray-900 font-medium">{educationData.graduation_year}</p></div>
              <div className="md:col-span-2"><p className="text-gray-500 text-sm">Certifications</p><p className="text-gray-900 font-medium">{educationData.certifications}</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

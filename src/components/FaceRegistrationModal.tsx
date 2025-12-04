import React, { useState, useEffect } from 'react';
import { X, Camera, User, Upload, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface Profile {
  id: number;
  name: string;
  registered_date: string;
  visit_count: number;
  last_visit: string | null;
}

interface FaceRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FaceRegistrationModal: React.FC<FaceRegistrationModalProps> = ({ isOpen, onClose }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    photo: null as File | null
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
    }
  }, [isOpen]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProfiles(data || []);
      setMessage(null); // Clear any previous errors
    } catch (error) {
      console.error('Error loading profiles:', error);
      setMessage({ text: `Failed to load profiles: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.photo) {
      setMessage({ text: 'Please provide both name and photo for face recognition', type: 'error' });
      return;
    }

    setIsRegistering(true);
    setMessage(null);

    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('photo', formData.photo);

      const response = await fetch('/api/faces/register', {
        method: 'POST',
        body: form
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ text: result.message, type: 'success' });
        setFormData({ name: '', photo: null });
        setPreviewUrl(null);
        
        // Clear form
        const fileInput = document.getElementById('photo') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        loadProfiles();
      } else {
        setMessage({ text: result.error || 'Registration failed', type: 'error' });
      }
    } catch (error) {
      console.error('Error registering face:', error);
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeleteProfile = async (name: string) => {
    if (!window.confirm(`Are you sure you want to delete the profile for ${name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${encodeURIComponent(name)}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ text: result.message, type: 'success' });
        loadProfiles();
      } else {
        setMessage({ text: result.error || 'Delete failed', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Face Registration</h2>
              <p className="text-sm text-gray-600">Register people to improve recognition accuracy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Message */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Registration Form */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Register New Profile</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                  required
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo *
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      id="photo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <label
                      htmlFor="photo"
                      className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors"
                    >
                      <Camera className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {formData.photo ? formData.photo.name : 'Click to select photo'}
                      </span>
                    </label>
                  </div>
                  
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded-md border border-gray-300"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload a clear photo of the person's face for accurate recognition
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRegistering ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Register Profile</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Registered Profiles */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Registered Profiles ({profiles.length})</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                <p className="text-gray-600">Loading profiles...</p>
              </div>
            ) : profiles.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No profiles registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.map((profile) => (
                  <div key={profile.name} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{profile.name}</h4>
                        <p className="text-sm text-gray-600">
                          Registered: {new Date(profile.registered_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Visits: {profile.visit_count}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteProfile(profile.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete profile"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRegistrationModal;

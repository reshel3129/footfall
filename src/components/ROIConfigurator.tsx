import React, { useState, useEffect, useRef } from 'react';
import { X, Save, RotateCcw, Eye, Settings } from 'lucide-react';
import { apiService, ROIConfig, Point } from '../services/api';
import ROICanvas from './ROICanvas';

interface ROIConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreamUrl: string;
}

const ROIConfigurator: React.FC<ROIConfiguratorProps> = ({ isOpen, onClose, currentStreamUrl }) => {
  const [roiConfig, setROIConfig] = useState<ROIConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadROIConfig();
    }
  }, [isOpen]);

  const loadROIConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = await apiService.getROIConfig();
      setROIConfig(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ROI configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (newConfig: ROIConfig) => {
    setROIConfig(newConfig);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!roiConfig) return;

    try {
      setSaving(true);
      setError(null);
      await apiService.saveROIConfig(roiConfig);
      setHasUnsavedChanges(false);
      
      // Optionally restart video processing
      // await apiService.restartVideoProcessing();
      
      alert('ROI configuration saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save ROI configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default ROI configuration?')) {
      const defaultConfig: ROIConfig = {
        line_points: [[300, 150], [300, 310]],
        polygon_points: [[50, 100], [590, 100], [590, 320], [50, 320]]
      };
      setROIConfig(defaultConfig);
      setHasUnsavedChanges(true);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">ROI Configuration</h2>
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 font-medium">• Unsaved changes</span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Loading ROI configuration...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              <button
                onClick={loadROIConfig}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : roiConfig ? (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">How to configure ROI:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Detection Line (Green):</strong> Click and drag to position the line where people cross</li>
                  <li>• <strong>Detection Area (Blue):</strong> Click points to define the area to monitor</li>
                  <li>• <strong>Preview:</strong> Toggle to see how the ROI will look on the live stream</li>
                  <li>• <strong>Save:</strong> Apply the configuration to start using the new ROI</li>
                </ul>
              </div>

              {/* ROI Canvas */}
              <ROICanvas
                config={roiConfig}
                onChange={handleConfigChange}
                streamUrl={currentStreamUrl}
                previewMode={previewMode}
              />

              {/* Tools */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={togglePreview}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                      previewMode 
                        ? 'bg-green-100 text-green-800 border border-green-300' 
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    <span>{previewMode ? 'Preview On' : 'Preview Off'}</span>
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !hasUnsavedChanges}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                      saving || !hasUnsavedChanges
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ROIConfigurator; 
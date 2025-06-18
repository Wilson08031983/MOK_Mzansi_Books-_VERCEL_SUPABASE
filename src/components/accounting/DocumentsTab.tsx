
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  FolderPlus,
  File,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCode,
  Download,
  Share2,
  Trash2,
  MoreVertical,
  Upload,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clock,
  Calendar,
  Folder,
  List,
  Grid
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'spreadsheet' | 'code' | 'other';
  size: number;
  lastModified: string;
  uploadedBy: string;
  path: string[];
  starred: boolean;
  shared: boolean;
}

interface Folder {
  id: string;
  name: string;
  path: string[];
  lastModified: string;
}

const DocumentsTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Fetch folders and documents data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulating API fetch delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In production, these would be API calls
        // setFolders(response.folders);
        // setDocuments(response.documents);
      } catch (error) {
        console.error('Error fetching document data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Get current folders and documents based on path
  const currentFolders = folders.filter(folder => 
    JSON.stringify(folder.path) === JSON.stringify(currentPath)
  );
  
  const currentDocuments = documents.filter(document => 
    JSON.stringify(document.path) === JSON.stringify(currentPath)
  );

  // Filter items based on search and type
  const filteredFolders = currentFolders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredDocuments = currentDocuments.filter(document =>
    document.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (typeFilter === 'all' || document.type === typeFilter)
  );

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get icon for document type
  const getDocumentIcon = (type: string, className = "h-5 w-5") => {
    switch (type) {
      case 'pdf':
        return <FileText className={`${className} text-red-500`} />;
      case 'doc':
        return <FileText className={`${className} text-blue-500`} />;
      case 'image':
        return <FileImage className={`${className} text-purple-500`} />;
      case 'spreadsheet':
        return <FileSpreadsheet className={`${className} text-green-500`} />;
      case 'code':
        return <FileCode className={`${className} text-gray-500`} />;
      default:
        return <File className={`${className} text-gray-400`} />;
    }
  };

  // Handle folder click
  const handleFolderClick = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setCurrentPath([...currentPath, folder.name]);
    }
  };

  // Navigate up one level
  const handleBackClick = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  // Navigate to specific path level
  const navigateToPath = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  // Handle item selection
  const handleItemSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Create new folder
  const handleCreateFolder = () => {
    const newFolder: Folder = {
      id: `folder-${folders.length + 1}`,
      name: `New Folder ${folders.length + 1}`,
      path: currentPath,
      lastModified: new Date().toISOString().split('T')[0]
    };
    
    setFolders([...folders, newFolder]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Document Management</h2>
          <p className="text-slate-600">Store, organize and share your business documents</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-colored-lg transition-all duration-300 flex items-center space-x-1"
          >
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </button>
          
          <button
            onClick={handleCreateFolder}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-1"
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Folder</span>
          </button>
        </div>
      </div>
      
      {/* Navigation Breadcrumbs */}
      <div className="flex items-center space-x-1 text-sm">
        <button
          onClick={() => setCurrentPath([])}
          className="text-mokm-purple-600 hover:underline flex items-center"
        >
          <Folder className="h-4 w-4 mr-1" />
          Home
        </button>
        
        {currentPath.map((path, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
            <button
              onClick={() => navigateToPath(index)}
              className="text-mokm-purple-600 hover:underline"
            >
              {path}
            </button>
          </div>
        ))}
      </div>
      
      {/* Filters and Actions */}
      <div className="glass backdrop-blur-xl bg-white/80 border border-white/20 shadow-business p-4 rounded-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-10 w-full md:w-64 rounded-md border border-slate-200 bg-white px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mokm-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>Type:</span>
          </div>
          
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mokm-purple-500 focus-visible:ring-offset-2"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="doc">Document</option>
              <option value="image">Image</option>
              <option value="spreadsheet">Spreadsheet</option>
              <option value="code">Code</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="ml-auto flex items-center space-x-2">
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-mokm-purple-100 text-mokm-purple-600' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-mokm-purple-100 text-mokm-purple-600' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {selectedItems.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600">{selectedItems.length} item(s) selected</span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  alert(`Downloading ${selectedItems.length} item(s)...`);
                  setSelectedItems([]);
                }} 
                className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-1 text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              <button 
                onClick={() => {
                  alert(`Sharing ${selectedItems.length} item(s)...`);
                  setSelectedItems([]);
                }}
                className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-1 text-sm"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button 
                onClick={() => {
                  alert(`Deleted ${selectedItems.length} item(s)`);
                  setSelectedItems([]);
                }}
                className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 text-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Back Button */}
      {currentPath.length > 0 && (
        <button
          onClick={handleBackClick}
          className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      )}
      
      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredFolders.map(folder => (
            <div 
              key={folder.id}
              onClick={() => handleFolderClick(folder.id)}
              className="glass backdrop-blur-xl bg-white/80 border border-white/20 shadow-business p-4 rounded-xl cursor-pointer hover:shadow-business-lg transition-all duration-300 hover-lift"
            >
              <div className="flex flex-col items-center text-center">
                <Folder className="h-12 w-12 text-mokm-purple-600 mb-2" />
                <div className="font-medium text-sm truncate w-full">{folder.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(folder.lastModified).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
          
          {filteredDocuments.map(document => (
            <div 
              key={document.id}
              className="glass backdrop-blur-xl bg-white/80 border border-white/20 shadow-business p-4 rounded-xl relative group hover:shadow-business-lg transition-all duration-300"
            >
              <div 
                className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemSelect(document.id);
                }}
              >
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(document.id)}
                  className="h-4 w-4 text-mokm-purple-600 rounded"
                  onChange={() => {}}
                />
              </div>
              
              <div className="flex flex-col items-center text-center">
                {getDocumentIcon(document.type, "h-12 w-12")}
                <div className="font-medium text-sm truncate w-full mt-2">{document.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatFileSize(document.size)}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(document.lastModified).toLocaleDateString()}
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t flex justify-center space-x-1">
                <button 
                  onClick={() => alert(`Downloading ${document.name}...`)} 
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => alert(`Sharing ${document.name}...`)} 
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => alert(`More options for ${document.name}`)} 
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          
          {filteredFolders.length === 0 && filteredDocuments.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-500">No documents found</h3>
              <p className="mt-1 text-gray-400">
                Upload documents or create folders to get started
              </p>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-colored-lg transition-all duration-300 flex items-center space-x-1"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-1"
                >
                  <FolderPlus className="h-4 w-4" />
                  <span>New Folder</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* List View */}
      {view === 'list' && (
        <div className="glass backdrop-blur-xl bg-white/80 border border-white/20 shadow-business rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            {(filteredFolders.length > 0 || filteredDocuments.length > 0) ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="w-8 py-3 px-4">
                      <input 
                        type="checkbox"
                        className="h-4 w-4 text-mokm-purple-600 rounded"
                        onChange={() => {}}
                      />
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFolders.map(folder => (
                    <tr 
                      key={folder.id}
                      className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                      onClick={() => handleFolderClick(folder.id)}
                    >
                      <td className="py-3 px-4">
                        <input 
                          type="checkbox"
                          className="h-4 w-4 text-mokm-purple-600 rounded"
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleItemSelect(folder.id)}
                          checked={selectedItems.includes(folder.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Folder className="h-5 w-5 text-mokm-purple-600 mr-2" />
                          <span className="font-medium">{folder.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">Folder</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">-</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{new Date(folder.lastModified).toLocaleDateString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">-</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredDocuments.map(document => (
                    <tr 
                      key={document.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <input 
                          type="checkbox"
                          className="h-4 w-4 text-mokm-purple-600 rounded"
                          onChange={() => handleItemSelect(document.id)}
                          checked={selectedItems.includes(document.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {getDocumentIcon(document.type)}
                          <span className="ml-2">{document.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm capitalize">{document.type}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{formatFileSize(document.size)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{new Date(document.lastModified).toLocaleDateString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{document.uploadedBy}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => alert(`Downloading ${document.name}...`)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => alert(`Sharing ${document.name}...`)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => alert(`More options for ${document.name}`)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-gray-300" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-500">No documents found</h3>
                <p className="mt-1 text-gray-400">
                  Upload documents or create folders to get started
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-colored-lg transition-all duration-300 flex items-center space-x-1"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </button>
                  <button
                    onClick={handleCreateFolder}
                    className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-1"
                  >
                    <FolderPlus className="h-4 w-4" />
                    <span>New Folder</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Upload Documents</h3>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Drag and drop files here, or click to browse</p>
                <p className="text-gray-500 text-sm mt-2">Supported formats: PDF, DOC, XLS, JPG, PNG, ZIP</p>
                <button 
                  onClick={() => alert('File browser opened')}
                  className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-colored-lg transition-all duration-300 mt-4"
                >
                  Select Files
                </button>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors mr-2"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  alert('Files uploaded successfully!');
                }}
                className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-colored-lg transition-all duration-300"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;

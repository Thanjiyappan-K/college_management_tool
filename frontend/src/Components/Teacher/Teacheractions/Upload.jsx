// Upload.jsx
import React, { useState } from 'react';
import axios from 'axios';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [showFiles, setShowFiles] = useState(false);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:8080/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('File uploaded successfully!');
    } catch (err) {
      alert('File upload failed!');
      console.error(err);
    }
  };

  const getFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8080/files');
      setFiles(response.data);
      setShowFiles(true);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const response = await axios.get(`http://localhost:8080/files/${id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input type="file" onChange={handleChange} />
        <button onClick={handleUpload} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded">
          Upload
        </button>
        <button onClick={getFiles} className="ml-2 px-4 py-2 bg-green-600 text-white rounded">
          Show Files
        </button>
      </div>

      {showFiles && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Uploaded Files</h3>
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.id} className="flex items-center">
                <span>{file.fileName}</span>
                <button
                  onClick={() => handleDownload(file.id, file.fileName)}
                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Upload;

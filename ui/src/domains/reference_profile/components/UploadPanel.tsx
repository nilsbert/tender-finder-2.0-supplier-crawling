import React from 'react';

const UploadPanel = ({ onUploadComplete, type }: any) => {
    return (
        <div style={{ padding: '1rem' }}>
            <h3>Upload Panel Placeholder ({type})</h3>
            <button onClick={onUploadComplete}>Complete Upload</button>
        </div>
    );
};

export default UploadPanel;

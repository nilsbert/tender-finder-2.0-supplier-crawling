import React from 'react';

const ProfileForm = ({ initialData, onSubmit, onCancel, isSubmitting }: any) => {
    return (
        <div style={{ padding: '1rem' }}>
            <h3>Profile Form Placeholder</h3>
            <button onClick={() => onSubmit(initialData)}>Submit</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    );
};

export default ProfileForm;

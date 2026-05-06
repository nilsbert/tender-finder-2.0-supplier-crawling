import React from 'react';

const ReferenceForm = ({ initialData, onSubmit, onCancel, isSubmitting }: any) => {
    return (
        <div style={{ padding: '1rem' }}>
            <h3>Reference Form Placeholder</h3>
            <button onClick={() => onSubmit(initialData)}>Submit</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    );
};

export default ReferenceForm;

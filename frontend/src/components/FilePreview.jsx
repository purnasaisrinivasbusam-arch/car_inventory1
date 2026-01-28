import React from 'react'

export default function FilePreview({ files, onRemove }) {
  if (!files?.length) return null;

  return (
    <div className="d-flex flex-wrap gap-2 mt-2">
      {Array.from(files).map((file, i) => (
        <div key={i} className="position-relative" style={{ width: 100, height: 100 }}>
          <img 
            src={URL.createObjectURL(file)} 
            alt={`preview ${i}`}
            className="img-thumbnail"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {onRemove && (
            <button 
              type="button"
              className="btn btn-sm btn-danger position-absolute top-0 end-0"
              onClick={() => onRemove(i)}
              style={{ padding: '0 6px' }}
            >×</button>
          )}
        </div>
      ))}
    </div>
  )
}

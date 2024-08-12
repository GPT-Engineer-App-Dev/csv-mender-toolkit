import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import CSVTable from './CSVTable';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, Upload } from 'lucide-react';

const CSVManager = () => {
  const [csvData, setCSVData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    Papa.parse(file, {
      complete: (results) => {
        setHeaders(results.data[0]);
        setCSVData(results.data.slice(1));
      },
      header: false,
      error: (error) => {
        setError('Error parsing CSV file: ' + error.message);
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: '.csv' });

  const handleAddRow = () => {
    const newRow = headers.map(() => '');
    setCSVData([...csvData, newRow]);
  };

  const handleDeleteRow = (index) => {
    const newData = csvData.filter((_, i) => i !== index);
    setCSVData(newData);
  };

  const handleEditCell = (rowIndex, colIndex, value) => {
    const newData = csvData.map((row, i) =>
      i === rowIndex ? row.map((cell, j) => (j === colIndex ? value : cell)) : row
    );
    setCSVData(newData);
  };

  const handleDownload = () => {
    const csv = Papa.unparse([headers, ...csvData]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'exported_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">CSV File Manager</h1>
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the CSV file here ...</p>
        ) : (
          <div>
            <Upload className="mx-auto mb-2" />
            <p>Drag 'n' drop a CSV file here, or click to select one</p>
          </div>
        )}
      </div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {csvData.length > 0 && (
        <>
          <CSVTable
            headers={headers}
            data={csvData}
            onEditCell={handleEditCell}
            onDeleteRow={handleDeleteRow}
          />
          <div className="mt-4 space-x-2">
            <Button onClick={handleAddRow}>Add Row</Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download CSV
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CSVManager;
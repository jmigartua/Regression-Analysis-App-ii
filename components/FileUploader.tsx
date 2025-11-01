
import React, { useRef } from 'react';
import { UploadCloud, PlusSquare, XCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
  file: File | null;
}

const ActionButton: React.FC<{ icon: React.ReactNode; text: string; onClick?: () => void; disabled?: boolean }> = ({ icon, text, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center px-2 py-1.5 text-left text-text-primary dark:text-gray-300 hover:bg-black/5 dark:hover:bg-accent/20 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {icon}
    <span>{text}</span>
  </button>
);


export const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange, file }) => {
  const { t } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
    }
     // Reset the input value to allow re-uploading the same file
    if(e.target) {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-1">
      <ActionButton
        icon={<UploadCloud className="w-4 h-4 mr-2 flex-shrink-0" />}
        text={t('uploader.upload_csv')}
        onClick={handleUploadClick}
      />
      <ActionButton
        icon={<PlusSquare className="w-4 h-4 mr-2 flex-shrink-0" />}
        text={t('uploader.new_table')}
        disabled
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".csv"
        onChange={handleFileSelect}
      />
      <div className="pt-2">
        {file ? (
          <div className="text-xs text-text-secondary dark:text-gray-300 p-2 bg-bg-default dark:bg-dark-bg rounded-md flex justify-between items-center">
            <span className="truncate pr-2">{file.name}</span>
             <button onClick={() => onFileChange(null)} className="ml-1 text-text-tertiary dark:text-gray-500 hover:text-text-primary dark:hover:text-white flex-shrink-0">
                <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-text-tertiary dark:text-gray-500 px-2 py-1">{t('uploader.no_folder')}</div>
        )}
      </div>
    </div>
  );
};

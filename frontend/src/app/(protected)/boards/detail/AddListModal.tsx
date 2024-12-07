import { Button } from '@/components/ui/button';
import React, { useState } from 'react';

interface AddListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddList: (listName: string) => void;
}

const AddListModal: React.FC<AddListModalProps> = ({ isOpen, onClose, onAddList }) => {
  const [listName, setListName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (listName.trim()) {
      await onAddList(listName);
      setListName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Add New List</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Enter list name"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <Button
              type="submit"
            >
              Add List
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListModal;
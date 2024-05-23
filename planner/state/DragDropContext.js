import React, {createContext, useContext, useState} from 'react';

const DragDropContext = createContext();

export const useDragDrop = () => useContext(DragDropContext);

export const DragDropProvider = ({children}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleDragStart = item => {
    setDraggedItem(item);
    setDragging(true);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    // setDragPosition({x: 0, y: 0});
    setDragging(false);
  };

  return (
    <DragDropContext.Provider
      value={{
        draggedItem,
        dragging,
        handleDragStart,
        handleDragEnd,
      }}>
      {children}
    </DragDropContext.Provider>
  );
};

import FileSaver from 'file-saver';

// use the file-saver package to save to the user's computer
// set stringify to false if the exported csv isn't viewable
export const exportToCsv = (data, fileName, stringify = true) => {
  if (stringify) {
    data = JSON.stringify(data);
  }
  const blob = new Blob([data], { type: 'text/csv' });
  FileSaver.saveAs(blob, `${fileName}.csv`); 
};

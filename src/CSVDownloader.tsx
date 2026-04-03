export const CSVDownloader = () => {
  return (
    <button
      onClick={async () => {
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle("data.csv");
        const file = await fileHandle.getFile();
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      Download CSV
    </button>
  );
};

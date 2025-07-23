/**
 * Local storage utilities for the Romanian language learning app
 */

const STORAGE_KEY = 'romanian-birkenbihl-app';

export function saveLesson(lessonId, lessonData) {
  try {
    const existingData = loadAllLessons();
    existingData[lessonId] = {
      ...lessonData,
      lastModified: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
    return true;
  } catch (error) {
    console.error('Error saving lesson:', error);
    return false;
  }
}

export function loadLesson(lessonId) {
  try {
    const allLessons = loadAllLessons();
    return allLessons[lessonId] || null;
  } catch (error) {
    console.error('Error loading lesson:', error);
    return null;
  }
}

export function loadAllLessons() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading all lessons:', error);
    return {};
  }
}

export function deleteLesson(lessonId) {
  try {
    const existingData = loadAllLessons();
    delete existingData[lessonId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
    return true;
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return false;
  }
}

export function exportLessons() {
  try {
    const allLessons = loadAllLessons();
    const dataStr = JSON.stringify(allLessons, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `romanian-lessons-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting lessons:', error);
    return false;
  }
}

export function importLessons(jsonData) {
  try {
    const importedData = JSON.parse(jsonData);
    const existingData = loadAllLessons();
    const mergedData = { ...existingData, ...importedData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
    return true;
  } catch (error) {
    console.error('Error importing lessons:', error);
    return false;
  }
}

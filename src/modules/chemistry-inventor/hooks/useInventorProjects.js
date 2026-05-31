import { useCallback, useEffect, useState } from 'react';

const PROJECTS_KEY = 'cu-chemistry-inventor-projects';
const DRAFT_KEY = 'cu-chemistry-inventor-draft';

const defaultProject = {
  id: 'starter-empty-workspace',
  name: 'Empty Inventor Workspace',
  grade: 'Class 8',
  mode: 'Free Build',
  components: [],
  zoom: 1,
  snapToGrid: true,
  componentCount: 0,
  updatedAt: 'Browser draft',
};

const readJson = (key, fallback) => {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

export function useInventorProjects() {
  const [projects, setProjects] = useState(() => readJson(PROJECTS_KEY, [defaultProject]));
  const [draft, setDraft] = useState(() => readJson(DRAFT_KEY, null));

  useEffect(() => {
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (draft) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const saveProject = useCallback(project => {
    const nextProject = {
      ...project,
      componentCount: project.components?.length || 0,
      updatedAt: new Date().toLocaleString(),
    };
    setProjects(previous => {
      const exists = previous.some(item => item.id === nextProject.id);
      return exists
        ? previous.map(item => item.id === nextProject.id ? nextProject : item)
        : [nextProject, ...previous];
    });
    setDraft(nextProject);
    return nextProject;
  }, []);

  const loadProject = useCallback(projectId => projects.find(project => project.id === projectId) || null, [projects]);

  const persistDraft = useCallback(snapshot => setDraft({
    ...snapshot,
    componentCount: snapshot.components?.length || 0,
    updatedAt: new Date().toLocaleString(),
  }), []);

  return { projects, draft, saveProject, loadProject, persistDraft };
}

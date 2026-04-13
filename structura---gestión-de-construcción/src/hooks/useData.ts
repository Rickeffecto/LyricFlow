import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Structure, Project } from '../types';

export function useData() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Test connection on boot
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!isAuthReady || !user) {
      setStructures([]);
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const structuresQuery = query(
      collection(db, 'structures'), 
      where('ownerUid', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribeStructures = onSnapshot(structuresQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Structure));
      setStructures(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'structures');
    });

    const projectsQuery = query(
      collection(db, 'projects'), 
      where('ownerUid', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    return () => {
      unsubscribeStructures();
      unsubscribeProjects();
    };
  }, [isAuthReady, user]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const addStructure = async (s: Omit<Structure, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const path = 'structures';
    try {
      await addDoc(collection(db, path), {
        ...s,
        ownerUid: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateStructure = async (id: string, s: Omit<Structure, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const path = `structures/${id}`;
    try {
      await updateDoc(doc(db, 'structures', id), {
        ...s,
        updatedAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteStructure = async (id: string) => {
    if (!user) return;
    const path = `structures/${id}`;
    try {
      await deleteDoc(doc(db, 'structures', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const duplicateStructure = async (s: Structure) => {
    if (!user) return;
    const path = 'structures';
    try {
      await addDoc(collection(db, path), {
        name: `${s.name} (Copia)`,
        materials: s.materials,
        ownerUid: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const addProject = async (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!user) return;
    const path = 'projects';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...p,
        ownerUid: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'active',
      });
      return { id: docRef.id, ...p, status: 'active', createdAt: Date.now(), updatedAt: Date.now() } as Project;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return;
    const path = `projects/${id}`;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!user) return;
    const path = `projects/${id}`;
    try {
      await updateDoc(doc(db, 'projects', id), {
        ...updates,
        updatedAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return {
    user,
    isAuthReady,
    loading,
    structures,
    projects,
    login,
    logout,
    addStructure,
    updateStructure,
    deleteStructure,
    duplicateStructure,
    addProject,
    deleteProject,
    updateProject
  };
}


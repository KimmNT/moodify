import { useCallback } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  arrayUnion,
  Firestore,
} from "firebase/firestore";
import { db } from "../../firebase"; // adjust your path

export function useFirebaseHelper(firestore: Firestore = db) {
  /**
   * Add a new document (auto-generated ID)
   */
  const addDocument = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (collectionName: string, data: any) => {
      const colRef = collection(firestore, collectionName);
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: Date.now(),
      });
      return docRef.id;
    },
    [firestore]
  );

  /**
   * Create or overwrite a specific document (with custom ID)
   */
  const setDocument = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (collectionName: string, id: string, data: any) => {
      const docRef = doc(firestore, collectionName, id);
      await setDoc(docRef, {
        ...data,
        createdAt: Date.now(),
      });
    },
    [firestore]
  );

  /**
   * Update a document by ID
   */
  const updateDocument = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (collectionName: string, id: string, updates: any) => {
      const docRef = doc(firestore, collectionName, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Date.now(),
      });
    },
    [firestore]
  );

  /**
   * Append to an array field
   */
  const appendToArrayField = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (collectionName: string, id: string, field: string, item: any) => {
      const docRef = doc(firestore, collectionName, id);
      await updateDoc(docRef, {
        [field]: arrayUnion(item),
        updatedAt: Date.now(),
      });
    },
    [firestore]
  );

  /**
   * Delete a document by ID
   */
  const deleteDocument = useCallback(
    async (collectionName: string, id: string) => {
      const docRef = doc(firestore, collectionName, id);
      await deleteDoc(docRef);
    },
    [firestore]
  );

  /**
   * Get a single document
   */
  const getDocument = useCallback(
    async (collectionName: string, id: string) => {
      const docRef = doc(firestore, collectionName, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
      return null;
    },
    [firestore]
  );

  /**
   * Get all documents in a collection
   */
  const getAllDocuments = useCallback(
    async (collectionName: string) => {
      const colRef = collection(firestore, collectionName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    [firestore]
  );

  const removeItemFromArrayField = useCallback(
    async (
      collectionName: string,
      id: string,
      field: string,
      matchKey: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      matchValue: any
    ) => {
      const docRef = doc(firestore, collectionName, id);
      const snap = await getDoc(docRef);

      if (!snap.exists()) return;

      const data = snap.data();
      const updatedArray = (data[field] || []).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => item[matchKey] !== matchValue
      );

      await updateDoc(docRef, {
        [field]: updatedArray,
        updatedAt: Date.now(),
      });
    },
    [firestore]
  );

  return {
    addDocument,
    setDocument,
    updateDocument,
    appendToArrayField,
    deleteDocument,
    getDocument,
    getAllDocuments,
    removeItemFromArrayField,
  };
}

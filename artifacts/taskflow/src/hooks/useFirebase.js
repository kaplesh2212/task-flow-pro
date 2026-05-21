import { useState, useEffect } from "react";
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
export const useFirebaseData = (collectionName) => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    // Local Storage Fallback Mode
    useEffect(() => {
        if (isFirebaseConfigured)
            return;
        if (!user) {
            setData([]);
            setLoading(false);
            return;
        }
        const key = `infinitodo_local_${user.uid}_${collectionName}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                setData(JSON.parse(stored));
            }
            catch (e) {
                setData([]);
            }
        }
        else {
            setData([]);
        }
        setLoading(false);
    }, [user, collectionName]);
    // Firestore Subscriber Mode
    useEffect(() => {
        if (!isFirebaseConfigured)
            return;
        if (!user) {
            setData([]);
            setLoading(false);
            return;
        }
        const q = query(collection(db, `users/${user.uid}/${collectionName}`), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setData(docs);
            setLoading(false);
        }, (error) => {
            console.error(`Error fetching ${collectionName}:`, error);
            setLoading(false);
        });
        return unsubscribe;
    }, [user, collectionName]);
    const add = async (item) => {
        if (!user)
            return;
        if (!isFirebaseConfigured) {
            const key = `infinitodo_local_${user.uid}_${collectionName}`;
            const newItem = {
                id: Math.random().toString(36).substring(2, 9),
                ...item,
                createdAt: new Date().toISOString(),
            };
            const updated = [newItem, ...data];
            setData(updated);
            localStorage.setItem(key, JSON.stringify(updated));
            return newItem;
        }
        return await addDoc(collection(db, `users/${user.uid}/${collectionName}`), {
            ...item,
            createdAt: new Date().toISOString(),
        });
    };
    const update = async (id, updates) => {
        if (!user)
            return;
        if (!isFirebaseConfigured) {
            const key = `infinitodo_local_${user.uid}_${collectionName}`;
            const updated = data.map(item => item.id === id ? { ...item, ...updates } : item);
            setData(updated);
            localStorage.setItem(key, JSON.stringify(updated));
            return;
        }
        const docRef = doc(db, `users/${user.uid}/${collectionName}`, id);
        await updateDoc(docRef, updates);
    };
    const remove = async (id) => {
        if (!user)
            return;
        if (!isFirebaseConfigured) {
            const key = `infinitodo_local_${user.uid}_${collectionName}`;
            const updated = data.filter(item => item.id !== id);
            setData(updated);
            localStorage.setItem(key, JSON.stringify(updated));
            return;
        }
        const docRef = doc(db, `users/${user.uid}/${collectionName}`, id);
        await deleteDoc(docRef);
    };
    return { data, loading, add, update, remove };
};
// Specialized hook for habits completion logs
export const useHabitLogs = (habitId) => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    // Local Storage Fallback Mode
    useEffect(() => {
        if (isFirebaseConfigured)
            return;
        if (!user || !habitId)
            return;
        const key = `infinitodo_local_${user.uid}_habits_${habitId}_logs`;
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                setLogs(JSON.parse(stored));
            }
            catch (e) {
                setLogs([]);
            }
        }
        else {
            setLogs([]);
        }
    }, [user, habitId]);
    // Firestore Subscriber Mode
    useEffect(() => {
        if (!isFirebaseConfigured)
            return;
        if (!user || !habitId)
            return;
        const q = query(collection(db, `users/${user.uid}/habits/${habitId}/logs`), orderBy("date", "desc"));
        return onSnapshot(q, (snapshot) => {
            setLogs(snapshot.docs.map(doc => doc.data()));
        });
    }, [user, habitId]);
    const toggleLog = async (date, completed) => {
        if (!user)
            return;
        if (!isFirebaseConfigured) {
            const key = `infinitodo_local_${user.uid}_habits_${habitId}_logs`;
            const stored = localStorage.getItem(key);
            let logsList = [];
            if (stored) {
                try {
                    logsList = JSON.parse(stored);
                }
                catch (e) { }
            }
            const existingIdx = logsList.findIndex((l) => l.date === date);
            if (existingIdx !== -1) {
                logsList[existingIdx].completed = completed;
            }
            else {
                logsList.push({ date, completed });
            }
            setLogs([...logsList]);
            localStorage.setItem(key, JSON.stringify(logsList));
            return;
        }
        const logRef = doc(db, `users/${user.uid}/habits/${habitId}/logs`, date);
        await setDoc(logRef, { date, completed });
    };
    return { logs, toggleLog };
};
